import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ShellUiService } from '@core/shell/shell-ui.service';
import { App } from './app';

describe('App shell', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.inject(ShellUiService).close();
    TestBed.tick();
    document.documentElement.style.overflow = '';
  });

  async function render() {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    return fixture;
  }

  it('creates', async () => {
    const fixture = await render();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the landmarks in document order', async () => {
    const el = (await render()).nativeElement as HTMLElement;

    const landmarks = Array.from(el.querySelectorAll('app-header, main, app-footer')).map((n) =>
      n.tagName.toLowerCase(),
    );

    expect(landmarks).toEqual(['app-header', 'main', 'app-footer']);
  });

  it('keeps the skip link as the first focusable element', async () => {
    const el = (await render()).nativeElement as HTMLElement;

    const focusable = el.querySelector('a, button, input, [tabindex]:not([tabindex="-1"])');
    expect(focusable?.classList.contains('skip-link')).toBe(true);
    expect(focusable?.getAttribute('href')).toBe('#main');
  });

  it('exposes a focusable <main> for the skip link and post-navigation focus', async () => {
    const main = ((await render()).nativeElement as HTMLElement).querySelector('main');

    expect(main?.id).toBe('main');
    expect(main?.getAttribute('tabindex')).toBe('-1');
  });

  it('provides a polite live region for route announcements', async () => {
    const el = (await render()).nativeElement as HTMLElement;
    const live = el.querySelector('[aria-live]')!;

    // A client-side route change is otherwise silent to a screen reader.
    expect(live.getAttribute('aria-live')).toBe('polite');
    expect(live.classList.contains('sr-only')).toBe(true);
  });

  it('marks content inert only while the mobile panel is open', async () => {
    const fixture = await render();
    const el = fixture.nativeElement as HTMLElement;
    const shell = TestBed.inject(ShellUiService);

    expect(el.querySelector('main')?.hasAttribute('inert')).toBe(false);

    shell.open();
    await fixture.whenStable();

    // inert is what actually scopes screen readers and pointer input to the
    // panel; the focus trap is only the keyboard backstop.
    expect(el.querySelector('main')?.hasAttribute('inert')).toBe(true);
    expect(el.querySelector('app-footer')?.hasAttribute('inert')).toBe(true);
  });

  it('sets lang and dir on the document root', async () => {
    await render();

    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
  });
});
