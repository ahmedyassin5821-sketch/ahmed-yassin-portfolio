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

    const shots = Array.from(el.querySelectorAll<HTMLImageElement>('.detail__shots img'));
    expect(shots.length).toBe(projectBySlug('nature')!.screenshots.length);
    expect(shots.every((i) => i.getAttribute('loading') === 'lazy')).toBe(true);
  });

  it('describes every image and reserves its box', async () => {
    for (const project of PROJECTS) {
      const { el } = await render(project.slug);

      for (const img of Array.from(el.querySelectorAll<HTMLImageElement>('.detail img'))) {
        // Logos are decorative — the name is beside them as real text — so an
        // empty alt is correct there and required everywhere else.
        const isLogo = !!img.closest('app-project-logo');
        if (!isLogo) expect(img.getAttribute('alt')?.length).toBeGreaterThan(0);

        expect(Number(img.getAttribute('width'))).toBeGreaterThan(0);
        expect(Number(img.getAttribute('height'))).toBeGreaterThan(0);
      }
    }
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
