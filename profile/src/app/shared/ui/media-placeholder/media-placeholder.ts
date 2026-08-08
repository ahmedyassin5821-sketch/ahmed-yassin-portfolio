import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Stands in for project imagery that does not exist yet.
 *
 * Deliberately *not* a stock photo, an AI-generated image, or a borrowed
 * screenshot: a portfolio that shows work Ahmed did not make is worse than one
 * that shows an honest gap. This renders a token-styled frame at the brand's
 * 7:8 portrait ratio with a mono label, so the layout is real and the absence is
 * legible rather than disguised.
 *
 * Replacing it later is a data edit — set `screenshot` on the project and the
 * surface renders the image instead. No markup changes.
 */
@Component({
  selector: 'app-media-placeholder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './media-placeholder.html',
  styleUrl: './media-placeholder.scss',
})
export class MediaPlaceholder {
  /** Shown in the frame. Already localised by the caller. */
  readonly label = input<string>('');

  /** Project name, rendered as a large ghosted watermark. */
  readonly caption = input<string>('');
}
