import { TestBed } from '@angular/core/testing';

import { DirectionService } from '@core/i18n/direction.service';
import { HOME_CONTENT } from '@data/home.content';
import { HomeProgress } from '../animation/home-progress';
import { ScrollCue } from './scroll-cue';

/**
 * The hero scroll cue.
 *
 * Two properties matter and neither is visual: it must retire as the reader moves,
 * and it must not come back when they scroll up. The second is the one a pure
 * function of scroll position gets wrong.
 */
describe('Scroll cue', () => {
  let progress: HomeProgress;
  let direction: DirectionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ScrollCue] }).compileComponents();
    progress = TestBed.inject(HomeProgress);
    direction = TestBed.inject(DirectionService);
    progress.reset();
    direction.set('en');
    TestBed.tick();
  });

  afterEach(() => {
    progress.reset();
    direction.set('en');
    TestBed.tick();
  });

  async function render() {
    const fixture = TestBed.createComponent(ScrollCue);
    await fixture.whenStable();
    return { fixture, host: fixture.nativeElement as HTMLElement };
  }

  it('reads the journey rather than listening to scroll itself', async () => {
    // The point of the component: one scroll listener exists on the page, and this
    // is not it. Driving it through HomeProgress is the whole contract.
    const { fixture, host } = await render();
    expect(host.classList.contains('is-spent')).toBe(false);

    progress.set(0.5);
    await fixture.whenStable();
    expect(host.classList.contains('is-spent')).toBe(true);
  });

  it('does not retire on the first pixel', async () => {
    const { fixture, host } = await render();

    // A deliberate first nudge must not blank it — the cue fades over a range rather
    // than vanishing the instant anything moves.
    progress.set(0.01);
    await fixture.whenStable();
    expect(host.classList.contains('is-spent')).toBe(false);
  });

  it('never comes back once spent, however far the reader scrolls up', async () => {
    const { fixture, host } = await render();

    progress.set(0.4);
    await fixture.whenStable();
    expect(host.classList.contains('is-spent')).toBe(true);

    // Back to the very top. A cue derived directly from scroll position would
    // reappear here and tell someone who has already been through the corridor to
    // start again; the latch is what prevents it.
    progress.set(0);
    await fixture.whenStable();
    expect(host.classList.contains('is-spent')).toBe(true);
  });

  it('is hidden from assistive technology and takes no clicks', async () => {
    const { host } = await render();

    // It describes a gesture to a sighted reader. It is not content, and it sits over
    // the acts — so it must never intercept a click meant for a link behind it.
    expect(host.getAttribute('aria-hidden')).toBe('true');
    expect(getComputedStyle(host).pointerEvents).toBe('none');
  });

  it('states the instruction in the active language', async () => {
    const { fixture, host } = await render();
    expect(host.textContent?.trim()).toBe(HOME_CONTENT.hero.scrollHint.en);

    direction.set('ar');
    await fixture.whenStable();
    expect(host.textContent?.trim()).toBe(HOME_CONTENT.hero.scrollHint.ar);
  });
});
