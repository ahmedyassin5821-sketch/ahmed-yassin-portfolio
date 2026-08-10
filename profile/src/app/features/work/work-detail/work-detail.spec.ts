import { ComponentRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { DirectionService } from '@core/i18n/direction.service';
import { PROJECTS, projectBySlug } from '@data/projects.data';
import { WORK_CONTENT } from '@data/work.content';
import { WorkDetail } from './work-detail';

describe('Work detail', () => {
  let direction: DirectionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkDetail],
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

  async function render(slug: string) {
    const fixture = TestBed.createComponent(WorkDetail);
    (fixture.componentRef as ComponentRef<WorkDetail>).setInput('slug', slug);
    await fixture.whenStable();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  it('renders every slug in the dataset', async () => {
    for (const project of PROJECTS) {
      const { el } = await render(project.slug);

      expect(el.querySelector('h1')?.textContent?.trim()).toBe(project.name.en);
      expect(el.querySelectorAll('h1').length).toBe(1);
    }
  });

  it('renders nothing for an unknown slug rather than throwing', async () => {
    // Unreachable through the router, but SSR must not crash on a stray URL.
    const { el } = await render('not-a-project');
    expect(el.querySelector('.detail')).toBeNull();
  });

  it('links out to the live site with safe rel attributes', async () => {
    const { el } = await render('2b');
    const anchor = el.querySelector<HTMLAnchorElement>('.detail__visit a');

    expect(anchor?.getAttribute('href')).toBe('https://2b.com.eg/');
    expect(anchor?.getAttribute('target')).toBe('_blank');
    expect(anchor?.getAttribute('rel')).toBe('noopener noreferrer');
    // Changing the browsing context silently is a WCAG 3.2.5 failure.
    expect(anchor?.textContent).toContain(WORK_CONTENT.actions.visit.en);
  });

  it('never links a private project, and says why', async () => {
    const { el } = await render('nas-hr');

    expect(projectBySlug('nas-hr')!.url).toBeNull();
    expect(el.querySelector('.detail__visit')).toBeNull();
    expect(el.textContent).toContain(WORK_CONTENT.actions.private.en);
    expect(el.textContent).toContain(WORK_CONTENT.actions.privateNote.en);
  });

  it('never emits the staging URL for Nature', async () => {
    const { el } = await render('nature');
    const html = el.innerHTML;

    // developer.neas.ae is a staging host and must not appear anywhere.
    expect(html).not.toContain('developer.neas.ae');
    expect(el.querySelector<HTMLAnchorElement>('.detail__visit a')?.getAttribute('href')).toBe(
      'https://www.neas.ae/',
    );
  });

  it('lazy-loads the gallery but not the lead image', async () => {
    const { el } = await render('nature');

    const cover = el.querySelector<HTMLImageElement>('.detail__cover img');
    expect(cover?.getAttribute('loading')).toBe('eager');
    expect(cover?.getAttribute('fetchpriority')).toBe('high');

    const shots = Array.from(el.querySelectorAll<HTMLImageElement>('.gallery__shots img'));
    expect(shots.length).toBe(projectBySlug('nature')!.screenshots.length);
    expect(shots.every((i) => i.getAttribute('loading') === 'lazy')).toBe(true);
  });

  it('describes every image and reserves its box', async () => {
    for (const project of PROJECTS) {
      const { el } = await render(project.slug);

      for (const img of Array.from(el.querySelectorAll<HTMLImageElement>('.detail img'))) {
        // Every image reserves its box, without exception — that is what stops the
        // page shifting as captures decode.
        expect(Number(img.getAttribute('width'))).toBeGreaterThan(0);
        expect(Number(img.getAttribute('height'))).toBeGreaterThan(0);

        // Alt text is required unless the image is *declared* decorative by an
        // aria-hidden ancestor. The project logo is exactly that: the name is an
        // h1 immediately below it, so describing the artwork too would only repeat
        // it. Checked as "hidden from the a11y tree", not as "alt is empty", so a
        // genuinely missing alt still fails here.
        const decorative = img.closest('[aria-hidden="true"]') !== null;
        if (decorative) {
          expect(img.getAttribute('alt')).toBe('');
        } else {
          expect(img.getAttribute('alt')?.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('leads with the business, and states the brief before the cover', async () => {
    for (const project of PROJECTS) {
      const { el } = await render(project.slug);
      const identity = el.querySelector('.detail__identity')?.textContent ?? '';
      const category = el.querySelector('.detail__category')?.textContent ?? '';

      // The category now sits beside the platform under the name — "Shopify ·
      // Coffee / Food & Beverage" is one statement about what this project is — and
      // the market and domain follow in the facts.
      expect(category).toContain(project.field.en);
      expect(identity).toContain(project.market.en);
      expect(identity).toContain(project.domain.en);

      expect(el.querySelector('.detail__brief')?.textContent?.trim()).toBe(project.brief.en);
    }

    // Order matters: someone should know what the business is before they look
    // at a screenshot of it.
    const { el } = await render('nader-coffee');
    const nodes = Array.from(
      el.querySelectorAll('.detail__identity, .detail__brief, .detail__cover'),
    );
    // Compared by the block class only: `.detail__identity` is app-project-facts,
    // which also carries its variant class on the host.
    expect(nodes.map((n) => n.classList[0])).toEqual([
      'detail__identity',
      'detail__brief',
      'detail__cover',
    ]);
  });

  it('follows the information hierarchy: business, role, build, brief, evidence', async () => {
    const { el } = await render('nader-coffee');
    const marker = (node: Element) =>
      ['detail__identity', 'detail__role', 'facts--build', 'detail__brief', 'detail__cover'].find(
        (c) => node.classList.contains(c),
      ) ?? node.tagName.toLowerCase();

    const blocks = Array.from(
      el.querySelectorAll(
        '.detail__identity, .detail__role, app-project-facts.facts--build, .detail__brief, .detail__cover, app-project-gallery',
      ),
    ).map(marker);

    // Role FIRST among the fact blocks, ahead of market and domain and well ahead of
    // the technology list. On a page describing someone else's business, which part
    // of it was his is the thing a reader most needs and the thing most easily lost;
    // in Sprint 9 it was a small label in the middle of a list.
    expect(blocks).toEqual([
      'detail__role',
      'detail__identity',
      'facts--build',
      'detail__brief',
      'detail__cover',
      'app-project-gallery',
    ]);
  });

  it('splits the page: the account of the project beside the evidence', async () => {
    const { el } = await render('vivace');
    const aside = el.querySelector('.detail__aside')!;
    const media = el.querySelector('.detail__media')!;

    // The account comes FIRST in the DOM — a reader, and a screen reader, meets the
    // project's name before its screenshots — and CSS places it in the second
    // column, which is the right in English and the left in Arabic.
    const order = Array.from(el.querySelectorAll('.detail__aside, .detail__media'));
    expect(order[0]).toBe(aside);

    for (const selector of [
      'h1',
      '.detail__identity',
      '.detail__role',
      'app-project-facts.facts--build',
      '.detail__brief',
      '.detail__object',
    ]) {
      expect(aside.querySelector(selector)).not.toBeNull();
      expect(media.querySelector(selector)).toBeNull();
    }

    for (const selector of ['.detail__cover', 'app-project-gallery']) {
      expect(media.querySelector(selector)).not.toBeNull();
      expect(aside.querySelector(selector)).toBeNull();
    }

    // The sticky box is inside the grid item, never the item itself: the item has
    // to stay full-height for sticky to have anywhere to travel.
    expect(aside.querySelector('.detail__pinned')).not.toBeNull();
  });

  it('states role, contribution and team in that order, and gives role the weight', async () => {
    const { el } = await render('nas-hr');
    const labels = Array.from(el.querySelectorAll('.detail__role dt')).map((d) =>
      d.textContent?.trim(),
    );

    // The order the sprint asked for: what he was, what he did, who else was on it.
    expect(labels).toEqual([
      WORK_CONTENT.labels.role.en,
      WORK_CONTENT.labels.contribution.en,
      WORK_CONTENT.labels.team.en,
    ]);

    // And the role is the first thing in the block, so the emphasis rule that
    // targets it cannot drift onto another row.
    expect(
      el.querySelector('.detail__role .facts__row:first-child dt')?.textContent?.trim(),
    ).toBe(WORK_CONTENT.labels.role.en);
  });

  it('names the platform and the category beside the project name', async () => {
    for (const project of PROJECTS) {
      const { el } = await render(project.slug);
      const category = el.querySelector('.detail__category');

      expect(category?.textContent).toContain(project.field.en);
      // The platform is a product name and stays Latin in Arabic, so it is isolated.
      expect(category?.querySelector('.ltr-isolate')?.textContent?.trim().length).toBeGreaterThan(
        0,
      );
    }
  });

  it('shows the client’s own mark on their page', async () => {
    for (const project of PROJECTS) {
      const { el } = await render(project.slug);
      const logo = el.querySelector('.detail__logo');

      expect(logo?.getAttribute('aria-hidden')).toBe('true');
      expect(logo?.querySelector('img')?.getAttribute('src')).toBe(project.logo.src);
    }
  });

  it('separates his role, the project team and his contribution', async () => {
    for (const project of PROJECTS) {
      const { el } = await render(project.slug);
      const role = el.querySelector('.detail__role');
      const labels = Array.from(role?.querySelectorAll('dt') ?? []).map((d) =>
        d.textContent?.trim(),
      );
      const values = Array.from(role?.querySelectorAll('dd') ?? []).map((d) =>
        d.textContent?.trim(),
      );

      expect(values[0]).toBe(project.role.en);
      expect(values).toContain(project.contribution.en);

      if (project.team) {
        // Labelled as the *project's* team, never as his own.
        expect(labels).toContain(WORK_CONTENT.labels.team.en);
        expect(values).toContain(project.team.en);
      } else {
        // No row at all where the composition is not known — not "unknown", and
        // certainly not an estimate.
        expect(labels).not.toContain(WORK_CONTENT.labels.team.en);
      }
    }
  });

  it('never implies he built a whole platform or owns a product', async () => {
    for (const project of PROJECTS) {
      const { el } = await render(project.slug);
      const text = (el.textContent ?? '').toLowerCase();

      for (const claim of [
        'built the entire',
        'developed the complete',
        'the whole platform',
        'my company',
        'founded',
        'i own',
      ]) {
        expect(text).not.toContain(claim);
      }
    }

    // Magento work says front-end, and says the backend was someone else's.
    for (const slug of ['2b', 'esterad']) {
      const { el } = await render(slug);
      const text = el.textContent ?? '';
      expect(text).toContain('Front-End Developer');
      expect(text).toContain('backend team');
    }
  });

  it('wears the project’s atmosphere from first paint, with no hover needed', async () => {
    for (const project of PROJECTS) {
      const { el } = await render(project.slug);
      const article = el.querySelector<HTMLElement>('.detail')!;

      expect(article.classList).toContain('atmosphere');
      expect(article.classList).toContain('is-themed');
      expect(article.style.getPropertyValue('--atmos-surface')).toBe(
        project.atmosphere.surface,
      );
      expect(article.style.getPropertyValue('--atmos-accent')).toBe(project.atmosphere.accent);
    }
  });

  it('keeps the 3D object out of the server render and off most projects', async () => {
    // Deferred on viewport, so it is never in the prerendered HTML — the content
    // that matters is, and the object is decoration that arrives later or not at all.
    for (const project of PROJECTS) {
      const { el } = await render(project.slug);
      expect(el.querySelectorAll('app-project-sculpture').length).toBe(0);
      expect(el.querySelectorAll('.detail__object').length).toBe(project.sculpture ? 1 : 0);
    }

    // Three of seven, all things the business actually sells. The remaining four —
    // an HR platform, an electronics catalogue, a refurbisher, a mangrove nursery —
    // have no shape that can be built from primitives without looking fake, and an
    // abstract stand-in says nothing about a business.
    expect(PROJECTS.filter((p) => p.sculpture !== null).map((p) => p.slug)).toEqual([
      'designed-by-g',
      'nader-coffee',
      'vivace',
    ]);
  });

  it('never states the size of the showcase as a career total', async () => {
    const { el } = await render('vivace');
    const text = el.textContent ?? '';

    expect(text).not.toContain(`${PROJECTS.length} projects`);
  });

  it('offers previous and next for every project, wrapping at the ends', async () => {
    const first = await render(PROJECTS[0].slug);
    const previous = first.el.querySelector<HTMLAnchorElement>('.nav__link.is-previous');

    // The first project's "previous" wraps to the last, so neither control ever
    // disappears and there is no dead end.
    expect(previous?.getAttribute('href')).toBe(`/work/${PROJECTS[PROJECTS.length - 1].slug}`);

    const last = await render(PROJECTS[PROJECTS.length - 1].slug);
    const next = last.el.querySelector<HTMLAnchorElement>('.nav__link.is-next');
    expect(next?.getAttribute('href')).toBe(`/work/${PROJECTS[0].slug}`);
  });

  it('translates the whole page into Arabic', async () => {
    const { fixture, el } = await render('nature');

    direction.set('ar');
    await fixture.whenStable();

    const text = el.textContent ?? '';
    expect(text).toContain(WORK_CONTENT.labels.role.ar);
    expect(text).toContain(WORK_CONTENT.labels.technologies.ar);
    expect(text).toContain(WORK_CONTENT.actions.visit.ar);
    expect(text).toContain('الطبيعة');

    expect(text).not.toContain(WORK_CONTENT.labels.technologies.en);
    expect(text).not.toContain(WORK_CONTENT.actions.visit.en);
  });

  it('localises the new-tab warning', async () => {
    const { fixture, el } = await render('2b');

    direction.set('ar');
    await fixture.whenStable();

    expect(el.textContent).toContain('يفتح في تبويب جديد');
    expect(el.textContent).not.toContain('opens in a new tab');
  });
});
