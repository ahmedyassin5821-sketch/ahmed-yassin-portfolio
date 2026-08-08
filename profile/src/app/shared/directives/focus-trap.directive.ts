import {
  DestroyRef,
  Directive,
  ElementRef,
  booleanAttribute,
  effect,
  inject,
  input,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * Keeps Tab focus inside the host while active, and restores it on release.
 *
 * Hand-written rather than pulled from a library: the whole behaviour is the
 * ~40 lines below, and the shell brief rules out adding dependencies for chrome.
 *
 * ## This is a backstop, not the main mechanism
 *
 * The mobile panel marks `<main>` and `<footer>` as `inert`, which is what
 * actually scopes screen readers and pointer input to the panel. `inert` alone
 * would very nearly do the job — but Tab can still reach browser UI and, in some
 * engines, elements that `inert` has not fully removed. This closes that gap and
 * handles focus restoration, which `inert` does not do at all.
 *
 * @example
 * <div appFocusTrap [focusTrapActive]="isOpen()">…</div>
 */
@Directive({
  selector: '[appFocusTrap]',
  host: {
    '(keydown)': 'onKeydown($event)',
  },
})
export class FocusTrapDirective {
  readonly focusTrapActive = input(false, {
    transform: booleanAttribute,
    alias: 'focusTrapActive',
  });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly doc = inject(DOCUMENT);

  /** Whatever had focus before the trap engaged, so it can be handed back. */
  private previouslyFocused: HTMLElement | null = null;

  constructor() {
    effect(() => {
      if (this.focusTrapActive()) {
        this.previouslyFocused = this.doc.activeElement as HTMLElement | null;
        // Deferred a frame: the host is typically revealed in the same change
        // detection pass that activates the trap, so it is not yet focusable.
        requestAnimationFrame(() => this.focusFirst());
      } else if (this.previouslyFocused) {
        // Returning focus to the trigger is what makes the interaction reversible
        // for a keyboard user — otherwise focus resets to the top of the document.
        this.previouslyFocused.focus({ preventScroll: true });
        this.previouslyFocused = null;
      }
    });

    inject(DestroyRef).onDestroy(() => {
      this.previouslyFocused?.focus({ preventScroll: true });
    });
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab' || !this.focusTrapActive()) return;

    const tabbable = this.tabbable();
    if (tabbable.length === 0) return;

    const first = tabbable[0];
    const last = tabbable[tabbable.length - 1];
    const active = this.doc.activeElement;

    // Wrap at both ends. Without this, Tab escapes into the browser chrome and
    // the user cannot get back without a mouse.
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private focusFirst(): void {
    this.tabbable()[0]?.focus({ preventScroll: true });
  }

  private tabbable(): HTMLElement[] {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    return Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>(selector)).filter(
      // `offsetParent === null` catches display:none and visibility:hidden
      // subtrees, which are still returned by querySelectorAll but cannot hold
      // focus — tabbing to them would silently do nothing.
      (el) => el.offsetParent !== null || el.getClientRects().length > 0,
    );
  }
}
