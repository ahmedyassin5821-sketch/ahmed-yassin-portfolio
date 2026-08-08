import { TestBed } from '@angular/core/testing';

import { DirectionService } from '@core/i18n/direction.service';
import { LanguageSwitcher } from './language-switcher';

describe('LanguageSwitcher', () => {
  let direction: DirectionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LanguageSwitcher] }).compileComponents();
    direction = TestBed.inject(DirectionService);
    direction.set('en');
    TestBed.tick();
  });

  afterEach(() => {
    direction.set('en');
    TestBed.tick();
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
  });

  async function render() {
    const fixture = TestBed.createComponent(LanguageSwitcher);
    await fixture.whenStable();
    return fixture;
  }

  it('renders both languages as anchors', async () => {
    const links = (await render()).nativeElement.querySelectorAll('a.switcher__link');

    // Anchors, not buttons: when compile-time i18n lands these become /en and
    // /ar hrefs with no structural change.
    expect(links.length).toBe(2);
    expect(links[0].textContent?.trim()).toBe('EN');
    expect(links[1].textContent?.trim()).toBe('العربية');
  });

  it('labels each anchor with its own language', async () => {
    const links = (await render()).nativeElement.querySelectorAll('a.switcher__link');

    // Per-anchor lang is what makes the Arabic label render in the Arabic face
    // and a screen reader switch voice for it.
    expect(links[0].getAttribute('lang')).toBe('en');
    expect(links[0].getAttribute('hreflang')).toBe('en');
    expect(links[1].getAttribute('lang')).toBe('ar');
    expect(links[1].getAttribute('hreflang')).toBe('ar');
  });

  it('marks the active language and only that one', async () => {
    const fixture = await render();
    let links = fixture.nativeElement.querySelectorAll('a.switcher__link');

    expect(links[0].getAttribute('aria-current')).toBe('true');
    expect(links[1].getAttribute('aria-current')).toBeNull();

    direction.set('ar');
    await fixture.whenStable();

    links = fixture.nativeElement.querySelectorAll('a.switcher__link');
    expect(links[0].getAttribute('aria-current')).toBeNull();
    expect(links[1].getAttribute('aria-current')).toBe('true');
  });

  it('switches direction on click without navigating', async () => {
    const fixture = await render();
    const arabic = fixture.nativeElement.querySelectorAll('a.switcher__link')[1] as HTMLAnchorElement;

    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    arabic.dispatchEvent(event);
    await fixture.whenStable();

    expect(direction.locale()).toBe('ar');
    expect(direction.isRtl()).toBe(true);
    // The href is a real fallback target, so the click must be prevented until
    // the locale builds exist.
    expect(event.defaultPrevented).toBe(true);
  });

  it('exposes a real href so the control degrades without JS', async () => {
    const links = (await render()).nativeElement.querySelectorAll('a.switcher__link');

    expect(links[0].getAttribute('href')).toBe('?lang=en');
    expect(links[1].getAttribute('href')).toBe('?lang=ar');
  });
});
