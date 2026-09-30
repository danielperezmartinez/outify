import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OutfitStore } from './outfit-data/outfit-store';
import { OutfitPiece } from './outfit-piece';
import { errorMessage } from '../platform/backend';

@Component({
  selector: 'app-outfit-detail',
  imports: [RouterLink, OutfitPiece],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<a class="back-link" routerLink="/outfits">← Volver a outfits</a>
    @if (store.loading()) {
      <p role="status">Cargando outfit…</p>
    } @else {
      @if (store.error()) {
        <p class="error" role="alert">
          {{ store.error() }} <button (click)="store.load()">Reintentar</button>
        </p>
      }
      @if (outfit(); as current) {
        <div class="page-heading">
          <div>
            <p class="eyebrow">UNA COMBINACIÓN PARA TI</p>
            <h1>{{ current.name }}<span class="heading-dot">.</span></h1>
          </div>
          <div class="outfit-actions">
            <button
              [attr.aria-pressed]="current.is_favorite"
              [disabled]="store.busy() || deleting()"
              (click)="store.favorite(current)"
            >
              {{ current.is_favorite ? '★ Favorito' : '☆ Marcar favorito' }}
            </button>
            <a class="button primary" [routerLink]="['/outfits', current.id, 'edit']"
              >Editar outfit</a
            >
          </div>
        </div>
        @if (current.notes) {
          <p class="outfit-notes">{{ current.notes }}</p>
        }
        <h2>
          {{ pieces().length }} {{ pieces().length === 1 ? 'prenda' : 'prendas' }} en esta
          combinación
        </h2>
        <div class="outfit-detail-grid">
          @for (piece of pieces(); track piece.key) {
            <app-outfit-piece [piece]="piece" [expanded]="true" />
          }
        </div>
        @if (error()) {
          <p class="error" role="alert">{{ error() }}</p>
        }
        <div class="danger-actions">
          <button class="danger" [disabled]="deleting() || store.busy()" (click)="remove()">
            Eliminar outfit
          </button>
          <p class="small muted">Tus artículos seguirán en el inventario.</p>
        </div>
      } @else if (!store.error()) {
        <h1>Outfit no disponible</h1>
        <p role="alert">Este outfit no existe o ya no tienes acceso.</p>
      }
    }`,
})
export class OutfitDetail {
  readonly store = inject(OutfitStore);
  private readonly router = inject(Router);
  readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  readonly outfit = computed(() => this.store.outfits().find((outfit) => outfit.id === this.id));
  readonly pieces = computed(() => this.store.pieces(this.id));
  readonly deleting = signal(false);
  readonly error = signal('');
  constructor() {
    void this.store.load();
  }
  async remove() {
    if (
      !confirm(
        '¿Eliminar este outfit? Tus artículos se conservarán. Esta acción no se puede deshacer.',
      )
    )
      return;
    this.deleting.set(true);
    this.error.set('');
    try {
      await this.store.remove(this.id);
      await this.router.navigateByUrl('/outfits');
    } catch (error) {
      this.error.set(errorMessage(error));
    } finally {
      this.deleting.set(false);
    }
  }
}
