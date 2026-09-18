import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AppUpdates } from './app-updates';

@Component({
  selector: 'app-update-notice',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (updates.visible() || updates.feedback()) {
      <aside class="update-notice" aria-label="Actualizaciones de Outify">
        <div role="status" aria-live="polite">
          @if (updates.visible()) {
            <strong>{{
              updates.needsRecovery()
                ? 'Necesitamos recargar Outify'
                : 'Hay una nueva versión disponible'
            }}</strong>
            <p>
              @if (updates.nextVersion()) {
                Versión {{ updates.nextVersion() }}.
              }
              Guarda tus cambios antes de actualizar.
            </p>
          }
          @if (updates.feedback()) {
            <p>{{ updates.feedback() }}</p>
          }
        </div>
        <div class="update-actions">
          @if (updates.visible()) {
            <button type="button" class="primary" (click)="updates.reload()">Actualizar</button>
          }
          <button type="button" class="text-button" (click)="updates.dismiss()">
            {{ updates.visible() ? 'Más tarde' : 'Cerrar' }}
          </button>
        </div>
      </aside>
    }
  `,
  styles: `
    .update-notice {
      position: fixed;
      z-index: 80;
      right: max(20px, env(safe-area-inset-right));
      bottom: max(20px, env(safe-area-inset-bottom));
      width: min(410px, calc(100vw - 40px));
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 20px;
      background: var(--rice-paper);
      box-shadow: 0 6px 24px #29272412;
      font-size: 14px;
    }
    strong {
      font-weight: 600;
    }
    p {
      margin: 7px 0 0;
      color: var(--body);
    }
    .update-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      margin-top: 16px;
    }
  `,
})
export class UpdateNotice {
  readonly updates = inject(AppUpdates);
}
