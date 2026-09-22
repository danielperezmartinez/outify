import { TestBed } from '@angular/core/testing';
import { Backend } from './backend';
import { WorkspaceAccess } from './workspace-access';

describe('Estado del acceso', () => {
  it('descarta una respuesta activa antigua recibida después de la baja', async () => {
    let finishOld!: (result: unknown) => void;
    const old = new Promise((resolve) => {
      finishOld = resolve;
    });
    let calls = 0;
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Backend,
          useValue: {
            client: {
              rpc: () => (++calls === 1 ? old : Promise.resolve({ data: 'pending', error: null })),
            },
          },
        },
      ],
    });
    const workspace = TestBed.inject(WorkspaceAccess);
    const previous = workspace.refresh();
    await workspace.refresh();
    finishOld({ data: 'active', error: null });
    await previous;
    expect(workspace.status()).toBe('pending');
  });
});
