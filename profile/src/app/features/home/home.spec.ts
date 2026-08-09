import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { DirectionService } from '@core/i18n/direction.service';
import { HOME_CONTENT } from '@data/home.content';
import { PLATFORM_GROUPS, PROJECTS, PROJECTS_SHIPPED } from '@data/projects.data';
import { ACT_TIMELINE } from './animation/act-timeline';
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

    // The identity must never depend on WebGL, GSAP, or a deferred chunk.
    expect(h1.closest('app-strata-canvas')).toBeNull();
    expect(h1.closest('.home__scene')).toBeNull();
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

  // ---------------------------------------------------------------------------
  // The stage
  // ---------------------------------------------------------------------------

  it('lays out one element per act, each carrying its slice of the timeline', async () => {
    const { el } = await render();
    const acts = Array.from(el.querySelectorAll<HTMLElement>('.home__act'));

    expect(acts.length).toBe(ACT_TIMELINE.length);

    acts.forEach((element, i) => {
      expect(element.dataset['act']).toBe(ACT_TIMELINE[i].id);
      // The scene reads the same table. If these disagreed, the text and the
      // camera would drift apart.
      expect(element.style.getPropertyValue('--act-start')).toBe(String(ACT_TIMELINE[i].start));
      expect(element.style.getPropertyValue('--act-end')).toBe(String(ACT_TIMELINE[i].end));
    });
  });

  it('is not staged until the choreography actually starts', async () => {
    const { el } = await render();
    const stage = el.querySelector('.home')!;

    // GSAP never loads in the test environment, which is the same path taken
    // under prefers-reduced-motion. No class means no spacer and no scroll void.
    expect(stage.classList.contains('is-staged')).toBe(false);
    expect((stage as HTMLElement).style.getPropertyValue('--home-screens')).toBe('');
  });

  // ---------------------------------------------------------------------------
  // Content — must be complete without the scene
  // ---------------------------------------------------------------------------

  it('names every platform and every project as real text', async () => {
    const { el } = await render();
    const text = el.textContent ?? '';

    for (const group of PLATFORM_GROUPS) {
      expect(text).toContain(group.label);
    }
    for (const project of PROJECTS) {
      expect(text).toContain(project.name.en);
    }
  });

  it('states the career total, never the size of the showcase', async () => {
    const { el } = await render();
    const text = el.textContent ?? '';

    expect(text).toContain(`${PROJECTS_SHIPPED}+`);
    // "7 projects" would misrepresent the body of work.
    expect(text).not.toContain(`${PROJECTS.length} projects`);
  });

  it('renders a media frame for every project, real or pending', async () => {
    const { el } = await render();
    const images = el.querySelectorAll('.surface__image');
    const placeholders = el.querySelectorAll('app-media-placeholder');

    expect(images.length).toBe(PROJECTS.filter((p) => p.cover !== null).length);
    expect(placeholders.length).toBe(PROJECTS.filter((p) => p.cover === null).length);
    expect(images.length + placeholders.length).toBe(PROJECTS.length);
  });

  it('never renders a project link without a confirmed URL', async () => {
    const { el } = await render();
    const anchors = Array.from(el.querySelectorAll('.surface__link'));

    expect(anchors.length).toBe(PROJECTS.filter((p) => p.url !== null).length);
    for (const anchor of anchors) {
      expect(anchor.getAttribute('href')).toBeTruthy();
    }
  });

  // ---------------------------------------------------------------------------
  // Fallbacks
  // ---------------------------------------------------------------------------

  it('renders the static strata composition regardless of WebGL', async () => {
    const { el } = await render();

    // WebGL is unavailable in the test environment, so this is the no-WebGL
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

  it('hides the decorative scene layer from assistive technology', async () => {
    const { el } = await render();

    expect(el.querySelector('.home__scene')?.getAttribute('aria-hidden')).toBe('true');
    expect(el.querySelector('app-strata-poster svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  // ---------------------------------------------------------------------------
  // Language
  // ---------------------------------------------------------------------------

  it('switches every string to Arabic', async () => {
    const { fixture, el } = await render();

    direction.set('ar');
    await fixture.whenStable();

    const text = el.textContent ?? '';
    expect(text).toContain(HOME_CONTENT.hero.name.ar);
    expect(text).toContain(HOME_CONTENT.hero.role.ar);
    expect(text).toContain(HOME_CONTENT.count.label.ar);
    expect(text).toContain(HOME_CONTENT.count.eyebrow.ar);

    expect(text).not.toContain(HOME_CONTENT.hero.role.en);
    expect(text).not.toContain(HOME_CONTENT.count.label.en);
  });

  it('keeps platform names Latin in Arabic, isolated for bidi', async () => {
    const { fixture, el } = await render();

    direction.set('ar');
    await fixture.whenStable();

    const isolated = Array.from(el.querySelectorAll('.ltr-isolate')).map((n) =>
      n.textContent?.trim(),
    );
    expect(isolated).toContain('Angular');
    expect(isolated).toContain('Magento');
    expect(isolated).toContain('Shopify');
  });
});
