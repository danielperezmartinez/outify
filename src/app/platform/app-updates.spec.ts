import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SwUpdate, UnrecoverableStateEvent, VersionEvent } from '@angular/service-worker';
import { Subject } from 'rxjs';
import { AppUpdates } from './app-updates';

describe('Actualizaciones de la aplicación', () => {
  let events: Subject<VersionEvent>;
  let recovery: Subject<UnrecoverableStateEvent>;
  let check: ReturnType<typeof vi.fn<() => Promise<boolean>>>;
  let updates: AppUpdates;
  beforeEach(() => {
    events = new Subject();
    recovery = new Subject();
    check = vi.fn<() => Promise<boolean>>().mockResolvedValue(false);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SwUpdate,
          useValue: {
            isEnabled: true,
            versionUpdates: events,
            unrecoverable: recovery,
            checkForUpdate: check,
          },
        },
        { provide: ApplicationRef, useValue: { isStable: new Subject<boolean>() } },
      ],
    });
    updates = TestBed.inject(AppUpdates);
  });

  function ready(version = '0.2.0') {
    events.next({
      type: 'VERSION_READY',
      currentVersion: { hash: 'old' },
      latestVersion: { hash: version, appData: { version } },
    });
  }

  it('avisa solo cuando la descarga está lista, sin recargar automáticamente', () => {
    events.next({ type: 'VERSION_DETECTED', version: { hash: 'new' } });
    expect(updates.visible()).toBe(false);
    ready();
    expect(updates.visible()).toBe(true);
    expect(updates.nextVersion()).toBe('0.2.0');
  });

  it('permite posponer y recuperar el aviso desde el número de versión', async () => {
    ready();
    updates.dismiss();
    expect(updates.visible()).toBe(false);
    await updates.check(true);
    expect(updates.visible()).toBe(true);
    expect(updates.feedback()).toBe('');
  });

  it('una comprobación periódica no reabre un aviso pospuesto', async () => {
    ready();
    updates.dismiss();
    await updates.check();
    expect(updates.visible()).toBe(false);
    ready('0.3.0');
    expect(updates.visible()).toBe(true);
  });

  it('informa de ausencia de actualizaciones y de errores de conexión manuales', async () => {
    await updates.check(true);
    expect(updates.feedback()).toContain('última versión');
    check.mockRejectedValue(new Error('offline'));
    await updates.check(true);
    expect(updates.feedback()).toContain('conexión');
    expect(updates.checking()).toBe(false);
    updates.dismiss();
    await updates.check();
    expect(updates.feedback()).toBe('');
  });

  it('no duplica comprobaciones en curso', async () => {
    let resolve!: (value: boolean) => void;
    check.mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );
    const pending = updates.check();
    await updates.check();
    expect(check).toHaveBeenCalledTimes(1);
    resolve(false);
    await pending;
  });

  it('explica los fallos de instalación y permite recuperar un worker roto', () => {
    events.next({
      type: 'VERSION_INSTALLATION_FAILED',
      version: { hash: 'new' },
      error: 'network',
    });
    expect(updates.visible()).toBe(false);
    expect(updates.feedback()).toContain('descargar');
    recovery.next({ type: 'UNRECOVERABLE_STATE', reason: 'missing chunk' });
    expect(updates.visible()).toBe(true);
    expect(updates.needsRecovery()).toBe(true);
  });
});
