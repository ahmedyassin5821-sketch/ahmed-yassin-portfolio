import { TestBed } from '@angular/core/testing';

import { Logo } from './logo';
import { AY_MARK_PATH, AY_MARK_SMALL_VIEWBOX, AY_MARK_VIEWBOX } from './logo-path';

/**
 * These lock the two things about the logo that are easy to break silently:
 * the automatic small-size swap, and the fact that the geometry is never edited.
 */
describe('Logo', () => {
  async function render(inputs: Record<string, unknown> = {}) {
    const fixture = TestBed.createComponent(Logo);
    fixture.componentRef.setInput('size', 48);
    for (const [key, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(key, value);
    }
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('uses the true mark at 48px and above', async () => {
    const el = await render({ size: 48 });
    const svg = el.querySelector('svg')!;

    expect(svg.getAttribute('viewBox')).toBe(AY_MARK_VIEWBOX);
    // No stroke: the hairlines render at their designed weight.
    expect(svg.getAttribute('stroke')).toBeNull();
  });

  it('swaps to the thickened variant below 48px', async () => {
    const el = await render({ size: 24 });
    const svg = el.querySelector('svg')!;

    // Below ~48px the real hairlines fall under one device pixel and vanish, so
    // the component expands them rather than leaving callers to discover it.
    expect(svg.getAttribute('viewBox')).toBe(AY_MARK_SMALL_VIEWBOX);
    expect(svg.getAttribute('stroke')).toBe('currentColor');
    expect(svg.getAttribute('stroke-width')).toBe('8');
  });

  it('never alters the mark geometry between variants', async () => {
    const large = (await render({ size: 96 })).querySelector('path')!.getAttribute('d');
    const small = (await render({ size: 16 })).querySelector('path')!.getAttribute('d');

    expect(large).toBe(AY_MARK_PATH);
    expect(small).toBe(AY_MARK_PATH);
  });

  it('is hidden from assistive tech unless given a label', async () => {
    const decorative = await render();
    expect(decorative.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');

    const labelled = await render({ label: 'Ahmed Yassin' });
    const svg = labelled.querySelector('svg')!;
    expect(svg.getAttribute('aria-hidden')).toBeNull();
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('Ahmed Yassin');
  });
});
