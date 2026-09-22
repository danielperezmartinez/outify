import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { WorkspaceAccess } from '../platform/workspace-access';
import { errorMessage } from '../platform/backend';
import { runtimeConfig } from '../platform/runtime-config';

@Component({
  selector: 'app-delete-account',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section class="account-deletion" aria-labelledby="delete-account-title">
    <h2 id="delete-account-title">Eliminar mis datos de Outify</h2>
    <p>
      Se eliminarán tus armarios, zonas, prendas, etiquetas y fotografías de {{ environment }}. Esta
      acción es irreversible. Tu cuenta de Google y los datos de otras aplicaciones se conservan.
    </p>
    <p class="muted">
      Para solicitar también la supresión de datos de otros entornos de Outify, escribe a
      <a href="mailto:dlperezmartinez@gmail.com">dlperezmartinez@gmail.com</a>.
    </p>
    @if (!confirming()) {
      <button class="danger" (click)="confirming.set(true)">Eliminar mis datos</button>
    } @else {
      <div class="deletion-confirmation">
        <label for="delete-confirmation">Escribe ELIMINAR para confirmar</label>
        <input
          id="delete-confirmation"
          autocomplete="off"
          [value]="confirmation()"
          (input)="setConfirmation($event)"
          [disabled]="busy()"
        />
        <p>
          El acceso se cerrará al registrar la solicitud. La limpieza continuará aunque cierres la
          app.
        </p>
        <div class="deletion-actions">
          <button
            class="danger"
            [disabled]="busy() || confirmation() !== 'ELIMINAR'"
            (click)="remove()"
          >
            {{ busy() ? 'Registrando solicitud…' : 'Eliminar definitivamente' }}
          </button>
          <button [disabled]="busy()" (click)="cancel()">Cancelar</button>
        </div>
      </div>
    }
    @if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    }
  </section>`,
})
export class DeleteAccount {
  private readonly workspace = inject(WorkspaceAccess);
  readonly environment =
    String(runtimeConfig.schema) === 'outify' ? 'este espacio' : 'este espacio de pruebas';
  readonly confirming = signal(false);
  readonly confirmation = signal('');
  readonly busy = signal(false);
  readonly error = signal('');
  setConfirmation(event: Event) {
    this.confirmation.set((event.target as HTMLInputElement).value);
  }
  cancel() {
    this.confirming.set(false);
    this.confirmation.set('');
    this.error.set('');
  }
  async remove() {
    if (this.busy() || this.confirmation() !== 'ELIMINAR') return;
    this.busy.set(true);
    this.error.set('');
    try {
      await this.workspace.requestDeletion();
    } catch (cause) {
      this.error.set(errorMessage(cause));
    } finally {
      this.busy.set(false);
    }
  }
}
