import { Directive, input } from '@angular/core';

import { ProjectAtmosphere } from '@data/models/project.model';

/**
 * Puts a project's brand atmosphere onto an element.
 *
 * ## What it does, and what it deliberately does not
 *
 * It binds eight colours as `--atmos-*` custom properties and adds one class. It
 * does **not** style anything: `src/styles/_atmosphere.scss` owns what those
 * properties mean, because what they mean is "rebind the semantic tokens", and
 * that has to be a global rule to reach across component boundaries.
 *
 * The consequence is worth being explicit about — no component anywhere knows a
 * theme exists. Every one of them already reads `var(--color-text-primary)` and
 * friends, stylelint sees to that, and custom properties inherit through
 * Angular's emulated encapsulation. So the entire page adapts because the tokens
 * under it changed, not because anything was told to.
 *
 * ## `null` is the neutral portfolio, not an error
 *
 * Passing `null` removes the properties, they fall back to the `initial-value`
 * declared on each `@property` — which is the neutral token it shadows — and the
 * transition runs in that direction too. `/work` uses that for "the reader is not
 * on any project"; the detail pages never pass it.
 *
 * ## Why a directive rather than a binding in each template
 *
 * `/work` and `/work/:slug` both need it, and a list of eight style bindings
 * copied into two templates is eight chances for them to drift.
 */
@Directive({
  selector: '[appAtmosphere]',
  host: {
    class: 'atmosphere',
    '[style.--atmos-surface]': 'appAtmosphere()?.surface',
    '[style.--atmos-surface-strong]': 'appAtmosphere()?.surfaceStrong',
    '[style.--atmos-border]': 'appAtmosphere()?.border',
    '[style.--atmos-text]': 'appAtmosphere()?.text',
    '[style.--atmos-text-secondary]': 'appAtmosphere()?.textSecondary',
    '[style.--atmos-text-muted]': 'appAtmosphere()?.textMuted',
    '[style.--atmos-accent]': 'appAtmosphere()?.accent',
    '[style.--atmos-glow]': 'appAtmosphere()?.glow',
    // Lets a stylesheet distinguish "a project is active" from neutral without
    // reading a colour back — which is not something CSS can do.
    '[class.is-themed]': 'appAtmosphere() !== null',
  },
})
export class AtmosphereDirective {
  /** The active project's atmosphere, or `null` for the neutral portfolio. */
  readonly appAtmosphere = input.required<ProjectAtmosphere | null>();
}
