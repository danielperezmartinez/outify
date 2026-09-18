import { DOCUMENT } from '@angular/common';
import { ApplicationRef, computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwUpdate } from '@angular/service-worker';
import { filter, fromEvent, interval, merge, switchMap, take } from 'rxjs';
import { appVersion } from './app-version';

@Injectable({ providedIn: 'root' })
export class AppUpdates {
  private readonly worker = inject(SwUpdate, { optional: true });
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly availableState = signal(false);
  private readonly dismissedState = signal(false);
  private readonly recoveryState = signal(false);
  private readonly checkingState = signal(false);
  private readonly feedbackState = signal('');
  private readonly nextVersionState = signal('');

  readonly version = appVersion;
  readonly checking = this.checkingState.asReadonly();
  readonly feedback = this.feedbackState.asReadonly();
  readonly nextVersion = this.nextVersionState.asReadonly();
  readonly needsRecovery = this.recoveryState.asReadonly();
  readonly visible = computed(
    () => (this.availableState() || this.recoveryState()) && !this.dismissedState(),
  );

  constructor() {
    if (!this.worker?.isEnabled) return;

    this.worker.versionUpdates.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event.type === 'VERSION_READY') {
        const data: unknown = event.latestVersion.appData;
        this.nextVersionState.set(
          data && typeof data === 'object' && 'version' in data && typeof data.version === 'string'
            ? data.version
            : '',
        );
        this.availableState.set(true);
        this.dismissedState.set(false);
        this.feedbackState.set('');
      } else if (event.type === 'VERSION_INSTALLATION_FAILED') {
        this.feedbackState.set(
          'No se pudo descargar la actualización. Puedes volver a comprobarla.',
        );
      }
    });
    this.worker.unrecoverable.pipe(takeUntilDestroyed()).subscribe(() => {
      this.recoveryState.set(true);
      this.dismissedState.set(false);
    });

    inject(ApplicationRef)
      .isStable.pipe(
        filter(Boolean),
        take(1),
        switchMap(() =>
          merge(interval(15 * 60 * 1000), fromEvent(this.document, 'visibilitychange')),
        ),
        filter(() => this.document.visibilityState === 'visible'),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => void this.check());
  }

  async check(manual = false): Promise<void> {
    if (manual) {
      this.dismissedState.set(false);
      this.feedbackState.set('');
    }
    if (!this.worker?.isEnabled) {
      if (manual)
        this.feedbackState.set(
          'Las actualizaciones estarán disponibles en la aplicación publicada.',
        );
      return;
    }
    if (this.checkingState()) return;
    this.checkingState.set(true);
    try {
      const found = await this.worker.checkForUpdate();
      if (found) this.availableState.set(true);
      if (manual && !found && !this.availableState() && !this.recoveryState()) {
        this.feedbackState.set('Estás usando la última versión.');
      }
    } catch {
      if (manual)
        this.feedbackState.set('No se pudo comprobar. Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      this.checkingState.set(false);
    }
  }

  dismiss(): void {
    this.dismissedState.set(true);
    this.feedbackState.set('');
  }

  reload(): void {
    // La recarga conserva las protecciones beforeunload de los formularios.
    // No activar el worker en caliente: mezclaría bundles de distintas versiones.
    this.document.defaultView?.location.reload();
  }
}
