import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { DirectionService } from '@core/i18n/direction.service';
import { HOME_CONTENT } from '@data/home.content';
import { PROJECTS } from '@data/projects.data';
import { BrandMarquee } from './brand-marquee';

describe('Brand marquee', () => {
  let direction: DirectionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandMarquee],
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
    const fixture = TestBed.createComponent(BrandMarquee);
    await fixture.whenStable();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  it('shows every showcased brand, in showcase order, derived from the data', async () => {
    const { el } = await render();
    const rows = Array.from(el.querySelectorAll('.marquee__row'));

    expect(rows.length).toBe(2);
    for (const row of rows) {
      const hrefs = Array.from(row.querySelectorAll<HTMLAnchorElement>('.marquee__brand')).map(
        (a) => a.getAttribute('href'),
      );
      expect(hrefs).toEqual(PROJECTS.map((p) => `/work/${p.slug}`));
    }
  });

  it('keeps both copies identical, which is what makes the loop seamless', async () => {
    const { el } = await render();
    const [first, second] = Array.from(el.querySelectorAll('.marquee__row'));

    // The animation travels exactly one row's width. If the two rows held
    // different numbers of items the strip would jump on every repeat, and the
    // arithmetic in the stylesheet would be measuring the wrong distance.
    expect(first.querySelectorAll('.marquee__item').length).toBe(PROJECTS.length);
    expect(second.querySelectorAll('.marquee__item').length).toBe(PROJECTS.length);
  });

  it('offers the keyboard seven brands, not fourteen', async () => {
    const { el } = await render();
    const rows = Array.from(el.querySelectorAll('.marquee__row'));

    // The duplicate is a visual device. Announcing it would list every brand
    // twice, and tabbing through it would double the length of the page.
    expect(rows[0].getAttribute('aria-hidden')).toBeNull();
    expect(rows[1].getAttribute('aria-hidden')).toBe('true');

    const focusable = el.querySelectorAll('.marquee__brand:not([tabindex="-1"])');
    expect(focusable.length).toBe(PROJECTS.length);
    expect(rows[1].querySelectorAll('.marquee__brand[tabindex="-1"]').length).toBe(
      PROJECTS.length,
    );
  });

  it('names every link, because the artwork itself carries no alt text', async () => {
    const { el } = await render();
    const links = Array.from(
      el.querySelectorAll('.marquee__brand:not([tabindex="-1"])'),
    );

    links.forEach((link, i) => {
      const name = link.querySelector('.sr-only')?.textContent?.trim() ?? '';
      expect(name).toContain(PROJECTS[i].name.en);
      // Decorative artwork, named by the link instead.
      expect(link.querySelector('img')?.getAttribute('alt')).toBe('');
    });
  });

  it('uses each client’s real optimised logo asset', async () => {
    const { el } = await render();
    const srcs = Array.from(el.querySelectorAll<HTMLImageElement>('.marquee__logo img')).map(
      (i) => i.getAttribute('src'),
    );

    expect(srcs.length).toBe(PROJECTS.length * 2);
    for (const project of PROJECTS) {
      expect(srcs).toContain(project.logo.src);
    }
    // Never the multi-megabyte originals, which live outside public/.
    expect(srcs.every((s) => !s?.endsWith('.png'))).toBe(true);
  });

  it('is a titled section rather than an unattributed logo strip', async () => {
    const { el } = await render();
    const section = el.querySelector('.marquee')!;
    const labelledBy = section.getAttribute('aria-labelledby');

    expect(labelledBy).toBeTruthy();
    const heading = el.querySelector(`#${labelledBy}`);
    expect(heading?.tagName).toBe('H2');
    expect(heading?.textContent?.trim()).toBe(HOME_CONTENT.marquee.title.en);
  });

  it('translates its own copy into Arabic', async () => {
    const { fixture, el } = await render();

    direction.set('ar');
    await fixture.whenStable();

    const text = el.textContent ?? '';
    expect(text).toContain(HOME_CONTENT.marquee.eyebrow.ar);
    expect(text).toContain(HOME_CONTENT.marquee.title.ar);
    expect(text).not.toContain(HOME_CONTENT.marquee.title.en);

    // And the brands' own Arabic names reach the accessible labels, rather than
    // the links announcing English inside an Arabic page.
    expect(text).toContain('بن نادر');
    expect(text).toContain('الطبيعة');
  });
});
