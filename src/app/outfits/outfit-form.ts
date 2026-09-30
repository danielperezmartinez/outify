import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { OutfitStore } from './outfit-data/outfit-store';
import { OutfitSelection, addSelection, moveSelection, resolvePieces } from './outfit-data/models';
import { OutfitPiece } from './outfit-piece';
import { categoryOptions } from '../inventory/item-data/models';
import { errorMessage } from '../platform/backend';

@Component({
  selector: 'app-outfit-form',
  imports: [RouterLink, ReactiveFormsModule, OutfitPiece],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(window:beforeunload)': 'beforeUnload($event)' },
  template: `<a class="back-link" [routerLink]="back()"
      >← {{ id ? 'Volver al outfit' : 'Volver a outfits' }}</a
    >
    <div class="page-heading">
      <div>
        <p class="eyebrow">PIEZAS QUE SE ENCUENTRAN</p>
        <h1>{{ id ? 'Editar outfit' : 'Un nuevo outfit' }}<span class="heading-dot">.</span></h1>
        <p class="muted">Elige las prendas que quieres recordar juntas.</p>
      </div>
    </div>
    @if (store.loading()) {
      <p role="status">Cargando tus prendas…</p>
    } @else if (store.error()) {
      <p class="error" role="alert">
        {{ store.error() }} <button (click)="load()">Reintentar</button>
      </p>
    } @else if (missing()) {
      <p role="alert">Este outfit no está disponible.</p>
    } @else {
      <form [formGroup]="form" (ngSubmit)="save()" class="outfit-form">
        <fieldset [disabled]="busy()">
          <legend>La combinación</legend>
          <label
            >Nombre *<input
              formControlName="name"
              maxlength="160"
              autocomplete="off"
              [attr.aria-invalid]="form.controls.name.touched && form.controls.name.invalid"
              aria-describedby="outfit-name-error"
          /></label>
          <p id="outfit-name-error" class="field-error">
            @if (form.controls.name.touched && form.controls.name.invalid) {
              Escribe un nombre de entre 1 y 160 caracteres.
            }
          </p>
          <label
            >Notas<textarea
              formControlName="notes"
              rows="3"
              placeholder="Cuándo te gusta llevarlo, detalles que recordar…"
            ></textarea>
          </label>
        </fieldset>
        <div class="outfit-editor-columns">
          <section aria-labelledby="outfit-selected-title">
            <h2 id="outfit-selected-title">Tu selección · {{ selections().length }}</h2>
            <p class="small muted">Las cuatro primeras prendas aparecerán en la preview.</p>
            <ol class="outfit-selection">
              @for (piece of pieces(); track piece.key; let index = $index) {
                <li>
                  <app-outfit-piece [piece]="piece" />
                  <div class="outfit-selection-actions">
                    <button
                      type="button"
                      [disabled]="busy() || index === 0"
                      [attr.aria-label]="'Subir ' + piece.name"
                      (click)="move(index, -1)"
                    >
                      ↑ Subir
                    </button>
                    <button
                      type="button"
                      [disabled]="busy() || index === selections().length - 1"
                      [attr.aria-label]="'Bajar ' + piece.name"
                      (click)="move(index, 1)"
                    >
                      ↓ Bajar
                    </button>
                    <button
                      type="button"
                      [disabled]="busy()"
                      [attr.aria-label]="'Quitar ' + piece.name"
                      (click)="remove(index)"
                    >
                      Quitar
                    </button>
                  </div>
                </li>
              } @empty {
                <li class="empty">Selecciona al menos una prenda del inventario.</li>
              }
            </ol>
            <p class="sr-only" aria-live="polite">{{ announcement() }}</p>
          </section>
          <section aria-labelledby="outfit-available-title">
            <h2 id="outfit-available-title">Añadir artículos</h2>
            <fieldset [formGroup]="filters" [disabled]="busy()" class="outfit-selector-filters">
              <legend class="sr-only">Filtrar artículos disponibles</legend>
              <label>Buscar prenda<input type="search" formControlName="search" /></label>
              <div class="form-row">
                <label
                  >Categoría<select formControlName="category">
                    <option value="">Todas</option>
                    @for (category of categories; track category.value) {
                      <option [value]="category.value">{{ category.label }}</option>
                    }
                  </select></label
                >
                <label
                  >Armario<select formControlName="wardrobe">
                    <option value="">Todos</option>
                    @for (wardrobe of store.wardrobes.wardrobes(); track wardrobe.id) {
                      <option [value]="wardrobe.id">{{ wardrobe.name }}</option>
                    }
                  </select></label
                >
              </div>
            </fieldset>
            <div class="outfit-picker">
              @for (piece of available(); track piece.key) {
                <label class="outfit-picker-row"
                  ><input
                    type="checkbox"
                    [checked]="selectedIds().has(piece.item!.id)"
                    [disabled]="busy()"
                    [attr.aria-label]="'Seleccionar ' + piece.name"
                    (change)="toggle(piece.item!.id)"
                  />
                  <app-outfit-piece [piece]="piece" />
                </label>
              } @empty {
                <p class="empty">
                  {{
                    hasActive()
                      ? 'No hay prendas con estos filtros.'
                      : 'Necesitas artículos activos para añadir prendas.'
                  }}
                </p>
                @if (!hasActive()) {
                  <a routerLink="/items/new">Crear artículo</a>
                }
              }
            </div>
          </section>
        </div>
        @if (error()) {
          <p class="error" role="alert">{{ error() }}</p>
        }
        <div class="form-actions">
          <a class="button" [routerLink]="back()">Cancelar</a>
          <button class="primary" type="submit" [disabled]="busy()">
            {{ busy() ? 'Guardando…' : id ? 'Guardar cambios' : 'Crear outfit' }}
          </button>
        </div>
      </form>
    }`,
})
export class OutfitForm {
  readonly store = inject(OutfitStore);
  private readonly router = inject(Router);
  private readonly element: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly fb = inject(FormBuilder);
  private readonly routeId = inject(ActivatedRoute).snapshot.paramMap.get('id');
  readonly id = this.routeId === null ? null : Number(this.routeId);
  readonly back = computed(() => (this.id ? ['/outfits', this.id] : ['/outfits']));
  readonly missing = signal(false);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly announcement = signal('');
  readonly selections = signal<OutfitSelection[]>([]);
  readonly categories = categoryOptions;
  private completed = false;
  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(160)]],
    notes: '',
  });
  readonly filters = this.fb.nonNullable.group({ search: '', category: '', wardrobe: '' });
  private readonly filterValues = toSignal(this.filters.valueChanges, {
    initialValue: this.filters.getRawValue(),
  });
  readonly entries = computed(() => (this.id ? this.store.outfitEntries(this.id) : []));
  readonly pieces = computed(() =>
    resolvePieces(this.selections(), this.entries(), this.store.items.items()),
  );
  readonly selectedIds = computed(
    () => new Set(this.pieces().flatMap((piece) => (piece.item ? [piece.item.id] : []))),
  );
  readonly hasActive = computed(() =>
    this.store.items.items().some((item) => item.status === 'active'),
  );
  readonly available = computed(() => {
    const filters = this.filterValues();
    const zones = this.store.wardrobes.zones();
    const items = this.store.items
      .items()
      .filter(
        (item) =>
          item.status === 'active' &&
          item.name
            .toLocaleLowerCase('es')
            .includes((filters.search ?? '').trim().toLocaleLowerCase('es')) &&
          (!filters.category || filters.category === item.category) &&
          (!filters.wardrobe ||
            zones.some(
              (zone) => zone.id === item.zoneId && zone.wardrobe_id === Number(filters.wardrobe),
            )),
      );
    return resolvePieces(
      items.map((item) => ({ item_id: item.id })),
      [],
      items,
    );
  });
  constructor() {
    void this.load();
  }
  async load() {
    await this.store.load();
    if (this.store.error()) return;
    if (this.id !== null) {
      const outfit = this.store.outfits().find((row) => row.id === this.id);
      this.missing.set(!outfit);
      if (!outfit) return;
      this.form.reset({ name: outfit.name, notes: outfit.notes });
      this.selections.set(this.entries().map((entry) => ({ id: entry.id })));
    }
  }
  toggle(itemId: number) {
    const index = this.pieces().findIndex((piece) => piece.item?.id === itemId);
    if (index >= 0) this.remove(index);
    else {
      this.selections.update((rows) => addSelection(rows, itemId, this.entries()));
      this.form.markAsDirty();
    }
  }
  remove(index: number) {
    this.announcement.set(this.pieces()[index].name + ' retirada del outfit.');
    this.selections.update((rows) => rows.filter((_, current) => current !== index));
    this.form.markAsDirty();
  }
  move(index: number, offset: number) {
    this.announcement.set(this.pieces()[index].name + ', posición ' + (index + offset + 1) + '.');
    this.selections.update((rows) => moveSelection(rows, index, offset));
    this.form.markAsDirty();
  }
  canLeave() {
    return (
      this.completed ||
      (!this.busy() &&
        (!this.form.dirty || confirm('Tienes cambios sin guardar. ¿Salir de la ficha?')))
    );
  }
  beforeUnload(event: BeforeUnloadEvent) {
    if (!this.completed && (this.form.dirty || this.busy())) event.preventDefault();
  }
  async save() {
    if (this.busy()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.element.nativeElement
        .querySelector<HTMLElement>('.ng-invalid[formControlName]')
        ?.focus();
      return;
    }
    if (!this.selections().length) {
      this.error.set('Añade al menos una prenda al outfit.');
      return;
    }
    this.busy.set(true);
    this.error.set('');
    try {
      const value = this.form.getRawValue();
      const id = await this.store.save(this.id, value.name, value.notes, this.selections());
      this.completed = true;
      await this.router.navigate(['/outfits', id]);
    } catch (error) {
      this.error.set(errorMessage(error));
    } finally {
      this.busy.set(false);
    }
  }
}
