import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Backend, errorMessage, unwrap } from './backend';
import { VersionButton } from './version-button';
import { WorkspaceAccess, ageConfirmationKey } from './workspace-access';
import { WorkspaceGate } from './workspace-gate';
import { LegalLinks } from '../shared/ui/legal-links';
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, VersionButton, WorkspaceGate, LegalLinks],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<a class="skip-link" href="#main-content">Saltar al contenido</a>
    <header class="shell-header">
      <a routerLink="/wardrobes" class="wordmark" aria-label="Outify, mis armarios"
        >outify<span aria-hidden="true">↗</span></a
      >
      <nav aria-label="Navegación principal">
        <a routerLink="/wardrobes" routerLinkActive="active">Armarios</a
        ><a routerLink="/items" routerLinkActive="active">Artículos</a>
      </nav>
      <a routerLink="/account" routerLinkActive="active" class="account-link"
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
        @if (workspace.status() === 'active') {
          <router-outlet (activate)="focusContent()" />
        } @else {
          <app-workspace-gate />
        }
      } @else {
        <p class="empty" role="status">Preparando tu espacio…</p>
      }
    </main>
    <footer class="shell-footer">
      <span>Un lugar para lo que te acompaña.</span
      ><span class="eyebrow">OUTIFY · TU ARMARIO, CON CALMA</span>
      <app-version-button />
      <app-legal-links />
    </footer>`,
})
export class Shell {
  private readonly backend = inject(Backend);
  readonly workspace = inject(WorkspaceAccess);
  private readonly element: ElementRef<HTMLElement> = inject(ElementRef);
  readonly ready = signal(false);
  readonly error = signal('');
  constructor() {
    void this.initialize();
    const refresh = () => {
      if (document.visibilityState === 'visible') void this.workspace.refresh().catch(() => {});
    };
    const timer = setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    inject(DestroyRef).onDestroy(() => {
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
    });
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
      await this.workspace.refresh();
      const confirmedAt = Number(sessionStorage.getItem(ageConfirmationKey));
      sessionStorage.removeItem(ageConfirmationKey);
      if (
        this.workspace.status() === 'age_required' &&
        confirmedAt > Date.now() - 600000 &&
        confirmedAt <= Date.now()
      )
        await this.workspace.activate(true);
      if (this.workspace.status() === 'active')
        unwrap(await this.backend.client.rpc('initialize_user_workspace'));
      this.ready.set(true);
    } catch (e) {
      this.error.set(errorMessage(e));
    }
  }
}
