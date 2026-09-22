import { TestBed } from '@angular/core/testing';
import { Backend } from '../../platform/backend';
import { WardrobeStore } from './wardrobe-store';
import { WorkspaceAccess } from '../../platform/workspace-access';

describe('Guardado optimista de zonas', () => {
  const zone = {
    id: 1,
    name: 'Balda',
    wardrobe_id: 1,
    position_x: 32,
    position_y: 32,
    width: 200,
    height: 200,
    z_index: 0,
  };
  async function setup() {
    let complete!: (value: unknown) => void;
    const pending = new Promise((resolve) => {
      complete = resolve;
    });
    const query = {
      select: () => query,
      order: () => query,
      range: async () => ({ data: [zone], error: null }),
      update: () => query,
      eq: () => query,
      single: () => pending,
    };
    TestBed.configureTestingModule({
      providers: [WardrobeStore, { provide: Backend, useValue: { client: { from: () => query } } }],
    });
    const store = TestBed.inject(WardrobeStore);
    await store.load();
    return { store, complete };
  }
  it('publica la posición antes de la respuesta y conserva el resultado confirmado', async () => {
    const { store, complete } = await setup();
    const save = store.saveZone({ ...zone, position_x: 80 });
    expect(store.zones()[0].position_x).toBe(80);
    complete({ data: { ...zone, position_x: 80 }, error: null });
    await save;
    expect(store.zones()[0].position_x).toBe(80);
  });
  it('restaura el estado anterior si el servidor rechaza el cambio', async () => {
    const { store, complete } = await setup();
    const save = store.saveZone({ ...zone, position_x: 80 });
    expect(store.zones()[0].position_x).toBe(80);
    complete({ data: null, error: { message: 'Sin conexión' } });
    await expect(save).rejects.toThrow('Sin conexión');
    expect(store.zones()[0].position_x).toBe(32);
  });
  it('una respuesta tardía no repuebla la caché después de cerrar el espacio', async () => {
    const { store, complete } = await setup();
    const save = store.saveZone({ ...zone, position_x: 80 });
    TestBed.inject(WorkspaceAccess).reset();
    expect(store.zones()).toEqual([]);
    complete({ data: { ...zone, position_x: 80 }, error: null });
    await save;
    expect(store.zones()).toEqual([]);
  });
  it('un rollback tardío tampoco restaura datos tras cerrar el espacio', async () => {
    const { store, complete } = await setup();
    const save = store.saveZone({ ...zone, position_x: 80 });
    TestBed.inject(WorkspaceAccess).reset();
    complete({ data: null, error: { message: 'Conflicto' } });
    await expect(save).rejects.toThrow('Conflicto');
    expect(store.zones()).toEqual([]);
  });
});
