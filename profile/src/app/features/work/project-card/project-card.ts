import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Badge } from '@shared/ui/badge/badge';
import { Icon } from '@shared/ui/icon/icon';
import { MediaPlaceholder } from '@shared/ui/media-placeholder/media-placeholder';
import { ProjectLogo } from '../project-logo/project-logo';

/** Already-resolved shape — the caller localises before passing it in. */
export interface ProjectCardData {
  readonly slug: string;
  readonly name: string;
  readonly platform: string;
  readonly platformLabel: string;
  readonly projectType: string;
  readonly role: string;
  readonly summary: string;
  readonly technology: readonly string[];
  readonly dashboard: boolean;
  readonly isPrivate: boolean;
  readonly logo: { src: string; width: number; height: number; alt: string } | null;
  /** `null` until a project's imagery is supplied — renders the placeholder. */
  readonly cover: {
    src: string;
    srcset: string | null;
    avif?: string | null;
    width: number;
    height: number;
    alt: string;
  } | null;
}

/**
 * One project on the `/work` index.
 *
 * ## Why the whole card is one link
 *
 * A visitor scanning six projects should be able to hit any part of a card. The
 * anchor wraps only the name and is stretched over the card by a pseudo-element,
 * so the accessible name stays "View Nature" instead of swallowing the summary,
 * the platform, and every technology badge into one unreadable link label.
 *
 * The external site link is deliberately *not* here. Two competing links inside
 * one clickable card is a tab-order trap; the outbound link lives on the detail
 * page where it can be a real, labelled control.
 */
@Component({
  selector: 'app-project-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Badge, Icon, MediaPlaceholder, ProjectLogo],
  templateUrl: './project-card.html',
  styleUrl: './project-card.scss',
})
export class ProjectCard {
  readonly project = input.required<ProjectCardData>();

  /** Localised label announced on the card link. */
  readonly viewLabel = input<string>('');

  /** Shown as a marker on work with no public URL. */
  readonly privateLabel = input<string>('');

  readonly dashboardLabel = input<string>('');

  /** Localised caption for the empty frame, when a project has no imagery yet. */
  readonly placeholderLabel = input<string>('');

  /** Eager for the first row only — everything below the fold lazy-loads. */
  readonly priority = input<boolean>(false);

  /**
   * The card spans one column below `md`, two above it, inside a page that is at
   * most 1200px wide. Telling the browser that up front is what lets it pick the
   * 800px variant on a phone instead of downloading 1600px it cannot use.
   */
  protected readonly sizes = '(min-width: 48rem) 50vw, 100vw';
}
