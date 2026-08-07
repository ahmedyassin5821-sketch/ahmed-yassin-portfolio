import { TestBed } from '@angular/core/testing';

import { Icon } from './icon';
import { ICON_PATHS, RTL_MIRRORED_ICONS } from './icon-paths';

describe('Icon', () => {
  async function render(inputs: Record<string, unknown>) {
    const fixture = TestBed.createComponent(Icon);
    for (const [key, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(key, value);
    }
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders square caps and miter joins', async () => {
    const el = await render({ name: 'arrow-right' });
    const svg = el.querySelector('svg')!;

    // Round caps would contradict the monogram's flat terminals. This is the
    // single most likely thing to regress if the icon set is ever swapped.
    expect(svg.getAttribute('stroke-linecap')).toBe('square');
    expect(svg.getAttribute('stroke-linejoin')).toBe('miter');
  });

  it('scales stroke weight with size so optical weight stays constant', async () => {
    expect((await render({ name: 'check', size: 'sm' })).querySelector('svg')!.getAttribute('stroke-width')).toBe('1.25');
    expect((await render({ name: 'check', size: 'md' })).querySelector('svg')!.getAttribute('stroke-width')).toBe('1.5');
    expect((await render({ name: 'check', size: 'lg' })).querySelector('svg')!.getAttribute('stroke-width')).toBe('2');
    expect((await render({ name: 'check', size: 'xl' })).querySelector('svg')!.getAttribute('stroke-width')).toBe('2.5');
  });

  it('marks only direction-dependent glyphs for mirroring', async () => {
    const arrow = await render({ name: 'arrow-right' });
    expect(arrow.getAttribute('data-flip')).toBe('true');

    // A frequent bug: flipping every chevron. A vertical one must not mirror,
    // or it ends up pointing the wrong way entirely.
    const down = await render({ name: 'chevron-down' });
    expect(down.getAttribute('data-flip')).toBe('false');

    const check = await render({ name: 'check' });
    expect(check.getAttribute('data-flip')).toBe('false');
  });

  it('honours an explicit flip override', async () => {
    const el = await render({ name: 'arrow-right', flipInRtl: false });
    expect(el.getAttribute('data-flip')).toBe('false');
  });

  it('is decorative unless labelled', async () => {
    const plain = await render({ name: 'menu' });
    expect(plain.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');

    const labelled = await render({ name: 'menu', label: 'Open menu' });
    const svg = labelled.querySelector('svg')!;
    expect(svg.getAttribute('aria-hidden')).toBeNull();
    expect(svg.getAttribute('aria-label')).toBe('Open menu');
  });

  it('only mirrors icons that exist in the set', () => {
    for (const name of RTL_MIRRORED_ICONS) {
      expect(ICON_PATHS[name]).toBeDefined();
    }
  });
});
