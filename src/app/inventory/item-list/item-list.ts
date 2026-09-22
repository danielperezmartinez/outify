import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ItemStore } from '../item-data/item-store';
import { WardrobeStore } from '../../wardrobes/wardrobe-data/wardrobe-store';
import { categoryLabel, categoryOptions, seasonOptions } from '../item-data/models';
import { filterItems, ItemFilter } from '../item-data/filter-items';
import { Popover } from '../../shared/ui/popover';
import { errorMessage } from '../../platform/backend';
@Component({
  selector: 'app-item-list',
  imports: [RouterLink, ReactiveFormsModule, Popover],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="page-heading">
      <div>
        <p class="eyebrow">EL INVENTARIO PERSONAL</p>
        <h1>Tus artículos<span class="heading-dot">.</span></h1>
        <p class="muted">Lo que tienes, siempre a la vista.</p>
      </div>
      <a class="button primary" routerLink="new">+ Crear artículo</a>
    </div>
    <div class="section-tabs">
      <button
        [class.active]="filters.controls.status.value === 'active'"
        (click)="filters.controls.status.setValue('active')"
      >
        En uso</button
      ><button
        [class.active]="filters.controls.status.value === 'archived'"
        (click)="filters.controls.status.setValue('archived')"
      >
        Archivados</button
      ><span class="count">{{ filtered().length }} artículos</span
      ><button [attr.aria-pressed]="list()" (click)="list.set(!list())">
        {{ list() ? 'Ver cuadrícula' : 'Ver lista' }}
      </button>
    </div>
    <form [formGroup]="filters" class="filters" aria-label="Filtrar artículos">
      <label class="search-label"
        >Buscar<input formControlName="search" type="search" placeholder="Busca una prenda…"
      /></label>
      <label
        >Categoría<select formControlName="category">
          <option value="">Todas</option>
          @for (o of categories; track o.value) {
            <option [value]="o.value">{{ o.label }}</option>
          }
        </select></label
      >
      <label
        >Armario<select formControlName="wardrobe">
          <option value="">Todos</option>
          @for (w of wardrobes.wardrobes(); track w.id) {
            <option [value]="w.id">{{ w.name }}</option>
          }
        </select></label
      >
      <label
        >Ubicación<select formControlName="assignment">
          <option value="">Todas</option>
          <option value="unassigned">Sin asignar</option>
          <option value="assigned">Asignados</option>
        </select></label
      >
      <app-popover label="Más filtros">
        <div class="extra-filters">
          <label>Color<input formControlName="color" placeholder="Ej. verde" /></label
          ><label
            >Temporada<select formControlName="season">
              <option value="">Todas</option>
              @for (o of seasons; track o.value) {
                <option [value]="o.value">{{ o.label }}</option>
              }
            </select></label
          ><label>Etiqueta<input formControlName="tag" /></label>
        </div>
      </app-popover>
      <button type="button" class="text-button" (click)="reset()">Limpiar filtros</button>
    </form>
    @if (error()) {
      <p class="error" role="alert">{{ error() }} <button (click)="load()">Reintentar</button></p>
    }
    @if (loading()) {
      <p class="empty" role="status">Abriendo tu inventario…</p>
    } @else {
      <div class="item-grid" [class.list-view]="list()">
        @for (item of filtered(); track item.id) {
          <a class="item-card" [routerLink]="[item.id]"
            ><div class="item-photo">
              <img
                [src]="item.imageUrl"
                [alt]="item.name"
                loading="lazy"
                width="400"
                height="450"
              />
            </div>
            <div class="item-caption">
              <span class="eyebrow">{{ category(item.category) }}</span>
              <h2>{{ item.name }}</h2>
              <p class="muted small">{{ wardrobes.locationLabel(item.zoneId) }}</p>
              @if (item.status === 'archived') {
                <span class="chip">Archivado</span>
              }
            </div>
            <span class="card-arrow" aria-hidden="true">↗</span></a
          >
        } @empty {
          <div class="empty full-width">
            <span class="empty-symbol" aria-hidden="true">⌑</span>
            <h2>
              {{
                items.items().length
                  ? 'Nada por aquí con estos filtros'
                  : 'Tu colección empieza con una prenda'
              }}
            </h2>
            <p>Fotografía lo que te acompaña y dale su lugar.</p>
            <a class="button primary" routerLink="new">Crear artículo</a>
          </div>
        }
      </div>
    }`,
})
export class ItemList {
  readonly items = inject(ItemStore);
  readonly wardrobes = inject(WardrobeStore);
  private readonly route = inject(ActivatedRoute);
  readonly categories = categoryOptions;
  readonly seasons = seasonOptions;
  readonly category = categoryLabel;
  readonly loading = signal(true);
  readonly error = signal('');
  readonly list = signal(false);
  readonly filters = new FormGroup({
    search: new FormControl('', { nonNullable: true }),
    category: new FormControl('', { nonNullable: true }),
    color: new FormControl('', { nonNullable: true }),
    season: new FormControl('', { nonNullable: true }),
    tag: new FormControl('', { nonNullable: true }),
    wardrobe: new FormControl('', { nonNullable: true }),
    assignment: new FormControl('', { nonNullable: true }),
    status: new FormControl('active', { nonNullable: true }),
    zone: new FormControl(this.route.snapshot.queryParamMap.get('zone') ?? '', {
      nonNullable: true,
    }),
  });
  private readonly values = toSignal(this.filters.valueChanges, {
    initialValue: this.filters.getRawValue(),
  });
  readonly filtered = computed(() =>
    filterItems(this.items.items(), this.values() as ItemFilter, this.wardrobes.zones()),
  );
  constructor() {
    void this.load();
  }
  reset() {
    this.filters.reset({ status: 'active', zone: '' });
  }
  async load() {
    this.loading.set(true);
    this.error.set('');
    try {
      await Promise.all([this.items.load(), this.wardrobes.load()]);
    } catch (e) {
      this.error.set(errorMessage(e));
    } finally {
      this.loading.set(false);
    }
  }
}
