import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { TextLink } from './text-link';

@Component({
  imports: [TextLink],
  template: `
    <app-text-link href="https://example.com">External label</app-text-link>
    <app-text-link route="/work">Internal label</app-text-link>
    <app-text-link href="mailto:a@b.c" [newTab]="false">Email label</app-text-link>
  `,
})
class Host {}

/**
 * Regression cover for a projection bug shipped in Sprint 2.
 *
 * The component had two `<ng-content>` slots, one per branch of its `@if`.
 * Projected nodes are moved rather than copied, so only one slot could ever
 * receive them — every external link rendered as an anchor containing no text at
 * all. It survived review because the label is invisible in markup diffs and the
 * href still looked correct.
 *
 * The first test below is the one that matters: assert the visible text exists.
 */
describe('TextLink', () => {
  async function render() {
    await TestBed.configureTestingModule({
      imports: [Host],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders its label in every variant', async () => {
    const anchors = (await render()).querySelectorAll('a.link');

    expect(anchors.length).toBe(3);
    expect(anchors[0].textContent).toContain('External label');
    expect(anchors[1].textContent).toContain('Internal label');
    expect(anchors[2].textContent).toContain('Email label');
  });

  it('never renders an anchor with no accessible text', async () => {
    for (const anchor of Array.from((await render()).querySelectorAll('a.link'))) {
      // A link whose only content is an icon is unusable with a screen reader
      // and ambiguous with one's eyes.
      expect(anchor.textContent?.trim().length).toBeGreaterThan(0);
    }
  });

  it('secures external links and warns about the new tab', async () => {
    const external = (await render()).querySelectorAll('a.link')[0];

    expect(external.getAttribute('target')).toBe('_blank');
    expect(external.getAttribute('rel')).toBe('noopener noreferrer');
    // Changing browsing context without warning is a WCAG 3.2.5 failure, and the
    // glyph alone says nothing to assistive tech.
    expect(external.querySelector('.sr-only')?.textContent).toContain('opens in a new tab');
  });

  it('omits target and the new-tab affordance when newTab is false', async () => {
    const email = (await render()).querySelectorAll('a.link')[2];

    expect(email.getAttribute('target')).toBeNull();
    expect(email.getAttribute('href')).toBe('mailto:a@b.c');
    expect(email.querySelector('app-icon')).toBeNull();
  });

  it('uses the router for internal links', async () => {
    const internal = (await render()).querySelectorAll('a.link')[1];

    // A real href, so middle-click and open-in-new-tab still work.
    expect(internal.getAttribute('href')).toBe('/work');
  });
});
