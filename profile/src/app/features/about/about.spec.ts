import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { DirectionService } from '@core/i18n/direction.service';
import { CV_EXPERIENCE, CV_PROFILE, PROFESSIONAL_TITLE } from '@data/cv.data';
import { PLATFORM_GROUPS, PROJECTS, PROJECTS_SHIPPED } from '@data/projects.data';
import { About } from './about';

describe('About page', () => {
  let direction: DirectionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [About],
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
    const fixture = TestBed.createComponent(About);
    await fixture.whenStable();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  it('reads the CV rather than paraphrasing it', async () => {
    const { el } = await render();
    const text = el.textContent ?? '';

    // The CV's own profile paragraph and its current role — read, not restated,
    // so the two can never disagree.
    expect(text).toContain(CV_PROFILE.en);
    expect(text).toContain(CV_EXPERIENCE[0].title.en);
    expect(text).toContain(CV_EXPERIENCE[0].period);
  });

  it('covers all three platforms', async () => {
    const { el } = await render();
    const text = el.textContent ?? '';

    for (const group of PLATFORM_GROUPS) {
      expect(text).toContain(group.label);
      expect(text).toContain(group.summary.en);
    }
  });

  it('never states the showcase as the career total', async () => {
    const { el } = await render();
    const text = el.textContent ?? '';

    expect(text).toContain(String(PROJECTS_SHIPPED));
    expect(text).toContain(String(PROJECTS.length));
    expect(text).not.toMatch(new RegExp(`^\\s*${PROJECTS.length} projects\\b`));
  });

  it('points at the CV and the work rather than duplicating either', async () => {
    const { el } = await render();
    const hrefs = Array.from(el.querySelectorAll<HTMLAnchorElement>('a')).map((a) =>
      a.getAttribute('href'),
    );

    expect(hrefs).toContain('/cv');
    expect(hrefs).toContain('/work');
  });

  it('uses the exact Arabic professional title', async () => {
    const { fixture, el } = await render();

    direction.set('ar');
    await fixture.whenStable();

    expect(el.textContent).toContain(PROFESSIONAL_TITLE.ar);
    expect(el.textContent).toContain('مبرمج مواقع ومتاجر إلكترونية');
    expect(el.textContent).toContain(CV_PROFILE.ar);
    expect(el.textContent).not.toContain(CV_PROFILE.en);
  });

  it('has exactly one h1', async () => {
    const { el } = await render();
    expect(el.querySelectorAll('h1').length).toBe(1);
  });
});
