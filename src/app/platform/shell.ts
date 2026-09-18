import { ChangeDetectionStrategy, Component, ElementRef, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Backend, errorMessage, unwrap } from './backend';
import { VersionButton } from './version-button';
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, VersionButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<a class="skip-link" href="#main-content">Saltar al contenido</a>
    <header class="shell-header">
      <a routerLink="/armarios" class="wordmark" aria-label="Outify, mis armarios"
        >outify<span aria-hidden="true">↗</span></a
      >
      <nav aria-label="Navegación principal">
        <a routerLink="/armarios" routerLinkActive="active">Armarios</a
        ><a routerLink="/articulos" routerLinkActive="active">Artículos</a>
      </nav>
      <a routerLink="/cuenta" routerLinkActive="active" class="account-link"
        >Mi cuenta <span aria-hidden="true">↗</span></a
      >
    </header>
    <main id="main-content" tabindex="-1" class="main-content">
      @if (error()) {
        <div role="alert" class="empty">
          <h1>No hemos podido abrir tu espacio</h1>
          <p>{{ error() }}</p>
          <button (click)="initialize()">Reintentar</button>
        </div>
      } @else if (ready()) {
        <router-outlet (activate)="focusContent()" />
      } @else {
        <p class="empty" role="status">Preparando tu espacio…</p>
      }
    </main>
    <footer class="shell-footer">
      <span>Un lugar para lo que te acompaña.</span
      ><span class="eyebrow">OUTIFY · TU ARMARIO, CON CALMA</span>
      <app-version-button />
    </footer>`,
})
export class Shell {
  private readonly backend = inject(Backend);
  private readonly element: ElementRef<HTMLElement> = inject(ElementRef);
  readonly ready = signal(false);
  readonly error = signal('');
  constructor() {
    void this.initialize();
  }
  focusContent() {
    requestAnimationFrame(() =>
      this.element.nativeElement
        .querySelector<HTMLElement>('#main-content')
        ?.focus({ preventScroll: true }),
    );
  }
  async initialize() {
    this.error.set('');
    try {
      unwrap(await this.backend.client.rpc('initialize_user_workspace'));
      this.ready.set(true);
    } catch (e) {
      this.error.set(errorMessage(e));
    }
  }
}
