import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ShellUiService } from '@core/shell/shell-ui.service';
import { MobileNav } from './mobile-nav';

/**
 * These lock the accessibility contract, which is the whole reason this
 * component exists as more than a styled list: an overlay that traps scroll and
 * attention has to be escapable, and it has to hand focus back.
 */
describe('MobileNav', () => {
  let shell: ShellUiService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileNav],
      providers: [provideRouter([])],
    }).compileComponents();

    shell = TestBed.inject(ShellUiService);
  });

  afterEach(() => {
    shell.close();
    TestBed.tick();
    document.documentElement.style.overflow = '';
  });

  async function render() {
    const fixture = TestBed.createComponent(MobileNav);
    await fixture.whenStable();
    return fixture;
  }

  it('renders nothing while closed', async () => {
    const fixture = await render();
    const el = fixture.nativeElement as HTMLElement;

    // Not merely hidden — absent. A closed panel must not be in the
    // accessibility tree or the tab order at all.
    expect(el.querySelector('[role="dialog"]')).toBeNull();
  });

  it('renders a modal dialog with an accessible name when open', async () => {
    const fixture = await render();
    shell.open();
    await fixture.whenStable();

    const dialog = (fixture.nativeElement as HTMLElement).querySelector('[role="dialog"]')!;
    expect(dialog).not.toBeNull();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-label')).toBe('Navigation');
  });

  it('renders every primary link', async () => {
    const fixture = await render();
    shell.open();
    await fixture.whenStable();

    const labels = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.panel__link'),
    ).map((a) => a.textContent?.trim());

    expect(labels).toEqual(['Work', 'About', 'CV', 'Contact']);
  });

  it('closes on Escape', async () => {
    const fixture = await render();
    shell.open();
    await fixture.whenStable();

    const dialog = (fixture.nativeElement as HTMLElement).querySelector('[role="dialog"]')!;
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();

    expect(shell.menuOpen()).toBe(false);
  });

  it('closes the panel via the close button', async () => {
    const fixture = await render();
    shell.open();
    await fixture.whenStable();

    const close = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '.panel__close',
    )!;
    expect(close.getAttribute('aria-label')).toBe('Close navigation menu');

    close.click();
    await fixture.whenStable();

    expect(shell.menuOpen()).toBe(false);
  });

  it('locks and releases document scroll', async () => {
    const fixture = await render();

    shell.open();
    await fixture.whenStable();
    // Without this the page behind the panel scrolls under the user's finger.
    expect(document.documentElement.style.overflow).toBe('hidden');

    shell.close();
    await fixture.whenStable();
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('keeps the AY mark visible while open', async () => {
    const fixture = await render();
    shell.open();
    await fixture.whenStable();

    // The mark staying put is what stops the header appearing to jump on open.
    expect((fixture.nativeElement as HTMLElement).querySelector('app-logo')).not.toBeNull();
  });
});
