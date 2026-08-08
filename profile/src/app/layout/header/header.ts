import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { ShellUiService } from '@core/shell/shell-ui.service';
import { Icon } from '@shared/ui/icon/icon';
import { Logo } from '@shared/ui/logo/logo';
import { NAV_LINKS } from '../nav-links';
import { LanguageSwitcher } from '../language-switcher/language-switcher';
import { MobileNav } from '../mobile-nav/mobile-nav';

/**
 * Global header.
 *
 * Sticky from first paint so the page never reflows, but visually borderless at
 * the top — the hairline and translucent surface fade in only once the page has
 * scrolled. That is the single state change; the header never changes height and
 * never hides.
 *
 * ## Why an IntersectionObserver and not a scroll listener
 *
 * A scroll handler runs on every frame of every scroll for one boolean. A 1px
 * sentinel at the top of the document answers the same question with zero
 * per-frame work, which matters more than usual here: change detection is
 * zoneless, so a scroll listener would either need manual scheduling or would do
 * nothing at all.
 */
@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, Logo, Icon, LanguageSwitcher, MobileNav],
  template: `
    <!--
      Pin sentinel. Sits in normal flow above the sticky header; once it leaves
      the viewport the header has something scrolled behind it. aria-hidden and
      zero-height, so it is invisible to both users and assistive technology.
    -->
    <div #sentinel class="header__sentinel" aria-hidden="true"></div>

    <header class="header" [class.is-pinned]="pinned()">
      <div class="header__inner">
        <a class="header__brand" routerLink="/" [attr.aria-label]="'Ahmed Yassin — home'">
          <app-logo variant="mark" [size]="40" />
        </a>

        <!-- Labelled because the footer carries a second nav; with two
             navigations on the page, distinguishing them is required. -->
        <nav class="header__nav" aria-label="Primary">
          <ul class="header__list" role="list">
            @for (link of navLinks; track link.path) {
              <li>
                <a
                  class="header__link"
                  [routerLink]="link.path"
                  routerLinkActive="is-active"
                  #active="routerLinkActive"
                  [attr.aria-current]="active.isActive ? 'page' : null"
                >
                  {{ link.label }}
                </a>
              </li>
            }
          </ul>
        </nav>

        <div class="header__actions">
          <app-language-switcher class="header__switcher" />

          <button
            type="button"
            class="header__trigger"
            [attr.aria-expanded]="shell.menuOpen()"
            aria-controls="mobile-nav"
            aria-label="Open navigation menu"
            (click)="shell.open()"
          >
            <app-icon name="menu" size="md" />
          </button>
        </div>
      </div>

      <!--
        The panel lives inside <header> on purpose: app.ts marks <main> and
        <footer> as inert while it is open, and the panel has to sit outside that
        subtree to stay interactive.

        Deferred because it is never needed until the trigger is tapped, and it is
        only reachable below md at all — loading the panel, its focus trap, and a
        second switcher instance into the initial bundle would make every visitor
        pay for a control most of them never open. The idle prefetch below fetches
        the chunk during spare time, so the first open is still instant.
      -->
      @defer (when shell.menuOpen(); prefetch on idle) {
        <app-mobile-nav />
      }
    </header>
  `,
  styleUrl: './header.scss',
})
export class Header {
  protected readonly shell = inject(ShellUiService);
  protected readonly navLinks = NAV_LINKS;

  private readonly sentinel = viewChild.required<ElementRef<HTMLElement>>('sentinel');
  private readonly destroyRef = inject(DestroyRef);

  protected readonly pinned = signal(false);

  constructor() {
    // Never runs on the server, and runs post-paint in the browser, so observing
    // cannot delay first render.
    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') return;

      const observer = new IntersectionObserver(
        ([entry]) => this.pinned.set(!entry.isIntersecting),
        { threshold: 0 },
      );

      observer.observe(this.sentinel().nativeElement);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
