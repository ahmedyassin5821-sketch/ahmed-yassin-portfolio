import { ChangeDetectionStrategy, Component } from '@angular/core';

import { localizedContent } from '@core/i18n/localized';
import { HOME_CONTENT } from '@data/home.content';

/**
 * Act 0 — the identity, before anything moves.
 *
 * ## LCP is protected structurally, not by tuning
 *
 * The `<h1>` is plain server-rendered text. It sits outside every `@defer`,
 * carries no entrance animation, and never waits on Three.js, GSAP, a texture,
 * or a font swap. Whatever happens to the WebGL layer, the identity has already
 * painted.
 *
 * The act is deliberately the shortest in the timeline and completely still. The
 * whole conceit — that the mark turns out to be a structure you can travel
 * through — only lands if the reader first accepts it as an ordinary logo.
 *
 * The visual layer is **not** here. It belongs to the stage, because the scene
 * spans the entire journey rather than decorating one section.
 */
@Component({
  selector: 'app-act-mark',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './act-mark.html',
  styleUrl: './act-mark.scss',
})
export class ActMark {
  protected readonly c = localizedContent(HOME_CONTENT.hero);
  protected readonly visual = localizedContent(HOME_CONTENT.visual);
}
