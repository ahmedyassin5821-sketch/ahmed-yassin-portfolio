import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { Badge } from '../badge/badge';
import { Icon } from '../icon/icon';
import { MediaPlaceholder } from '../media-placeholder/media-placeholder';

/** Already-resolved project shape — the caller localises before passing it in. */
export interface ProjectSurfaceData {
  readonly slug: string;
  readonly name: string;
  readonly platform: string;
  readonly summary: string;
  readonly role: string | null;
  readonly technology: readonly string[];
  readonly url: string | null;
  readonly screenshot: { readonly src: string | null; readonly alt: string | null } | null;
}

/**
 * One project, presented as a surface rather than a card.
 *
 * No elevated box, no rounded corners, no shadow — a hairline frame and the 7:8
 * media ratio, so a row of these reads as a contact sheet rather than a SaaS
 * pricing grid.
 *
 * When a project has a live URL the whole surface becomes one link, using a
 * stretched `::after` overlay rather than wrapping the markup in an anchor:
 * wrapping would nest the technology badges inside the link and make a screen
 * reader announce the entire surface as a single unreadable link name.
 *
 * Without a URL it renders as plain content — correct while real project links
 * are still being gathered, and it never produces a dead link.
 */
@Component({
  selector: 'app-project-surface',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Badge, Icon, MediaPlaceholder],
  templateUrl: './project-surface.html',
  styleUrl: './project-surface.scss',
  host: {
    '[class.is-linked]': '!!project().url',
  },
})
export class ProjectSurface {
  readonly project = input.required<ProjectSurfaceData>();

  /** Localised label for the empty media frame. */
  readonly placeholderLabel = input<string>('');

  /** Index shown as an editorial numeral. */
  readonly index = input<number>(0);

  protected readonly hasImage = computed(() => !!this.project().screenshot?.src);

  protected readonly indexLabel = computed(() => String(this.index() + 1).padStart(2, '0'));
}
