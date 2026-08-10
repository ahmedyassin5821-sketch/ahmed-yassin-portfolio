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
    const cards = el.querySelectorAll('app-work-row');

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

  it('shows a real screenshot for every project, in both image paths', async () => {
    const { el } = await render();

    // Every project has supplied assets now, so there is no placeholder path
    // left to take — and none is faked to fill a gap.
    expect(el.querySelectorAll('.row__media img').length).toBe(PROJECTS.length);
    expect(el.querySelectorAll('.preview__plate img').length).toBe(PROJECTS.length);
  });

  it('shows each client’s own mark beside their name', async () => {
    const { el } = await render();
    const rows = Array.from(el.querySelectorAll('app-work-row'));

    rows.forEach((row, i) => {
      const img = row.querySelector<HTMLImageElement>('.row__logo img');
      expect(img?.getAttribute('src')).toBe(PROJECTS[i].logo.src);
      // Decorative: the name is right beside it as real text, so an alt would
      // only repeat it.
      expect(img?.getAttribute('alt')).toBe('');
      expect(row.querySelector('.row__logo')?.getAttribute('aria-hidden')).toBe('true');
    });
  });

  it('drives the logo from the same active state as the row and the pane', async () => {
    const { fixture, el } = await render();
    const rows = Array.from(el.querySelectorAll('app-work-row'));

    // There is one source of truth for which project is active. The logo has no
    // state of its own — it reads `.is-active` on the row host, exactly as the
    // name, the numeral and the preview pane do.
    rows[4].querySelector('.row')!.dispatchEvent(new PointerEvent('pointerenter'));
    await fixture.whenStable();

    expect(rows[4].classList).toContain('is-active');
    expect(rows[4].querySelector('.row__logo')).not.toBeNull();
    expect(rows.filter((r) => r.classList.contains('is-active')).length).toBe(1);
  });

  it('states what each business is, not only what it was built with', async () => {
    const { el } = await render();

    for (const project of PROJECTS) {
      const text = el.textContent ?? '';
      expect(text).toContain(project.field.en);
      expect(text).toContain(project.market.en);
      expect(text).toContain(project.domain.en);
    }
  });

  it('links every card to its detail route', async () => {
    const { el } = await render();
    const links = Array.from(el.querySelectorAll<HTMLAnchorElement>('.row__link'));

    expect(links.length).toBe(PROJECTS.length);
    for (const project of PROJECTS) {
      expect(links.some((a) => a.getAttribute('href') === `/work/${project.slug}`)).toBe(true);
    }
  });

  it('distinguishes a live address from an internal system', async () => {
    const { el } = await render();
    const text = Array.from(el.querySelectorAll('.row__status')).map((m) =>
      m.textContent?.trim(),
    );

    // Every row states its status as text; a pill made "internal" read as a
    // disabled control.
    expect(text.length).toBe(PROJECTS.length);

    const count = (label: string) => text.filter((t) => t?.includes(label)).length;

    // NAS HR has no public address because it is an internal system. Derived
    // from `url`, so the label can never disagree with whether a link renders.
    expect(count(WORK_CONTENT.actions.private.en)).toBe(
      PROJECTS.filter((p) => p.url === null).length,
    );
    expect(count('Live')).toBe(PROJECTS.filter((p) => p.url !== null).length);
  });

  it('follows the reader with the preview, from pointer and from keyboard alike', async () => {
    const { fixture, el } = await render();
    const rows = Array.from(el.querySelectorAll('app-work-row'));
    const plate = (slug: string) =>
      el.querySelectorAll('.preview__plate')[PROJECTS.findIndex((p) => p.slug === slug)];

    // Before any interaction the pane already shows real work.
    expect(plate(PROJECTS[0].slug).classList).toContain('is-active');

    // Pointer.
    rows[3].querySelector('.row')!.dispatchEvent(new PointerEvent('pointerenter'));
    await fixture.whenStable();
    expect(plate(PROJECTS[3].slug).classList).toContain('is-active');
    expect(rows[3].classList).toContain('is-active');

    // Keyboard. `focusin` bubbles from the row's link, so tabbing through the
    // index drives the pane exactly as hovering does — the pane must not be a
    // mouse-only affordance.
    rows[5].querySelector<HTMLAnchorElement>('.row__link')!.dispatchEvent(
      new FocusEvent('focusin', { bubbles: true }),
    );
    await fixture.whenStable();
    expect(plate(PROJECTS[5].slug).classList).toContain('is-active');
    expect(rows[3].classList).not.toContain('is-active');
  });

  it('lazy-loads every row image, and loads the preview lead eagerly', async () => {
    const { el } = await render();
    const rowImages = Array.from(el.querySelectorAll<HTMLImageElement>('.row__image'));
    const previewImages = Array.from(
      el.querySelectorAll<HTMLImageElement>('.preview__image'),
    );

    // Row images only render below md; they are never the LCP candidate.
    expect(rowImages.every((i) => i.getAttribute('loading') === 'lazy')).toBe(true);

    // The pane shows the first project before any interaction, so it loads eagerly.
    expect(previewImages[0]?.getAttribute('loading')).toBe('eager');
    expect(previewImages.slice(1).every((i) => i.getAttribute('loading') === 'lazy')).toBe(true);
  });

  it('gives every row image alt text and an intrinsic size', async () => {
    const { el } = await render();

    for (const img of Array.from(el.querySelectorAll<HTMLImageElement>('.row__image'))) {
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

    // The business facts are translated too, not left in English beside Arabic.
    for (const project of PROJECTS) {
      expect(text).toContain(project.field.ar);
      expect(text).toContain(project.market.ar);
    }

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

  it('keeps the Latin stack line bidi-isolated in Arabic', async () => {
    const { fixture, el } = await render();

    direction.set('ar');
    await fixture.whenStable();

    // The stack is one joined line now ("Magento · Porto"), not a badge per
    // technology, so it is asserted as a whole string rather than per node.
    const isolated = Array.from(el.querySelectorAll('.ltr-isolate')).map((n) =>
      n.textContent?.trim(),
    );
    expect(isolated.some((t) => t?.startsWith('Angular'))).toBe(true);
    expect(isolated.some((t) => t?.startsWith('Magento'))).toBe(true);
    expect(isolated.some((t) => t?.startsWith('Shopify'))).toBe(true);
  });
});
