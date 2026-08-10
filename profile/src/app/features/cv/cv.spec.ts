import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { DirectionService } from '@core/i18n/direction.service';
import {
  CV_CERTIFICATIONS,
  CV_EDUCATION,
  CV_EXPERIENCE,
  CV_FILE,
  CV_PROFILE,
  PROFESSIONAL_TITLE,
} from '@data/cv.data';
import { PROJECTS, PROJECTS_SHIPPED } from '@data/projects.data';
import { Cv } from './cv';

describe('CV page', () => {
  let direction: DirectionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cv],
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
    const fixture = TestBed.createComponent(Cv);
    await fixture.whenStable();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  it('renders the CV as real HTML, not only as a download', async () => {
    const { el } = await render();
    const text = el.textContent ?? '';

    // A PDF behind a button is invisible to search and hostile to a screen
    // reader. Every entry has to exist as text on the page.
    expect(text).toContain(CV_PROFILE.en);

    for (const entry of [...CV_EXPERIENCE, ...CV_EDUCATION, ...CV_CERTIFICATIONS]) {
      expect(text).toContain(entry.title.en);
      expect(text).toContain(entry.period);
    }
  });

  it('offers the real document, renamed on save', async () => {
    const { el } = await render();
    const link = el.querySelector<HTMLAnchorElement>('.cv__download');

    // Points at the file actually shipped in public/, not a copy that can drift.
    expect(link?.getAttribute('href')).toBe(CV_FILE);
    // The stored filename carries a typo; `download` fixes what the user saves.
    expect(link?.getAttribute('download')).toBe('Ahmed-Yassin-CV.pdf');
    expect(link?.getAttribute('rel')).toContain('noopener');
  });

  it('has exactly one h1', async () => {
    const { el } = await render();
    expect(el.querySelectorAll('h1').length).toBe(1);
  });

  it('states both counts from data, never the showcase as a career total', async () => {
    const { el } = await render();
    const text = el.textContent ?? '';

    expect(text).toContain(String(PROJECTS_SHIPPED));
    expect(text).toContain(String(PROJECTS.length));
    expect(text).not.toMatch(new RegExp(`\\b${PROJECTS.length} projects shipped`));
  });

  it('uses the exact Arabic professional title', async () => {
    const { fixture, el } = await render();

    direction.set('ar');
    await fixture.whenStable();

    const text = el.textContent ?? '';
    expect(text).toContain('مبرمج مواقع ومتاجر إلكترونية');
    expect(text).toContain(PROFESSIONAL_TITLE.ar);
    // The old wording must not survive anywhere.
    expect(text).not.toContain('مصمم واجهات أمامية');
  });

  it('translates every entry, not only the page furniture', async () => {
    const { fixture, el } = await render();

    direction.set('ar');
    await fixture.whenStable();

    const text = el.textContent ?? '';
    expect(text).toContain(CV_PROFILE.ar);
    expect(text).not.toContain(CV_PROFILE.en);

    for (const entry of CV_EXPERIENCE) {
      expect(text).toContain(entry.title.ar);
    }
  });
});
