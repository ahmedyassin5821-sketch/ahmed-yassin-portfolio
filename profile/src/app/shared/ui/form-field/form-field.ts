import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
  signal,
} from '@angular/core';

import { Icon } from '../icon/icon';

let uid = 0;

export type InputType = 'text' | 'email' | 'tel' | 'url' | 'password' | 'search';

/**
 * Labelled text input.
 *
 * Field and label ship together deliberately: a standalone input invites a
 * placeholder-as-label, which disappears on focus, fails 1.3.1, and is the most
 * common form defect on portfolio sites.
 *
 * ## Error state without colour
 *
 * The palette is monochrome, so an invalid field is marked by three
 * simultaneous signals: a 2px border (vs 1px), an alert icon, and message text.
 * `aria-invalid` and `aria-describedby` carry it to assistive tech, and the
 * message is `role="alert"` so it is announced when it appears.
 *
 * Validation reports on blur, not per keystroke — telling someone their email is
 * invalid while they are still typing the third character is hostile.
 */
@Component({
  selector: 'app-form-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <label class="field__label" [attr.for]="id">
      {{ label() }}
      @if (required()) {
        <span class="field__required" aria-hidden="true">*</span>
        <span class="sr-only">(required)</span>
      }
    </label>

    @if (hint()) {
      <!-- Persistent hint. A placeholder cannot do this job: it vanishes the
           moment the field has content, exactly when it is still needed. -->
      <p class="field__hint" [attr.id]="hintId">{{ hint() }}</p>
    }

    <div class="field__control">
      @if (multiline()) {
        <textarea
          class="field__input"
          [attr.id]="id"
          [attr.name]="name() || id"
          [attr.rows]="rows()"
          [attr.placeholder]="placeholder() || null"
          [attr.autocomplete]="autocomplete() || null"
          [attr.aria-describedby]="describedBy()"
          [attr.aria-invalid]="showError() ? 'true' : null"
          [attr.required]="required() ? '' : null"
          [disabled]="disabled()"
          [value]="value()"
          (input)="onInput($event)"
          (blur)="onBlur()"
        ></textarea>
      } @else {
        <input
          class="field__input"
          [attr.id]="id"
          [attr.name]="name() || id"
          [attr.type]="type()"
          [attr.inputmode]="inputMode()"
          [attr.placeholder]="placeholder() || null"
          [attr.autocomplete]="autocomplete() || null"
          [attr.aria-describedby]="describedBy()"
          [attr.aria-invalid]="showError() ? 'true' : null"
          [attr.required]="required() ? '' : null"
          [disabled]="disabled()"
          [value]="value()"
          (input)="onInput($event)"
          (blur)="onBlur()"
        />
      }
    </div>

    @if (showError()) {
      <p class="field__error" [attr.id]="errorId" role="alert">
        <app-icon name="alert-circle" size="sm" />
        <span>{{ error() }}</span>
      </p>
    }
  `,
  styleUrl: './form-field.scss',
  host: {
    '[class.is-invalid]': 'showError()',
    '[class.is-disabled]': 'disabled()',
  },
})
export class FormField {
  readonly label = input.required<string>();
  readonly name = input<string>('');
  readonly type = input<InputType>('text');
  readonly placeholder = input<string>('');
  readonly hint = input<string>('');
  readonly error = input<string>('');
  readonly required = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly multiline = input(false, { transform: booleanAttribute });
  readonly rows = input<number>(4);
  readonly autocomplete = input<string>('');

  /**
   * Two-way. `model()` rather than an `input`/`output` pair: declaring `value`
   * and `valueChange` separately collides with Angular's two-way binding
   * convention and is rejected at compile time.
   */
  readonly value = model<string>('');

  readonly blurred = output<void>();

  private readonly touched = signal(false);

  protected readonly id = `field-${uid++}`;
  protected readonly hintId = `${this.id}-hint`;
  protected readonly errorId = `${this.id}-error`;

  /** Errors surface after blur, never mid-typing. */
  protected readonly showError = computed(() => this.error().length > 0 && this.touched());

  /**
   * Order matters: assistive tech reads the hint before the error, which matches
   * the visual order and gives the user the rule before the complaint.
   */
  protected readonly describedBy = computed(() => {
    const ids = [this.hint() ? this.hintId : '', this.showError() ? this.errorId : ''].filter(
      Boolean,
    );
    return ids.length ? ids.join(' ') : null;
  });

  /** Surfaces the right mobile keyboard. */
  protected readonly inputMode = computed(() => {
    switch (this.type()) {
      case 'email':
        return 'email';
      case 'tel':
        return 'tel';
      case 'url':
        return 'url';
      case 'search':
        return 'search';
      default:
        return null;
    }
  });

  protected onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement | HTMLTextAreaElement).value);
  }

  protected onBlur(): void {
    this.touched.set(true);
    this.blurred.emit();
  }
}
