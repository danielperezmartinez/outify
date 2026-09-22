import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { WorkspaceAccess } from './workspace-access';
import { Session } from './session';
import { errorMessage } from './backend';
import { DeleteAccount } from '../account/delete-account';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-workspace-gate',
  imports: [DeleteAccount, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section class="account-panel workspace-gate">
    @if (workspace.status() === 'reauth_required') {
      <h1>Vuelve a iniciar sesión</h1>
      <p>
        Esta sesión corresponde a un espacio anterior. Ciérrala y entra de nuevo para continuar.
      </p>
    } @else if (workspace.status() === 'pending') {
      <h1>Estamos eliminando tus datos</h1>
      <p>
        Tu espacio está cerrado. La limpieza de fotografías y datos seguirá desde el servidor,
        aunque cierres esta página. Comprobaremos también que no queden cargas pendientes.
      </p>
      <p>
        Se revisa automáticamente cada día. Si algún servicio falla, la solicitud se conserva y se
        reintenta.
      </p>
      <button [disabled]="busy()" (click)="refresh()">Comprobar estado</button>
    } @else {
      <h1>
        {{
          workspace.status() === 'deleted'
            ? 'Tus datos de Outify se han eliminado'
            : 'Antes de abrir tu espacio'
        }}
      </h1>
      @if (workspace.status() === 'deleted') {
        <p>
          Los datos y fotografías de este espacio se han eliminado del servicio activo. Tu cuenta de
          Google y otras aplicaciones siguen disponibles.
        </p>
        <p>
          Si quieres volver a empezar, inicia una nueva sesión y confirma la creación de un espacio
          vacío.
        </p>
      }
      <label class="age-confirmation">
        <input type="checkbox" [checked]="ageConfirmed()" (change)="confirmAge($event)" />
        Confirmo que tengo al menos 14 años.
      </label>
      <p class="muted">Las personas menores de 14 años no pueden crear una cuenta de Outify.</p>
      <p class="small">
        Al abrir tu espacio aceptas las <a routerLink="/terms">condiciones de uso</a>. Consulta la
        <a routerLink="/privacy">política de privacidad</a>.
      </p>
      <button class="primary" [disabled]="busy() || !ageConfirmed()" (click)="activate()">
        {{ workspace.status() === 'deleted' ? 'Crear un espacio nuevo' : 'Abrir mi espacio' }}
      </button>
    }
    <button class="gate-logout" [disabled]="busy()" (click)="logout()">Cerrar sesión</button>
    @if (error()) {
      <p role="alert" class="error">{{ error() }}</p>
    }
    @if (workspace.status() === 'age_required') {
      <app-delete-account />
    }
  </section>`,
})
export class WorkspaceGate {
  readonly workspace = inject(WorkspaceAccess);
  private readonly session = inject(Session);
  readonly ageConfirmed = signal(false);
  readonly busy = signal(false);
  readonly error = signal('');
  confirmAge(event: Event) {
    this.ageConfirmed.set((event.target as HTMLInputElement).checked);
  }
  async activate() {
    await this.perform(() =>
      this.workspace.activate(this.ageConfirmed(), this.workspace.status() === 'deleted'),
    );
  }
  async refresh() {
    await this.perform(() => this.workspace.refresh());
  }
  async logout() {
    await this.perform(() => this.session.logout());
  }
  private async perform(action: () => Promise<void>) {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    try {
      await action();
    } catch (cause) {
      this.error.set(errorMessage(cause));
    } finally {
      this.busy.set(false);
    }
  }
}
