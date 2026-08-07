import { TestBed } from '@angular/core/testing';

import { DirectionService } from './direction.service';

/**
 * This service is the seam Sprint 3 replaces with Angular's compile-time
 * LOCALE_ID, so these tests pin the CONTRACT rather than the mechanism: whatever
 * drives it, `dir` and `lang` must end up on the document root, because that
 * plus logical CSS is what keeps RTL from becoming a component fork.
 */
describe('DirectionService', () => {
  afterEach(() => {
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
    try {
      localStorage.removeItem('ay-dev-locale');
    } catch {
      // storage unavailable; nothing to clean up
    }
  });

  it('defaults to English, left-to-right', () => {
    const service = TestBed.inject(DirectionService);

    expect(service.locale()).toBe('en');
    expect(service.dir()).toBe('ltr');
    expect(service.isRtl()).toBe(false);
  });

  it('writes lang and dir onto the document root', () => {
    const service = TestBed.inject(DirectionService);
    TestBed.tick();

    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');

    service.set('ar');
    TestBed.tick();

    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
  });

  it('toggles between the two locales', () => {
    const service = TestBed.inject(DirectionService);

    service.toggle();
    expect(service.locale()).toBe('ar');
    expect(service.isRtl()).toBe(true);

    service.toggle();
    expect(service.locale()).toBe('en');
    expect(service.isRtl()).toBe(false);
  });

  it('persists the choice so a dev reload keeps the direction', () => {
    const service = TestBed.inject(DirectionService);
    service.set('ar');
    TestBed.tick();

    expect(localStorage.getItem('ay-dev-locale')).toBe('ar');
  });
});
