import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('creates', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the skip link as the first focusable element', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    const focusable = root.querySelector('a, button, input, [tabindex]:not([tabindex="-1"])');
    expect(focusable?.classList.contains('skip-link')).toBe(true);
    expect(focusable?.getAttribute('href')).toBe('#main');
  });

  it('exposes a focusable <main> for the skip link to target', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const main = (fixture.nativeElement as HTMLElement).querySelector('main');

    expect(main?.id).toBe('main');
    // -1 keeps it out of the tab order while still allowing programmatic focus.
    expect(main?.getAttribute('tabindex')).toBe('-1');
  });

  it('sets lang and dir on the document root', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    // Written by DirectionService's effect, which also runs during SSR so
    // prerendered HTML carries the attributes without a post-paint mutation.
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
  });
});
