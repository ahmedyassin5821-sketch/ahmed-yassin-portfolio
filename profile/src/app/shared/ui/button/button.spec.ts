import { TestBed } from '@angular/core/testing';

import { Button } from './button';

describe('Button', () => {
  async function render(inputs: Record<string, unknown> = {}) {
    const fixture = TestBed.createComponent(Button);
    for (const [key, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(key, value);
    }
    await fixture.whenStable();
    return { fixture, btn: (fixture.nativeElement as HTMLElement).querySelector('button')! };
  }

  it('renders a real button element', async () => {
    const { btn } = await render();
    expect(btn.getAttribute('type')).toBe('button');
  });

  it('blocks interaction and announces busy while loading', async () => {
    const { btn } = await render({ loading: true });

    // Loading must disable: a second click during an async action is the classic
    // double-submit bug.
    expect(btn.disabled).toBe(true);
    expect(btn.getAttribute('aria-busy')).toBe('true');
  });

  it('keeps the spinner animating under reduced motion', async () => {
    const { fixture } = await render({ loading: true });
    const spinner = (fixture.nativeElement as HTMLElement).querySelector('.btn__spinner')!;

    // A spinner reports state, so freezing it removes information rather than
    // discomfort. The global reduced-motion reset exempts this attribute.
    expect(spinner.hasAttribute('data-motion-essential')).toBe(true);
  });

  it('hides the leading icon while loading so width does not jump', async () => {
    const { fixture } = await render({ iconStart: 'mail', loading: true });
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.btn__spinner')).not.toBeNull();
    expect(el.querySelector('app-icon')).toBeNull();
  });

  it('does not emit when disabled', async () => {
    const { fixture, btn } = await render({ disabled: true });
    let emitted = 0;
    fixture.componentInstance.pressed.subscribe(() => emitted++);

    btn.click();
    await fixture.whenStable();

    expect(emitted).toBe(0);
  });

  it('emits when pressed', async () => {
    const { fixture, btn } = await render();
    let emitted = 0;
    fixture.componentInstance.pressed.subscribe(() => emitted++);

    btn.click();
    await fixture.whenStable();

    expect(emitted).toBe(1);
  });
});
