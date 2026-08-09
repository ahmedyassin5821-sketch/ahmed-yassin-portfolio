import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { RevealDirective } from '@shared/directives/reveal.directive';

export interface GalleryShot {
  readonly src: string;
  readonly srcset: string | null;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
}

/**
 * A project's screenshots, as a sequence rather than a stack.
 *
 * Its own component for two reasons: it is a self-contained unit with a
 * state-free contract, and keeping its styles in their own file is what holds
 * each component's emitted CSS inside the 4 kB budget the build enforces —
 * `work-detail.scss` went 1.55 kB over once the gallery lived there.
 *
 * Every second plate is inset, so a long page of captures reads as a rhythm
 * instead of a contact sheet. The inset is logical, so it follows the reading
 * direction in Arabic without an override.
 */
@Component({
  selector: 'app-project-gallery',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  templateUrl: './project-gallery.html',
  styleUrl: './project-gallery.scss',
})
export class ProjectGallery {
  readonly shots = input.required<readonly GalleryShot[]>();

  /** Section heading — already localised by the caller. */
  readonly title = input<string>('');

  /** Names the landmark, e.g. "Screenshots of Nature". */
  readonly regionLabel = input<string>('');

  /** Shared with the cover, because both sit on the same measure. */
  readonly sizes = input<string>('100vw');
}
