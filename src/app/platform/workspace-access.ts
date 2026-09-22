import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { Backend, unwrap } from './backend';

export type WorkspaceStatus = 'age_required' | 'active' | 'pending' | 'deleted' | 'reauth_required';
export const ageConfirmationKey = 'outify-age-confirmation';

@Injectable({ providedIn: 'root' })
export class WorkspaceAccess {
  private readonly backend = inject(Backend);
  private readonly current = signal<WorkspaceStatus | null>(null);
  readonly status = this.current.asReadonly();
  private readonly caches = new Set<() => void>();
  private generation = 0;
  private requestGeneration = 0;
  get revision() {
    return this.generation;
  }
  registerCache(clear: () => void, lifetime: DestroyRef) {
    this.caches.add(clear);
    lifetime.onDestroy(() => this.caches.delete(clear));
  }
  reset() {
    this.requestGeneration++;
    this.generation++;
    this.caches.forEach((clear) => clear());
    this.current.set(null);
  }
  private setStatus(status: WorkspaceStatus | null) {
    if (status !== this.current()) {
      this.generation++;
      if (status !== 'active') this.caches.forEach((clear) => clear());
      this.current.set(status);
    }
  }

  async refresh() {
    const requestGeneration = ++this.requestGeneration;
    const status = unwrap(await this.backend.client.rpc('get_workspace_status'));
    if (requestGeneration !== this.requestGeneration) return;
    if (
      typeof status !== 'string' ||
      !['age_required', 'active', 'pending', 'deleted', 'reauth_required'].includes(status)
    )
      throw new Error('No se pudo comprobar el estado de tu espacio. Reintenta.');
    this.setStatus(status as WorkspaceStatus);
  }

  async activate(ageConfirmed: boolean, startNew = false) {
    if (!ageConfirmed) throw new Error('Debes tener al menos 14 años para crear una cuenta.');
    unwrap(
      await this.backend.client.rpc('activate_workspace', {
        age_confirmed: ageConfirmed,
        start_new: startNew,
      }),
    );
    await this.refresh();
  }

  async requestDeletion() {
    const { data, error } = await this.backend.client.auth.getSession();
    if (error || !data.session) throw new Error('Vuelve a iniciar sesión para continuar.');
    try {
      const response = await fetch('/api/account-deletion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.session.access_token}`,
        },
        body: JSON.stringify({ confirmation: 'ELIMINAR' }),
      });
      if (!response.ok)
        throw new Error('No se pudo completar la solicitud. Reintenta o contacta con soporte.');
      await this.refresh();
    } catch (cause) {
      // La respuesta puede perderse después de que el servidor registre la baja.
      await this.refresh().catch(() => {});
      throw cause;
    }
  }
}
