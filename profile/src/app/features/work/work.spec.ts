import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { DirectionService } from '@core/i18n/direction.service';
import { PROJECTS, PROJECTS_SHIPPED } from '@data/projects.data';
import { WORK_CONTENT } from '@data/work.content';
import { Work } from './work';

describe('Work index', () => {
  let direction: DirectionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Work],
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
    const fixture = TestBed.createComponent(Work);
    await fixture.whenStable();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  it('renders exactly the approved showcase, and nothing else', async () => {
    const { el } = await render();
    const cards = el.querySelectorAll('app-project-card');

    // Pinned to the approved slugs rather than a count, so adding a project is
    // a deliberate edit here and not something a test silently absorbs.
    expect(PROJECTS.map((p) => p.slug)).toEqual([
      'nas-hr',
      'nature',
      '2b',
      'esterad',
      'designed-by-g',
      'nader-coffee',
      'vivace',
    ]);
    expect(cards.length).toBe(PROJECTS.length);
  });

  it('keeps the dropped projects gone', async () => {
    const { el } = await render();
    const text = el.textContent ?? '';

    for (const name of ['Kaza', 'Egyptian Treasure', 'Mistka']) {
      expect(text).not.toContain(name);
    }
  });

  it('never implies the showcase is the whole body of work', async () => {
    const { el } = await render();
    const text = el.textContent ?? '';

    // The career total, not the array length. "7 projects" would be false.
    expect(text).toContain(`${PROJECTS_SHIPPED}+`);
    expect(text).not.toMatch(new RegExp(`^\\s*${PROJECTS.length} projects\\b`));
  });

  it('states both totals from data, neither typed as a word', async () => {
    const { el } = await render();
    const text = el.textContent ?? '';

    expect(text).toContain(String(PROJECTS_SHIPPED));
    expect(text).toContain(String(PROJECTS.length));
  });

  it('renders the placeholder frame for a project whose assets are pending', async () => {
    const { el } = await render();
    const pending = PROJECTS.filter((p) => p.cover === null);

    // Vivace today. No stock photography, no borrowed screenshot, no empty box.
    expect(pending.length).toBeGreaterThan(0);
    expect(el.querySelectorAll('app-media-placeholder').length).toBe(pending.length);
  });

  it('links every card to its detail route', async () => {
    const { el } = await render();
    const links = Array.from(el.querySelectorAll<HTMLAnchorElement>('.card__link'));

    expect(links.length).toBe(PROJECTS.length);
    for (const project of PROJECTS) {
      expect(links.some((a) => a.getAttribute('href') === `/work/${project.slug}`)).toBe(true);
    }
  });

  it('marks work with no public URL instead of linking nowhere', async () => {
    const { el } = await render();
    const markers = el.querySelectorAll('.card__private');

    expect(markers.length).toBe(PROJECTS.filter((p) => p.url === null).length);
    expect(markers[0].textContent).toContain(WORK_CONTENT.actions.private.en);
  });

  it('loads the first row eagerly and lazily thereafter', async () => {
    const { el } = await render();
    const images = Array.from(el.querySelectorAll<HTMLImageElement>('.card__image'));

    // Only projects that actually have a cover produce an <img>.
    expect(images.length).toBe(PROJECTS.filter((p) => p.cover !== null).length);
    // The only images that can be above the fold at any supported width.
    expect(images.slice(0, 2).every((i) => i.getAttribute('loading') === 'eager')).toBe(true);
    expect(images.slice(2).every((i) => i.getAttribute('loading') === 'lazy')).toBe(true);
  });

  it('gives every image alt text and an intrinsic size', async () => {
    const { el } = await render();

    for (const img of Array.from(el.querySelectorAll<HTMLImageElement>('.card__image'))) {
      expect(img.getAttribute('alt')?.length).toBeGreaterThan(0);
      expect(Number(img.getAttribute('width'))).toBeGreaterThan(0);
      expect(Number(img.getAttribute('height'))).toBeGreaterThan(0);
      expect(img.getAttribute('srcset')).toBeTruthy();
    }
  });

  it('serves optimised formats only, never the raw source captures', async () => {
    const { el } = await render();
    const srcs = Array.from(el.querySelectorAll<HTMLImageElement>('img')).map(
      (i) => i.getAttribute('src') ?? '',
    );

    // The 38 MB of PNG originals live outside public/ and must never be linked.
    expect(srcs.every((s) => !s.endsWith('.png'))).toBe(true);
    expect(srcs.every((s) => !s.includes('project-assets'))).toBe(true);
  });

  it('translates every visible string into Arabic', async () => {
    const { fixture, el } = await render();

    direction.set('ar');
    await fixture.whenStable();

    const text = el.textContent ?? '';
    expect(text).toContain(WORK_CONTENT.index.title.ar);
    expect(text).toContain(WORK_CONTENT.index.lede.ar);
    expect(text).toContain(WORK_CONTENT.actions.private.ar);

    // And the English equivalents are gone.
    expect(text).not.toContain(WORK_CONTENT.index.lede.en);
    expect(text).not.toContain(WORK_CONTENT.actions.private.en);
  });

  it('uses each brand’s own Arabic name where it has one', async () => {
    const { fixture, el } = await render();

    direction.set('ar');
    await fixture.whenStable();

    const text = el.textContent ?? '';
    // Both are taken from the brands' own logos, not transliterated.
    expect(text).toContain('الطبيعة');
    expect(text).toContain('بن نادر');
  });

  it('keeps Latin technology names bidi-isolated in Arabic', async () => {
    const { fixture, el } = await render();

    direction.set('ar');
    await fixture.whenStable();

    const isolated = Array.from(el.querySelectorAll('.ltr-isolate')).map((n) =>
      n.textContent?.trim(),
    );
    expect(isolated).toContain('Angular');
    expect(isolated).toContain('Magento 2');
    expect(isolated).toContain('Shopify');
  });
});
