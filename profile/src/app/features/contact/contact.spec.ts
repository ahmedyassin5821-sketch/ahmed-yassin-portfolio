import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { DirectionService } from '@core/i18n/direction.service';
import { PROFESSIONAL_TITLE } from '@data/cv.data';
import { PROFILE_CONTENT } from '@data/profile.content';
import { CONTACT_EMAIL, CONTACT_PHONE, SOCIAL_LINKS } from '../../layout/footer/contact-links';
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

  it('offers the number for both calling and WhatsApp, from one constant', async () => {
    const { el } = await render();

    // Earlier sprints withheld the number deliberately; Ahmed has since asked for it
    // on the site, so this asserts the reverse of what it used to. The number must
    // come from CONTACT_PHONE and never be retyped into a template.
    expect(el.textContent).toContain(CONTACT_PHONE.display);

    const tel = el.querySelector<HTMLAnchorElement>('a[href^="tel:"]');
    expect(tel?.getAttribute('href')).toBe(`tel:${CONTACT_PHONE.tel}`);

    // wa.me needs digits only — no plus, no spaces — or it fails to resolve a chat.
    const whatsapp = el.querySelector<HTMLAnchorElement>('a[href*="wa.me"]');
    expect(whatsapp?.getAttribute('href')).toBe(`https://wa.me/${CONTACT_PHONE.whatsapp}`);
    expect(CONTACT_PHONE.whatsapp).toMatch(/^\d+$/);
    expect(whatsapp?.getAttribute('rel')).toBe('noopener noreferrer');

    // And it says the number covers both, because a bare number does not.
    expect(el.textContent).toContain(PROFILE_CONTENT.contact.phoneNote.en);
  });

  it('protects the number from bidi reordering', async () => {
    const { el } = await render();

    // A leading "+" inside Arabic copy is reordered by the bidi algorithm, which
    // would show a number that is not the number. The isolate is what prevents it,
    // so it is asserted rather than assumed.
    const isolated = Array.from(el.querySelectorAll('.ltr-isolate')).map((n) =>
      n.textContent?.trim(),
    );
    expect(isolated).toContain(CONTACT_PHONE.display);
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
