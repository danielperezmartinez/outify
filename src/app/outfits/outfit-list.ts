import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { OutfitStore } from './outfit-data/outfit-store';
import { filterOutfits } from './outfit-data/models';
import { OutfitPiece } from './outfit-piece';

@Component({
  selector: 'app-outfit-list',
  imports: [RouterLink, ReactiveFormsModule, OutfitPiece],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="page-heading">
      <div>
        <p class="eyebrow">COMBINACIONES PARA RECORDAR</p>
        <h1>Tus outfits<span class="heading-dot">.</span></h1>
        <p class="muted">Las prendas que van juntas, siempre a mano.</p>
      </div>
      <a class="button primary" routerLink="new">+ Crear outfit</a>
    </div>
    <form [formGroup]="filters" class="filters" aria-label="Filtrar outfits">
      <label class="search-label"
        >Buscar<input type="search" formControlName="search" placeholder="Busca un outfit…"
      /></label>
      <label class="outfit-checkbox"
        ><input type="checkbox" formControlName="favorites" />Solo favoritos</label
      >
    </form>
    @if (store.error()) {
      <p class="error" role="alert">
        {{ store.error() }} <button (click)="store.load()">Reintentar</button>
      </p>
    }
    @if (store.loading()) {
      <p role="status" class="empty">Abriendo tus outfits…</p>
    } @else {
      <p class="small muted" role="status">
        {{ filtered().length }} {{ filtered().length === 1 ? 'outfit' : 'outfits' }}
      </p>
      <div class="outfit-grid">
        @for (outfit of filtered(); track outfit.id) {
          <article class="outfit-card">
            <div class="outfit-card-heading">
              <h2>
                <a [routerLink]="[outfit.id]">{{ outfit.name }}</a>
              </h2>
              <button
                class="outfit-favorite"
                [attr.aria-pressed]="outfit.is_favorite"
                [attr.aria-label]="
                  (outfit.is_favorite ? 'Quitar de favoritos: ' : 'Marcar favorito: ') + outfit.name
                "
                [disabled]="store.busy()"
                (click)="store.favorite(outfit)"
              >
                {{ outfit.is_favorite ? '★' : '☆' }}
              </button>
            </div>
            <p class="small muted">
              {{ outfit.pieces.length }} {{ outfit.pieces.length === 1 ? 'prenda' : 'prendas' }}
            </p>
            @if (outfit.unavailable) {
              <p class="outfit-warning">
                {{ outfit.unavailable }}
                {{
                  outfit.unavailable === 1
                    ? 'prenda archivada o eliminada'
                    : 'prendas archivadas o eliminadas'
                }}
              </p>
            }
            <div class="outfit-preview">
              @for (piece of outfit.preview; track piece.key) {
                <app-outfit-piece [piece]="piece" />
              }
            </div>
            <a class="outfit-open" [routerLink]="[outfit.id]"
              >{{
                outfit.pieces.length > 4
                  ? 'Ver todas (+' + (outfit.pieces.length - 4) + ')'
                  : 'Ver outfit'
              }}
              ↗</a
            >
          </article>
        } @empty {
          <div class="empty full-width">
            <span class="empty-symbol" aria-hidden="true">⌑</span>
            <h2>
              {{
                store.outfits().length
                  ? 'No hay outfits con estos filtros'
                  : 'Recuerda lo que combina contigo'
              }}
            </h2>
            <p>
              {{
                store.outfits().length
                  ? 'Prueba con otro nombre o desactiva el filtro de favoritos.'
                  : 'Elige tus prendas y guarda tu primera combinación.'
              }}
            </p>
            @if (!store.outfits().length && !store.error()) {
              <a class="button primary" routerLink="new">Crear outfit</a>
            }
          </div>
        }
      </div>
    }`,
})
export class OutfitList {
  readonly store = inject(OutfitStore);
  readonly filters = new FormGroup({
    search: new FormControl('', { nonNullable: true }),
    favorites: new FormControl(false, { nonNullable: true }),
  });
  private readonly values = toSignal(this.filters.valueChanges, {
    initialValue: this.filters.getRawValue(),
  });
  readonly filtered = computed(() => {
    const cards = new Map(this.store.cards().map((card) => [card.id, card]));
    return filterOutfits(
      this.store.outfits(),
      this.values().search ?? '',
      this.values().favorites ?? false,
    ).map((outfit) => cards.get(outfit.id)!);
  });
  constructor() {
    void this.store.load();
  }
}
