import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { WardrobeStore } from '../wardrobe-data/wardrobe-store';
import { ItemStore } from '../../inventory/item-data/item-store';
import { WardrobeCanvas } from '../wardrobe-canvas/viewport/wardrobe-canvas';
import { CommandHistory, GeometryCommand, constrain } from '../wardrobe-canvas/engine/geometry';
import { zoneTypeOptions } from '../wardrobe-data/models';
import { EditorCommand } from '../wardrobe-data/editor-command';
import { errorMessage } from '../../platform/backend';
@Component({
  selector: 'app-wardrobe-view',
  imports: [RouterLink, ReactiveFormsModule, WardrobeCanvas],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="page-heading">
      <div>
        <p class="eyebrow">TU ESPACIO, A TU MANERA</p>
        <h1>
          {{ editing() ? 'Dale forma a tu armario' : 'Todo en su lugar'
          }}<span class="heading-dot">.</span>
        </h1>
        <p class="muted">
          {{
            editing()
              ? 'Crea zonas para la forma en que vives.'
              : 'Un pequeño mapa de lo que te acompaña.'
          }}
        </p>
      </div>
      <button [class.primary]="!editing()" (click)="toggleEdit()" [disabled]="busy()">
        {{ editing() ? '✓ Terminar edición' : 'Editar armarios ↗' }}
      </button>
    </div>
    @if (error()) {
      <p class="error" role="alert">
        {{ error() }} <button (click)="load()">Reintentar carga</button>
      </p>
    }
    @if (loading()) {
      <p role="status" class="empty">Abriendo tus armarios…</p>
    } @else {
      <div class="wardrobe-layout">
        <aside class="wardrobe-sidebar" aria-label="Lista de armarios">
          <p class="eyebrow">
            MIS ARMARIOS <span>{{ store.wardrobes().length.toString().padStart(2, '0') }}</span>
          </p>
          <div class="wardrobe-nav">
            @for (w of store.wardrobes(); track w.id) {
              <button
                [class.active]="current()?.id === w.id"
                (click)="chooseWardrobe(w.id)"
                [disabled]="busy()"
              >
                <span class="wardrobe-icon" aria-hidden="true">▥</span
                ><span
                  ><strong>{{ w.name }}</strong
                  ><small>{{ w.room || 'Tu espacio' }}</small></span
                ><span aria-hidden="true">↗</span>
              </button>
            }
          </div>
          <button class="add-wardrobe" (click)="newWardrobe()" [disabled]="busy()">
            + Nuevo armario
          </button>
          <div class="sidebar-note">
            <span aria-hidden="true">↳</span>
            <p>El orden empieza<br />por darle un lugar.</p>
          </div>
        </aside>
        <section class="workspace">
          @if (current(); as wardrobe) {
            <div class="canvas-heading">
              <div>
                <h2>{{ wardrobe.name }}</h2>
                <p class="muted small">
                  {{ wardrobe.room }} · {{ zones().length }} zonas · {{ assignedCount() }} artículos
                </p>
              </div>
              <span class="save-status" role="status">{{
                busy() ? 'Guardando…' : saveState()
              }}</span>
            </div>
            <div class="canvas-toolbar" aria-label="Herramientas del plano">
              <button (click)="canvas()?.zoom(0.8)" aria-label="Acercar">＋</button
              ><button (click)="canvas()?.zoom(1.25)" aria-label="Alejar">−</button
              ><button (click)="canvas()?.fit()">Ajustar</button>
              @if (editing()) {
                <span class="toolbar-divider"></span
                ><button (click)="addZone()" [disabled]="busy()">+ Zona</button
                ><button (click)="undo()" [disabled]="busy() || !canUndo()">Deshacer</button
                ><button (click)="redo()" [disabled]="busy() || !canRedo()">Rehacer</button>
                <button
                  type="button"
                  [attr.aria-pressed]="snapping()"
                  (click)="snapping.update(toggle)"
                >
                  Snap {{ snapping() ? 'activado' : 'desactivado' }}
                </button>
              }
              <span class="toolbar-hint">{{
                editing()
                  ? 'ARRASTRA PARA MOVER · TIRADOR PARA REDIMENSIONAR'
                  : 'ARRASTRA LAS PRENDAS ENTRE ZONAS'
              }}</span>
            </div>
            <div class="canvas-surface">
              <app-wardrobe-canvas
                [wardrobe]="wardrobe"
                [zones]="zones()"
                [items]="items.items()"
                [editing]="editing()"
                [snapping]="snapping()"
                [selected]="selectedId()"
                [disabled]="busy()"
                (select)="selectZone($event)"
                (changed)="geometry($event)"
                (relocate)="relocate($event.itemId, $event.zoneId)"
                (itemOpen)="openItem($event)"
                (more)="showZone($event)"
              />
            </div>
            <div class="canvas-bottom">
              <span class="small muted">{{
                editing()
                  ? 'Snap a 8 unidades. Mantén Mayús al arrastrar para mover libremente. En móvil, usa el botón Snap.'
                  : 'Selecciona una prenda para abrir su ficha.'
              }}</span
              ><span class="eyebrow">{{ wardrobe.width }} × {{ wardrobe.height }}</span>
            </div>
            @if (notice()) {
              <div class="notice" role="status">
                {{ notice() }} <button (click)="undoLocation()" [disabled]="busy()">Deshacer</button
                ><button aria-label="Cerrar aviso" (click)="notice.set('')">×</button>
              </div>
            }
          } @else {
            <div class="empty">
              <h2>Haz sitio a tus prendas</h2>
              <p>Crea un armario y organízalo a tu manera.</p>
              <button class="primary" (click)="newWardrobe()">Crear mi primer armario</button>
            </div>
          }
        </section>
        <aside class="detail-sidebar" aria-label="Detalles y artículos">
          @if (editing()) {
            @if (current()) {
              <form
                [formGroup]="wardrobeForm"
                (change)="saveWardrobe()"
                (ngSubmit)="saveWardrobe()"
              >
                <fieldset [disabled]="busy()">
                  <legend>El armario</legend>
                  <label>Nombre *<input formControlName="name" maxlength="120" /></label
                  ><label>Habitación<input formControlName="room" /></label
                  ><label
                    >Descripción<textarea formControlName="description" rows="2"></textarea>
                  </label>
                  <div class="form-row">
                    <label
                      >Ancho<input
                        type="number"
                        formControlName="width"
                        min="200"
                        max="4000" /></label
                    ><label
                      >Alto<input type="number" formControlName="height" min="200" max="4000"
                    /></label>
                  </div>
                  <button type="submit">Guardar armario</button
                  ><button type="button" class="text-button danger" (click)="removeWardrobe()">
                    Eliminar armario
                  </button>
                </fieldset>
              </form>
              @if (selected(); as zone) {
                <form [formGroup]="zoneForm" (change)="saveZone()" (ngSubmit)="saveZone()">
                  <fieldset [disabled]="busy()">
                    <legend>La zona seleccionada</legend>
                    <label>Nombre *<input formControlName="name" maxlength="120" /></label
                    ><label
                      >Tipo<select formControlName="type">
                        @for (o of zoneTypes; track o.value) {
                          <option [value]="o.value">{{ o.label }}</option>
                        }
                      </select></label
                    ><label>Color<input type="color" formControlName="color" /></label>
                    <div class="form-row">
                      <label
                        >X<input
                          type="number"
                          formControlName="position_x"
                          min="0"
                          step="any" /></label
                      ><label
                        >Y<input type="number" formControlName="position_y" min="0" step="any"
                      /></label>
                    </div>
                    <div class="form-row">
                      <label
                        >Ancho<input
                          type="number"
                          formControlName="width"
                          min="80"
                          step="any" /></label
                      ><label
                        >Alto<input type="number" formControlName="height" min="80" step="any"
                      /></label>
                    </div>
                    <label
                      >Orden de superposición<input
                        type="number"
                        formControlName="z_index" /></label
                    ><button type="submit">Guardar zona</button
                    ><button type="button" class="text-button danger" (click)="removeZone()">
                      Eliminar zona
                    </button>
                  </fieldset>
                </form>
              } @else {
                <p class="muted">Selecciona una zona del plano para editar sus detalles.</p>
              }
            }
          } @else {
            <div class="side-heading">
              <h2>{{ selected()?.name || 'Sin asignar' }}</h2>
              <span class="chip">{{ panelItems().length }}</span>
            </div>
            <p class="small muted">
              {{ selected() ? 'Las prendas que viven aquí.' : 'Prendas que aún buscan su lugar.' }}
            </p>
            <div class="side-items">
              @for (item of panelItems(); track item.id) {
                <div class="side-item">
                  <a [routerLink]="['/items', item.id]"
                    ><img
                      [src]="item.imageUrl"
                      [alt]="item.name"
                      width="56"
                      height="64"
                      loading="lazy"
                    /><strong>{{ item.name }}</strong></a
                  ><label
                    ><span class="sr-only">Ubicación de {{ item.name }}</span
                    ><select
                      [value]="item.zoneId ?? ''"
                      (change)="changeLocation($event, item.id)"
                      [disabled]="busy()"
                    >
                      <option value="">Sin asignar</option>
                      @for (z of store.zones(); track z.id) {
                        <option [value]="z.id">{{ store.locationLabel(z.id) }}</option>
                      }
                    </select></label
                  >
                </div>
              } @empty {
                <p class="empty small">Un poco de espacio para algo especial.</p>
              }
            </div>
            @if (selected()) {
              <button class="text-button" (click)="selectedId.set(null)">Ver sin asignar</button>
            }
            <a class="button primary full-width" routerLink="/items/new">+ Crear artículo</a>
          }
        </aside>
      </div>
    }`,
})
export class WardrobeView {
  readonly store = inject(WardrobeStore);
  readonly items = inject(ItemStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  readonly canvas = viewChild(WardrobeCanvas);
  readonly editing = signal(false);
  readonly snapping = signal(true);
  readonly toggle = (value: boolean) => !value;
  readonly busy = signal(false);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly saveState = signal('Todo guardado');
  readonly notice = signal('');
  readonly selectedId = signal<number | null>(null);
  readonly wardrobeId = signal<number | null>(
    Number(this.route.snapshot.queryParamMap.get('wardrobe')) || null,
  );
  readonly current = computed<import('../wardrobe-data/models').Wardrobe | undefined>(
    () =>
      this.store.wardrobes().find((w) => w.id === this.wardrobeId()) ?? this.store.wardrobes()[0],
  );
  readonly zones = computed(() =>
    this.store.zones().filter((z) => z.wardrobe_id === this.current()?.id),
  );
  readonly selected = computed(() => this.zones().find((z) => z.id === this.selectedId()));
  readonly assignedCount = computed(
    () => this.items.items().filter((i) => this.zones().some((z) => z.id === i.zoneId)).length,
  );
  readonly panelItems = computed(() =>
    this.items
      .items()
      .filter((i) => i.status === 'active' && i.zoneId === (this.selectedId() ?? null)),
  );
  readonly zoneTypes = zoneTypeOptions;
  private readonly history = new CommandHistory<EditorCommand>();
  readonly canUndo = signal(false);
  readonly canRedo = signal(false);
  private updateHistory() {
    this.canUndo.set(this.history.canUndo);
    this.canRedo.set(this.history.canRedo);
  }
  private record(command: EditorCommand) {
    const comparable = (value: EditorCommand['before']) =>
      value === null
        ? 'null'
        : JSON.stringify(
            value,
            Object.keys(value)
              .filter((key) => key !== 'updated_at')
              .sort(),
          );
    if (comparable(command.before) === comparable(command.after)) return;
    this.history.push(command);
    this.updateHistory();
  }
  private previousLocation: { itemId: number; zoneId: number | null } | null = null;
  readonly wardrobeForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    room: '',
    description: '',
    width: [800, [Validators.min(200), Validators.max(4000)]],
    height: [600, [Validators.min(200), Validators.max(4000)]],
  });
  readonly zoneForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    type: 'section',
    color: '#D9D6CF',
    position_x: 0,
    position_y: 0,
    width: [240, Validators.min(80)],
    height: [200, Validators.min(80)],
    z_index: 0,
  });
  constructor() {
    void this.load();
  }
  async load() {
    this.loading.set(true);
    try {
      await Promise.all([this.store.load(), this.items.load()]);
      this.history.clear();
      this.updateHistory();
      this.patchForms();
      this.error.set('');
      this.saveState.set('Todo guardado');
    } catch (e) {
      this.error.set(errorMessage(e));
    } finally {
      this.loading.set(false);
    }
  }
  private patchForms() {
    const w = this.current();
    if (w) this.wardrobeForm.patchValue(w);
    const z = this.selected();
    if (z) this.zoneForm.patchValue(z);
  }
  chooseWardrobe(id: number) {
    this.wardrobeId.set(id);
    this.selectedId.set(null);
    this.history.clear();
    this.updateHistory();
    this.patchForms();
  }
  toggleEdit() {
    this.editing.update((v) => !v);
    this.patchForms();
  }
  selectZone(id: number) {
    this.selectedId.set(id);
    this.patchForms();
  }
  async newWardrobe() {
    await this.run(async () => {
      const w = await this.store.saveWardrobe({ name: 'Nuevo armario' });
      if (w) {
        this.chooseWardrobe(w.id);
        this.editing.set(true);
      }
    });
  }
  async saveWardrobe() {
    if (this.wardrobeForm.invalid) return;
    await this.run(async () => {
      const v = this.wardrobeForm.getRawValue();
      if (
        this.zones().some(
          (z) => z.position_x + z.width > v.width || z.position_y + z.height > v.height,
        )
      )
        throw new Error('Mueve o reduce las zonas antes de reducir el tamaño del armario.');
      const before = this.current()!;
      const after = await this.store.saveWardrobe({ ...v, id: before.id });
      this.record({ kind: 'wardrobe', before, after });
    });
  }
  async addZone() {
    const w = this.current();
    if (!w) return;
    await this.run(async () => {
      const z = await this.store.saveZone({
        name: 'Nueva zona',
        wardrobe_id: w.id,
        ...constrain({ position_x: 32, position_y: 32, width: 240, height: 200 }, w),
        z_index: this.zones().length,
      });
      if (z) {
        this.record({ kind: 'zone', id: z.id, before: null, after: z, itemIds: [] });
        this.selectZone(z.id);
      }
    });
  }
  async saveZone() {
    const z = this.selected();
    const w = this.current();
    if (!z || !w || this.zoneForm.invalid || this.busy()) return;
    await this.run(async () => {
      const v = this.zoneForm.getRawValue();
      const after = await this.store.saveZone({
        ...v,
        ...constrain(v, w),
        id: z.id,
        wardrobe_id: w.id,
      });
      this.record({ kind: 'zone', id: z.id, before: z, after, itemIds: [] });
      this.patchForms();
    });
  }
  async geometry(command: GeometryCommand) {
    const z = this.zones().find((z) => z.id === command.id);
    if (!z || JSON.stringify(command.before) === JSON.stringify(command.after)) return;
    await this.run(async () => {
      const after = await this.store.saveZone({
        id: z.id,
        name: z.name,
        wardrobe_id: z.wardrobe_id,
        ...command.after,
      });
      this.record({ kind: 'zone', id: z.id, before: z, after, itemIds: [] });
      this.patchForms();
    });
  }
  private async applyCommand(command: EditorCommand, side: 'before' | 'after') {
    return this.run(async () => {
      if (command.kind === 'wardrobe') {
        await this.store.saveWardrobe(command[side]);
      } else {
        const target = command[side];
        const expected = command[side === 'before' ? 'after' : 'before'];
        const itemIds =
          target === null
            ? this.items
                .items()
                .filter((item) => item.zoneId === command.id)
                .map((item) => item.id)
            : command.itemIds;
        await this.store.restoreZoneState(command.id, expected, target, itemIds);
        command.itemIds = itemIds;
        this.items.restoreZoneLocations(
          command.id,
          target !== null,
          expected === null ? itemIds : [],
        );
        this.selectedId.set(target?.id ?? null);
      }
      this.patchForms();
    });
  }
  async undo() {
    if (this.busy()) return;
    const c = this.history.undo();
    if (c && !(await this.applyCommand(c, 'before'))) this.history.redo();
    this.updateHistory();
  }
  async redo() {
    if (this.busy()) return;
    const c = this.history.redo();
    if (c && !(await this.applyCommand(c, 'after'))) this.history.undo();
    this.updateHistory();
  }
  async removeZone() {
    const z = this.selected();
    if (z && confirm(`¿Eliminar «${z.name}»? Sus artículos quedarán sin asignar.`))
      await this.run(async () => {
        const itemIds = this.items
          .items()
          .filter((item) => item.zoneId === z.id)
          .map((item) => item.id);
        await this.store.restoreZoneState(z.id, z, null, itemIds);
        this.record({ kind: 'zone', id: z.id, before: z, after: null, itemIds });
        this.items.restoreZoneLocations(z.id, false, itemIds);
        this.selectedId.set(null);
      });
  }
  async removeWardrobe() {
    const w = this.current();
    if (
      w &&
      confirm(`¿Eliminar «${w.name}» y todas sus zonas? Sus artículos se conservarán sin asignar.`)
    )
      await this.run(async () => {
        await this.store.deleteWardrobe(w.id);
        this.selectedId.set(null);
        this.history.clear();
        this.updateHistory();
        await this.items.load();
        this.patchForms();
      });
  }
  changeLocation(event: Event, id: number) {
    void this.relocate(id, Number((event.target as HTMLSelectElement).value) || null);
  }
  async relocate(itemId: number, zoneId: number | null) {
    const previous = this.items.items().find((i) => i.id === itemId)?.zoneId ?? null;
    await this.run(async () => {
      await this.items.locate(itemId, zoneId);
      if (zoneId === null && previous !== null) {
        this.previousLocation = { itemId, zoneId: previous };
        this.notice.set('Artículo sin asignar.');
      }
    });
  }
  async undoLocation() {
    if (this.previousLocation) {
      const value = this.previousLocation;
      await this.run(async () => {
        await this.items.locate(value.itemId, value.zoneId);
        this.notice.set('');
        this.previousLocation = null;
      });
    }
  }
  openItem(id: number) {
    void this.router.navigate(['/items', id]);
  }
  showZone(id: number) {
    void this.router.navigate(['/items'], { queryParams: { zone: id } });
  }
  private async run(action: () => Promise<void>): Promise<boolean> {
    if (this.busy()) return false;
    this.busy.set(true);
    this.error.set('');
    this.saveState.set('Guardando…');
    try {
      await action();
      this.saveState.set('Todo guardado');
      return true;
    } catch (e) {
      this.error.set(errorMessage(e));
      this.saveState.set('No se ha guardado');
      return false;
    } finally {
      this.busy.set(false);
    }
  }
}
