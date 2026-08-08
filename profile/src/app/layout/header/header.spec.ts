import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { ShellUiService } from '@core/shell/shell-ui.service';
import { Header } from './header';

@Component({ template: 'work' })
class WorkStub {}

describe('Header', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideRouter([
          { path: '', component: WorkStub },
          { path: 'work', component: WorkStub },
        ]),
      ],
    }).compileComponents();
  });

  async function render() {
    const fixture = TestBed.createComponent(Header);
    await fixture.whenStable();
    return fixture;
  }

  it('renders semantic header and a labelled nav', async () => {
    const el = (await render()).nativeElement as HTMLElement;

    expect(el.querySelector('header')).not.toBeNull();
    // Labelled because the footer carries a second nav — with two on the page,
    // distinguishing them is required rather than redundant.
    expect(el.querySelector('nav')?.getAttribute('aria-label')).toBe('Primary');
  });

  it('renders every primary link in order', async () => {
    const el = (await render()).nativeElement as HTMLElement;
    const labels = Array.from(el.querySelectorAll('.header__link')).map((a) =>
      a.textContent?.trim(),
    );

    expect(labels).toEqual(['Work', 'About', 'CV', 'Contact']);
  });

  it('exposes the AY mark as a labelled home link', async () => {
    const el = (await render()).nativeElement as HTMLElement;
    const brand = el.querySelector('.header__brand')!;

    expect(brand.getAttribute('aria-label')).toBe('Ahmed Yassin — home');
    expect(brand.querySelector('app-logo')).not.toBeNull();
  });

  it('reflects menu state on the trigger', async () => {
    const fixture = await render();
    const shell = TestBed.inject(ShellUiService);
    const trigger = (fixture.nativeElement as HTMLElement).querySelector('.header__trigger')!;

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-controls')).toBe('mobile-nav');

    trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await fixture.whenStable();

    expect(shell.menuOpen()).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    shell.close();
  });

  it('marks the active route with aria-current', async () => {
    const harness = await RouterTestingHarness.create();
    const fixture = TestBed.createComponent(Header);
    await harness.navigateByUrl('/work');
    await fixture.whenStable();

    const links = (fixture.nativeElement as HTMLElement).querySelectorAll('.header__link');
    const work = Array.from(links).find((a) => a.textContent?.trim() === 'Work')!;
    const about = Array.from(links).find((a) => a.textContent?.trim() === 'About')!;

    // Colour alone may never carry state; aria-current is the machine-readable
    // half of the 2px underline.
    expect(work.getAttribute('aria-current')).toBe('page');
    expect(about.getAttribute('aria-current')).toBeNull();
  });

  it('starts unpinned so the header is borderless at the top', async () => {
    const el = (await render()).nativeElement as HTMLElement;

    expect(el.querySelector('header')?.classList.contains('is-pinned')).toBe(false);
    // The sentinel is what drives the pinned state, via IntersectionObserver
    // rather than a scroll listener.
    expect(el.querySelector('.header__sentinel')).not.toBeNull();
    expect(el.querySelector('.header__sentinel')?.getAttribute('aria-hidden')).toBe('true');
  });
});
