import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { DirectionService } from '@core/i18n/direction.service';
import { HOME_CONTENT } from '@data/home.content';
import { FEATURED_PROJECTS, PLATFORM_GROUPS, PROJECTS } from '@data/projects.data';
import { Home } from './home';

describe('Home', () => {
  let direction: DirectionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([])],
    }).compileComponents();

    direction = TestBed.inject(DirectionService);
    direction.set('en');
    TestBed.tick();
  });

  afterEach(() => {
    direction.set('en');
    TestBed.tick();
  });

  async function render() {
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  it('renders exactly one h1, and it is the identity', async () => {
    const { el } = await render();
    const h1s = el.querySelectorAll('h1');

    expect(h1s.length).toBe(1);
    expect(h1s[0].textContent?.trim()).toBe('Ahmed Yassin');
  });

  it('renders the LCP heading as plain text, outside any deferred block', async () => {
    const { el } = await render();
    const h1 = el.querySelector('h1')!;

    // The identity must never depend on WebGL, GSAP, or a deferred chunk. If a
    // future change moves it inside @defer, this fails.
    expect(h1.closest('app-strata-canvas')).toBeNull();
    expect(h1.textContent?.trim().length).toBeGreaterThan(0);
  });

  it('renders a single landmark heading hierarchy without skipping levels', async () => {
    const { el } = await render();
    const levels = Array.from(el.querySelectorAll('h1, h2, h3')).map((h) =>
      Number(h.tagName.slice(1)),
    );

    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
    }
  });

  it('renders every platform group and its projects', async () => {
    const { el } = await render();
    const text = el.textContent ?? '';

    for (const group of PLATFORM_GROUPS) {
      expect(text).toContain(group.label);
      for (const project of group.projects) {
        expect(text).toContain(project.name);
      }
    }
  });

  it('renders the featured projects in selected work', async () => {
    const { el } = await render();
    const surfaces = el.querySelectorAll('app-project-surface');

    expect(surfaces.length).toBe(FEATURED_PROJECTS.length);
  });

  it('never renders a project link without a confirmed URL', async () => {
    const { el } = await render();

    // Every project currently has url: null. A guessed URL in a portfolio is a
    // broken link a recruiter clicks, so absence must render as plain text.
    for (const anchor of Array.from(el.querySelectorAll('.surface__link'))) {
      expect(anchor.getAttribute('href')).toBeTruthy();
    }
  });

  it('shows the placeholder frame while real screenshots are missing', async () => {
    const { el } = await render();

    expect(el.querySelectorAll('app-media-placeholder').length).toBe(FEATURED_PROJECTS.length);
  });

  it('states a project total that matches the data', async () => {
    const { el } = await render();
    expect(el.textContent).toContain(String(PROJECTS.length));
  });

  it('switches every string to Arabic', async () => {
    const { fixture, el } = await render();

    direction.set('ar');
    await fixture.whenStable();

    const text = el.textContent ?? '';
    expect(text).toContain(HOME_CONTENT.hero.name.ar);
    expect(text).toContain(HOME_CONTENT.hero.role.ar);
    expect(text).toContain(HOME_CONTENT.strata.title.ar);
    expect(text).toContain(HOME_CONTENT.work.title.ar);

    // And the English equivalents are gone.
    expect(text).not.toContain(HOME_CONTENT.hero.role.en);
    expect(text).not.toContain(HOME_CONTENT.strata.title.en);
  });

  it('keeps project and platform names Latin in Arabic, isolated for bidi', async () => {
    const { fixture, el } = await render();

    direction.set('ar');
    await fixture.whenStable();

    // Proper nouns stay Latin, but must be bidi-isolated or trailing
    // punctuation jumps to the wrong side of the line.
    const isolated = Array.from(el.querySelectorAll('.ltr-isolate')).map((n) =>
      n.textContent?.trim(),
    );
    expect(isolated).toContain('Angular');
    expect(isolated).toContain('Magento');
    expect(isolated).toContain('Shopify');
  });

  it('renders the static strata composition regardless of WebGL', async () => {
    const { el } = await render();

    // In the test environment WebGL is unavailable, so this is the no-WebGL
    // path: the poster must carry the composition on its own.
    expect(el.querySelector('app-strata-poster')).not.toBeNull();
    expect(el.querySelector('app-strata-canvas')).toBeNull();
  });

  it('builds the poster from the real monogram geometry', async () => {
    const { el } = await render();
    const paths = el.querySelectorAll('app-strata-poster path');

    expect(paths.length).toBeGreaterThan(1);
    // The same path constant the logo and the WebGL scene use.
    expect(paths[0].getAttribute('d')).toContain('M165.03 311.98');
  });

  it('hides decorative visuals from assistive technology', async () => {
    const { el } = await render();

    expect(el.querySelector('app-strata-poster svg')?.getAttribute('aria-hidden')).toBe('true');
  });
});
