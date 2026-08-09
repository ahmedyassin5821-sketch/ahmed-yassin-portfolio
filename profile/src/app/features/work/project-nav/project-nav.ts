import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Icon } from '@shared/ui/icon/icon';

export interface ProjectNavTarget {
  readonly slug: string;
  readonly name: string;
}

/**
 * Previous / next project.
 *
 * Its own component rather than markup inside the detail page for two reasons:
 * it is a self-contained unit with its own state-free contract, and keeping its
 * styles in their own file is what holds each component's emitted CSS inside the
 * 4 kB budget the build enforces.
 *
 * Both controls are always present because `projectNeighbours` wraps around, so
 * neither end of the list is a dead end.
 */
@Component({
  selector: 'app-project-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  templateUrl: './project-nav.html',
  styleUrl: './project-nav.scss',
})
export class ProjectNav {
  readonly previous = input.required<ProjectNavTarget>();
  readonly next = input.required<ProjectNavTarget>();

  readonly previousLabel = input<string>('');
  readonly nextLabel = input<string>('');

  /** Full announced names, e.g. "Previous project: Nature". */
  readonly previousA11y = input<string>('');
  readonly nextA11y = input<string>('');

  /** Names the landmark, so it is not just an unlabelled second nav. */
  readonly regionLabel = input<string>('');
}
