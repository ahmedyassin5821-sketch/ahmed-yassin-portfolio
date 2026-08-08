import { Signal, computed, inject } from '@angular/core';

import { AppLocale, DirectionService } from './direction.service';

/**
 * A value that exists in both languages.
 *
 * Typing it as a required pair rather than an optional translation is the point:
 * a missing Arabic string is a compile error, not something discovered when
 * someone switches language and finds an English label staring back.
 */
export type Localized<T = string> = {
  readonly [K in AppLocale]: T;
};

/** Recursively resolves every `Localized` leaf in a content tree. */
export type Resolved<T> =
  T extends Localized<infer V>
    ? V
    : T extends readonly (infer E)[]
      ? readonly Resolved<E>[]
      : T extends object
        ? { readonly [K in keyof T]: Resolved<T[K]> }
        : T;

function isLocalized(value: unknown): value is Localized<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    'en' in value &&
    'ar' in value &&
    Object.keys(value).length === 2
  );
}

/**
 * Walks a content tree and replaces every `Localized` node with the active
 * language's value.
 *
 * Resolving a whole block at once — rather than translating string by string in
 * the template — is what keeps components locale-unaware: a section holds one
 * `computed()` and its template reads plain properties.
 */
export function resolveLocalized<T>(value: T, locale: AppLocale): Resolved<T> {
  if (isLocalized(value)) return value[locale] as Resolved<T>;

  if (Array.isArray(value)) {
    return value.map((item) => resolveLocalized(item, locale)) as Resolved<T>;
  }

  if (typeof value === 'object' && value !== null) {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      out[key] = resolveLocalized(item, locale);
    }
    return out as Resolved<T>;
  }

  return value as Resolved<T>;
}

/**
 * Binds a content tree to the active language as a signal.
 *
 * Must be called in an injection context.
 *
 * @example
 * protected readonly c = localizedContent(HOME_CONTENT.hero);
 * // template: {{ c().title }}
 */
export function localizedContent<T>(content: T): Signal<Resolved<T>> {
  const direction = inject(DirectionService);
  return computed(() => resolveLocalized(content, direction.locale()));
}
