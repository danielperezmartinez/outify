import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OutfitPiece as Piece } from './outfit-data/models';
import { WardrobeStore } from '../wardrobes/wardrobe-data/wardrobe-store';

@Component({
  selector: 'app-outfit-piece',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="outfit-piece" [class.outfit-piece-large]="expanded()">
    @if (piece().item; as item) {
      @if (item.imageUrl) {
        <img [src]="item.imageUrl" [alt]="piece().name" width="96" height="112" loading="lazy" />
      } @else {
        <span class="outfit-photo-empty" aria-hidden="true">⌑</span>
      }
    } @else {
      <span class="outfit-photo-empty" aria-hidden="true">⌑</span>
    }
    <div class="outfit-piece-caption">
      <strong>{{ piece().name }}</strong>
      @if (piece().state === 'deleted') {
        <p class="small">Prenda eliminada</p>
      } @else {
        <p class="small muted">{{ wardrobes.locationLabel(piece().item!.zoneId) }}</p>
        @if (piece().state === 'archived') {
          <span class="chip">Archivado</span>
        }
        @if (expanded()) {
          <div class="outfit-piece-links">
            <a [routerLink]="['/items', piece().item!.id]">Ver artículo</a>
            @if (wardrobeId(); as wardrobe) {
              <a routerLink="/wardrobes" [queryParams]="{ wardrobe }">Ver en el armario</a>
            }
          </div>
        }
      }
    </div>
  </div>`,
})
export class OutfitPiece {
  readonly piece = input.required<Piece>();
  readonly expanded = input(false);
  readonly wardrobes = inject(WardrobeStore);
  readonly wardrobeId = computed(
    () => this.wardrobes.zones().find((zone) => zone.id === this.piece().item?.zoneId)?.wardrobe_id,
  );
}
