import { TestBed } from '@angular/core/testing';

import { FormField } from './form-field';

/**
 * The accessibility contract of this component is the whole point of it, so
 * these tests assert the contract rather than the markup.
 */
describe('FormField', () => {
  async function render(inputs: Record<string, unknown> = {}) {
    const fixture = TestBed.createComponent(FormField);
    fixture.componentRef.setInput('label', 'Email');
    for (const [key, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(key, value);
    }
    await fixture.whenStable();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  it('associates the visible label with the control', async () => {
    const { el } = await render();
    const label = el.querySelector('label')!;
    const input = el.querySelector('input')!;

    expect(label.textContent).toContain('Email');
    expect(label.getAttribute('for')).toBe(input.id);
    expect(input.id).toBeTruthy();
  });

  it('does not report an error before the field is blurred', async () => {
    const { el } = await render({ error: 'Enter a valid email address.' });

    // Complaining mid-typing is hostile, so the message waits for blur.
    expect(el.querySelector('[role="alert"]')).toBeNull();
    expect(el.querySelector('input')!.getAttribute('aria-invalid')).toBeNull();
  });

  it('reports the error after blur, with aria wiring', async () => {
    const { fixture, el } = await render({ error: 'Enter a valid email address.' });
    const input = el.querySelector('input')!;

    input.dispatchEvent(new Event('blur'));
    await fixture.whenStable();

    const alert = el.querySelector('[role="alert"]')!;
    expect(alert.textContent).toContain('Enter a valid email address.');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toContain(alert.id);
  });

  it('pairs the error with an icon, since the palette carries no colour', async () => {
    const { fixture, el } = await render({ error: 'Required.' });
    el.querySelector('input')!.dispatchEvent(new Event('blur'));
    await fixture.whenStable();

    // With a monochrome palette the icon is not decoration — it is the only
    // non-textual signal distinguishing this state.
    expect(el.querySelector('[role="alert"] app-icon')).not.toBeNull();
  });

  it('describes the field by hint first, then error', async () => {
    const { fixture, el } = await render({ hint: 'We only use this to reply.', error: 'Required.' });
    const input = el.querySelector('input')!;

    input.dispatchEvent(new Event('blur'));
    await fixture.whenStable();

    const ids = input.getAttribute('aria-describedby')!.split(' ');
    const hintId = el.querySelector('.field__hint')!.id;
    const errorId = el.querySelector('[role="alert"]')!.id;

    // Rule before complaint, matching the visual order.
    expect(ids).toEqual([hintId, errorId]);
  });

  it('announces required state to assistive tech, not just with an asterisk', async () => {
    const { el } = await render({ required: true });

    expect(el.querySelector('.sr-only')!.textContent).toContain('required');
    expect(el.querySelector('input')!.hasAttribute('required')).toBe(true);
  });

  it('sets an inputmode that surfaces the right mobile keyboard', async () => {
    const { el: email } = await render({ type: 'email' });
    expect(email.querySelector('input')!.getAttribute('inputmode')).toBe('email');

    const { el: tel } = await render({ type: 'tel' });
    expect(tel.querySelector('input')!.getAttribute('inputmode')).toBe('tel');

    const { el: text } = await render({ type: 'text' });
    expect(text.querySelector('input')!.getAttribute('inputmode')).toBeNull();
  });

  it('renders a textarea when multiline', async () => {
    const { el } = await render({ multiline: true, rows: 3 });

    expect(el.querySelector('textarea')).not.toBeNull();
    expect(el.querySelector('input')).toBeNull();
  });
});
