export interface Rect {
  position_x: number;
  position_y: number;
  width: number;
  height: number;
}
export interface Point {
  x: number;
  y: number;
}
export function rectOf(rect: Rect): Rect {
  return {
    position_x: rect.position_x,
    position_y: rect.position_y,
    width: rect.width,
    height: rect.height,
  };
}
export function constrain(rect: Rect, bounds: { width: number; height: number }): Rect {
  const width = Math.max(80, Math.min(bounds.width, rect.width));
  const height = Math.max(80, Math.min(bounds.height, rect.height));
  return {
    position_x: Math.max(0, Math.min(bounds.width - width, rect.position_x)),
    position_y: Math.max(0, Math.min(bounds.height - height, rect.position_y)),
    width,
    height,
  };
}
export function transformRect(
  rect: Rect,
  delta: Point,
  resize: boolean,
  bounds: { width: number; height: number },
  snapping = true,
): Rect {
  const snap = (n: number) => (snapping ? Math.round(n / 8) * 8 : Math.round(n * 100) / 100);
  return constrain(
    resize
      ? { ...rect, width: snap(rect.width + delta.x), height: snap(rect.height + delta.y) }
      : {
          ...rect,
          position_x: snap(rect.position_x + delta.x),
          position_y: snap(rect.position_y + delta.y),
        },
    bounds,
  );
}
export function hitTest<T extends Rect & { z_index: number }>(
  zones: T[],
  point: Point,
): T | undefined {
  return [...zones]
    .sort((a, b) => b.z_index - a.z_index)
    .find(
      (z) =>
        point.x >= z.position_x &&
        point.y >= z.position_y &&
        point.x <= z.position_x + z.width &&
        point.y <= z.position_y + z.height,
    );
}
export function thumbnailLayout(rect: Rect, count: number) {
  const columns = Math.max(1, Math.floor((rect.width - 24) / 76));
  const rows = Math.max(0, Math.floor((rect.height - 72) / 76));
  const capacity = columns * rows;
  return { columns, visible: Math.min(count, capacity), remaining: Math.max(0, count - capacity) };
}
export interface GeometryCommand {
  id: number;
  before: Rect;
  after: Rect;
}
export class CommandHistory<T = GeometryCommand> {
  private past: T[] = [];
  private future: T[] = [];
  get canUndo() {
    return this.past.length > 0;
  }
  get canRedo() {
    return this.future.length > 0;
  }
  push(command: T) {
    this.past.push(structuredClone(command));
    this.future = [];
  }
  undo() {
    const command = this.past.pop();
    if (command) this.future.push(command);
    return command;
  }
  redo() {
    const command = this.future.pop();
    if (command) this.past.push(command);
    return command;
  }
  clear() {
    this.past = [];
    this.future = [];
  }
}
