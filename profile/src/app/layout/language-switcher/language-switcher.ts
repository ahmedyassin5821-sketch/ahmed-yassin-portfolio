import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';

import { AppLocale, DirectionService } from '@core/i18n/direction.service';

interface LocaleOption {
  readonly locale: AppLocale;
  readonly label: string;
  /** BCP 47 tag, used for both `lang` and `hreflang`. */
  readonly tag: string;
}

/**
 * English / Arabic switcher.
 *
 * ## Why anchors and not buttons
 *
 * Compile-time i18n (ARCHITECTURE.md ADR-001) makes each locale its own build
 * served from `/en` and `/ar`, at which point switching language is a navigation.
 * Building these as anchors now means that transition is an `href` change and
 * nothing else — no markup, styling, or semantics move. A `<button>` would have
 * to be rewritten.
 *
 * Until then `href` stays `#` with the click intercepted, and
 * `DirectionService` carries the state.
 *
 * ## Why both languages are always visible
 *
 * A single toggle showing only the target language is ambiguous — a reader
 * cannot tell whether the label names the current language or the available one.
 * Showing both with the active one marked removes the guess, and an Arabic
 * speaker sees العربية rather than having to decode "AR".
 *
 * Each anchor carries its own `lang`, so the Arabic label renders in the Arabic
 * face (see `_fonts.scss`) and a screen reader switches voice for it.
 */
@Component({
  selector: 'app-language-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="switcher" role="list">
      @for (option of options; track option.locale) {
        <li class="switcher__item">
          <a
            class="switcher__link"
            [class.is-active]="isActive(option.locale)"
            [attr.href]="'?lang=' + option.locale"
            [attr.lang]="option.tag"
            [attr.hreflang]="option.tag"
            [attr.aria-current]="isActive(option.locale) ? 'true' : null"
            (click)="select(option.locale, $event)"
          >
            {{ option.label }}
          </a>
        </li>
      }
    </ul>
  `,
  styleUrl: './language-switcher.scss',
  host: {
    '[class]': "'switcher-host switcher-host--' + size()",
  },
})
export class LanguageSwitcher {
  /** `compact` for the header row, `stacked` for the mobile panel footer. */
  readonly size = input<'compact' | 'stacked'>('compact');

  private readonly direction = inject(DirectionService);

  protected readonly options: readonly LocaleOption[] = [
    { locale: 'en', label: 'EN', tag: 'en' },
    { locale: 'ar', label: 'العربية', tag: 'ar' },
  ];

  protected isActive(locale: AppLocale): boolean {
    return this.direction.locale() === locale;
  }

  protected select(locale: AppLocale, event: Event): void {
    // Intercepted for now. When the locale builds land, this handler is deleted
    // and the href does the work.
    event.preventDefault();
    this.direction.set(locale);
  }
}
