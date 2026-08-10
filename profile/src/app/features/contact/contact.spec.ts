import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { DirectionService } from '@core/i18n/direction.service';
import { PROFESSIONAL_TITLE } from '@data/cv.data';
import { CONTACT_EMAIL, SOCIAL_LINKS } from '../../layout/footer/contact-links';
import { Contact } from './contact';

describe('Contact page', () => {
  let direction: DirectionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Contact],
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
    const fixture = TestBed.createComponent(Contact);
    await fixture.whenStable();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  it('offers a real mailto address', async () => {
    const { el } = await render();
    const link = el.querySelector<HTMLAnchorElement>('.contact__email-link');

    expect(link?.getAttribute('href')).toBe(`mailto:${CONTACT_EMAIL}`);
    expect(link?.textContent).toContain(CONTACT_EMAIL);
  });

  it('ships no form, because there is no endpoint behind one', async () => {
    const { el } = await render();

    // A form without an endpoint accepts what someone typed and discards it,
    // which is worse than not offering one.
    expect(el.querySelector('form')).toBeNull();
    expect(el.querySelector('input')).toBeNull();
  });

  it('never publishes the phone number that is on the CV', async () => {
    const { el } = await render();

    // The document itself discloses it; this page does not do so on his behalf.
    expect(el.textContent).not.toContain('01111713877');
    expect(el.innerHTML).not.toContain('tel:');
  });

  it('links every confirmed profile with safe rel attributes', async () => {
    const { el } = await render();
    const anchors = Array.from(el.querySelectorAll<HTMLAnchorElement>('.contact__profiles a'));

    expect(anchors.length).toBe(SOCIAL_LINKS.length);
    for (const anchor of anchors) {
      expect(anchor.getAttribute('rel')).toBe('noopener noreferrer');
      expect(anchor.getAttribute('href')).toMatch(/^https:\/\//);
    }
  });

  it('uses the exact Arabic professional title', async () => {
    const { fixture, el } = await render();

    direction.set('ar');
    await fixture.whenStable();

    expect(el.textContent).toContain(PROFESSIONAL_TITLE.ar);
    expect(el.textContent).toContain('مبرمج مواقع ومتاجر إلكترونية');
    expect(el.textContent).not.toContain(PROFESSIONAL_TITLE.en);
  });

  it('has exactly one h1', async () => {
    const { el } = await render();
    expect(el.querySelectorAll('h1').length).toBe(1);
  });
});
