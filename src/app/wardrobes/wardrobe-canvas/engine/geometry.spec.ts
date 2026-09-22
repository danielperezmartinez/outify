import { CommandHistory, constrain, hitTest, thumbnailLayout, transformRect } from './geometry';
describe('Motor de geometría', () => {
  const rect = { position_x: 20, position_y: 20, width: 200, height: 160 };
  const bounds = { width: 800, height: 600 };
  it('ajusta a cuadrícula por defecto y permite precisión libre sin perder límites', () => {
    expect(transformRect(rect, { x: 7, y: 3 }, false, bounds).position_x).toBe(24);
    expect(transformRect(rect, { x: 7, y: 3 }, false, bounds, false).position_x).toBe(27);
    expect(transformRect(rect, { x: 7, y: 3 }, true, bounds, false).width).toBe(207);
    expect(transformRect(rect, { x: -100, y: 1000 }, false, bounds, false).position_y).toBe(440);
  });
  it('mantiene las zonas dentro del armario al moverlas', () => {
    expect(transformRect(rect, { x: 1000, y: -200 }, false, bounds)).toEqual({
      ...rect,
      position_x: 600,
      position_y: 0,
    });
  });
  it('limita el tamaño mínimo y el tamaño del armario', () => {
    expect(constrain({ ...rect, width: 900, height: 10 }, bounds)).toEqual({
      position_x: 0,
      position_y: 20,
      width: 800,
      height: 80,
    });
  });
  it('selecciona la zona superior cuando se superponen', () => {
    expect(
      hitTest(
        [
          { ...rect, id: 1, z_index: 0 },
          { ...rect, id: 2, z_index: 1 },
        ],
        { x: 50, y: 50 },
      )?.id,
    ).toBe(2);
    expect(hitTest([{ ...rect, z_index: 0 }], { x: 0, y: 0 })).toBeUndefined();
  });
  it('reserva espacio y contabiliza las miniaturas que no caben', () => {
    expect(thumbnailLayout({ position_x: 0, position_y: 0, width: 180, height: 160 }, 5)).toEqual({
      columns: 2,
      visible: 2,
      remaining: 3,
    });
    expect(thumbnailLayout({ ...rect, height: 80 }, 2).visible).toBe(0);
  });
  it('deshace y rehace snapshots sin alias y descarta el futuro al editar', () => {
    const history = new CommandHistory();
    const command = { id: 1, before: rect, after: { ...rect, position_x: 40 } };
    history.push(command);
    command.after.position_x = 400;
    expect(history.undo()?.before.position_x).toBe(20);
    expect(history.redo()?.after.position_x).toBe(40);
    history.undo();
    history.push({ id: 2, before: rect, after: rect });
    expect(history.redo()).toBeUndefined();
  });
});
