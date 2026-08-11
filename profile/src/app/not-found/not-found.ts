import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';

import { TextLink } from '@shared/ui/text-link/text-link';

/**
 * The not-found page.
 *
 * ## Why it sets `robots: noindex` itself
 *
 * It is reachable at two addresses: `'**'` for anything genuinely unknown, and the
 * concrete `/404` path that exists so the page can be prerendered to a file for
 * static hosting (see `app.routes.server.ts`).
 *
 * On the Node server the `'**'` route already answers 404 with an `X-Robots-Tag`
 * header, but `/404` is prerendered and answers 200 — so without this the deployment
 * would have introduced an indexable "Page not found" URL. A meta tag set by the
 * component covers both addresses and both hosts, including in the prerendered HTML,
 * because prerendering runs the component.
 */
@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TextLink],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
})
export class NotFound {
  constructor() {
    inject(Meta).updateTag({ name: 'robots', content: 'noindex' });
  }
}
