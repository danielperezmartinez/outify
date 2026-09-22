import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  computed,
  effect,
  inject,
  input,
  output,
  viewChild,
  untracked,
} from '@angular/core';
import { Wardrobe, Zone } from '../../wardrobe-data/models';
import { Item } from '../../../inventory/item-data/models';
import { Point, Rect, hitTest, rectOf, thumbnailLayout, transformRect } from '../engine/geometry';
@Component({
  selector: 'app-wardrobe-canvas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<svg
    #canvas
    class="wardrobe-svg"
    [attr.viewBox]="'-24 -24 ' + (wardrobe().width + 48) + ' ' + (wardrobe().height + 48)"
    role="group"
    aria-label="Plano interactivo del armario. Selecciona una zona; usa las flechas para moverla y Mayús con flechas para cambiar su tamaño."
    tabindex="0"
  >
    <rect
      x="0"
      y="0"
      [attr.width]="wardrobe().width"
      [attr.height]="wardrobe().height"
      rx="8"
      fill="#F8F7F5"
      stroke="#B6B0A8"
      stroke-width="2"
    />
    @for (z of zones(); track z.id) {
      <g
        [attr.data-zone]="z.id"
        [attr.transform]="'translate(' + z.position_x + ' ' + z.position_y + ')'"
        (click)="select.emit(z.id)"
        (keydown)="zoneKey($event, z)"
      >
        <rect
          class="zone-background"
          tabindex="0"
          role="button"
          [attr.aria-label]="z.name + ', ' + zoneItems(z.id).length + ' artículos'"
          [attr.aria-pressed]="selected() === z.id"
          [attr.width]="z.width"
          [attr.height]="z.height"
          rx="5"
          [attr.fill]="selected() === z.id ? '#DEE7D8' : z.color"
          [attr.stroke]="selected() === z.id ? '#52664E' : '#716D6C'"
          [attr.stroke-width]="selected() === z.id ? 3 : 1"
        />
        <rect x="8" y="8" [attr.width]="z.width - 16" height="30" rx="3" fill="#F8F7F5" />
        <text x="16" y="29" fill="#292724" font-size="14" font-weight="600">
          {{ zoneLabel(z) }}
        </text>
        @if (!editing()) {
          @for (item of visibleItems(z); track item.id; let i = $index) {
            <g
              [attr.data-item]="item.id"
              [attr.transform]="
                'translate(' +
                (12 + (i % layout(z).columns) * 76) +
                ' ' +
                (48 + floor(i / layout(z).columns) * 76) +
                ')'
              "
              tabindex="0"
              role="button"
              [attr.aria-label]="item.name + '. Abrir ficha'"
              (click)="openItem($event, item.id)"
              (keydown.enter)="openItem($event, item.id)"
              (keydown.space)="openItem($event, item.id); $event.preventDefault()"
            >
              <rect width="68" height="68" rx="4" fill="#F8F7F5" />
              <image
                [attr.href]="item.imageUrl"
                width="68"
                height="68"
                preserveAspectRatio="xMidYMid meet"
              />
              <title>{{ item.name }}</title>
            </g>
          }
          @if (layout(z).remaining) {
            <g
              data-more="true"
              role="button"
              tabindex="0"
              [attr.aria-label]="'Ver los ' + zoneItems(z.id).length + ' artículos de ' + z.name"
              (click)="more.emit(z.id); $event.stopPropagation()"
              (keydown.enter)="more.emit(z.id); $event.stopPropagation()"
              (keydown.space)="more.emit(z.id); $event.stopPropagation(); $event.preventDefault()"
            >
              <rect x="8" [attr.y]="z.height - 30" width="100" height="26" rx="4" fill="#F8F7F5" />
              <text x="16" [attr.y]="z.height - 12" font-size="13" fill="#292724">
                +{{ layout(z).remaining }} · Ver todos
              </text>
            </g>
          }
        }
        @if (editing() && selected() === z.id) {
          <rect
            data-resize="true"
            class="resize-handle"
            [attr.x]="z.width - 18"
            [attr.y]="z.height - 18"
            width="28"
            height="28"
            rx="4"
            fill="#52664E"
            stroke="#F8F7F5"
            stroke-width="3"
          />
        }
      </g>
    }
  </svg>`,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
        width: 100%;
      }
      .wardrobe-svg {
        display: block;
        width: 100%;
        height: 100%;
        min-height: 440px;
        max-height: 68vh;
        touch-action: none;
        user-select: none;
      }
      g[role='button'] {
        cursor: pointer;
      }
      .zone-background:focus-visible,
      g:focus-visible > rect {
        stroke: #334231;
        stroke-width: 5;
        stroke-dasharray: 7 3;
      }
      .resize-handle {
        cursor: nwse-resize;
      }
      @media (max-width: 700px) {
        .wardrobe-svg {
          min-height: 340px;
        }
      }
    `,
  ],
})
export class WardrobeCanvas implements AfterViewInit, OnDestroy {
  readonly wardrobe = input.required<Wardrobe>();
  readonly zones = input.required<Zone[]>();
  readonly items = input.required<Item[]>();
  readonly editing = input(false);
  readonly snapping = input(true);
  readonly selected = input<number | null>(null);
  readonly disabled = input(false);
  readonly select = output<number>();
  readonly changed = output<{ id: number; before: Rect; after: Rect }>();
  readonly relocate = output<{ itemId: number; zoneId: number | null }>();
  readonly itemOpen = output<number>();
  readonly more = output<number>();
  private readonly canvas = viewChild.required<ElementRef<SVGSVGElement>>('canvas');
  private readonly ngZone = inject(NgZone);
  readonly floor = Math.floor;
  private cleanup: () => void = () => {};
  private frame = 0;
  private suppressClick = false;
  private viewport = { x: -24, y: -24, width: 848, height: 648 };
  private readonly viewportIdentity = computed(
    () => `${this.wardrobe().id}:${this.wardrobe().width}:${this.wardrobe().height}`,
  );
  private readonly groupedItems = computed(() => {
    const groups = new Map<number, Item[]>();
    for (const item of this.items())
      if (item.status === 'active' && item.zoneId !== null)
        groups.set(item.zoneId, [...(groups.get(item.zoneId) ?? []), item]);
    return groups;
  });
  constructor() {
    effect(() => {
      const zones = this.zones();
      const svg = this.canvas().nativeElement;
      for (const zone of zones) {
        const node = svg.querySelector<SVGGElement>(`[data-zone="${zone.id}"]`);
        if (node) this.draw(node, zone);
      }
    });
    effect(() => {
      this.viewportIdentity();
      untracked(() => this.fit());
    });
  }
  zoneItems(id: number) {
    return this.groupedItems().get(id) ?? [];
  }
  zoneLabel(z: Zone) {
    const limit = Math.max(4, Math.floor((z.width - 32) / 8));
    return z.name.length > limit ? z.name.slice(0, limit - 1) + '…' : z.name;
  }
  layout(z: Zone) {
    return thumbnailLayout(z, this.zoneItems(z.id).length);
  }
  visibleItems(z: Zone) {
    return this.zoneItems(z.id).slice(0, this.layout(z).visible);
  }
  openItem(event: Event, id: number) {
    event.stopPropagation();
    if (!this.suppressClick) this.itemOpen.emit(id);
  }
  fit() {
    const w = this.wardrobe();
    this.viewport = { x: -24, y: -24, width: w.width + 48, height: w.height + 48 };
    this.renderViewport();
  }
  zoom(factor: number) {
    const v = this.viewport;
    const width = Math.max(120, Math.min(12000, v.width * factor));
    const ratio = width / v.width;
    this.viewport = {
      x: v.x + (v.width - width) / 2,
      y: v.y + (v.height - v.height * ratio) / 2,
      width,
      height: v.height * ratio,
    };
    this.renderViewport();
  }
  private renderViewport() {
    const el = this.canvas()?.nativeElement;
    if (el)
      el.setAttribute(
        'viewBox',
        `${this.viewport.x} ${this.viewport.y} ${this.viewport.width} ${this.viewport.height}`,
      );
  }
  private point(event: { clientX: number; clientY: number }): Point {
    const el = this.canvas().nativeElement;
    const matrix = el.getScreenCTM()?.inverse();
    const p = new DOMPoint(event.clientX, event.clientY);
    const result = matrix ? p.matrixTransform(matrix) : p;
    return { x: result.x, y: result.y };
  }
  zoneKey(event: KeyboardEvent, zone: Zone) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.select.emit(zone.id);
      return;
    }
    if (!this.editing() || this.disabled()) return;
    const directions: Record<string, Point> = {
      ArrowLeft: { x: -8, y: 0 },
      ArrowRight: { x: 8, y: 0 },
      ArrowUp: { x: 0, y: -8 },
      ArrowDown: { x: 0, y: 8 },
    };
    const delta = directions[event.key];
    if (delta) {
      event.preventDefault();
      this.changed.emit({
        id: zone.id,
        before: rectOf(zone),
        after: transformRect(zone, delta, event.shiftKey, this.wardrobe(), this.snapping()),
      });
    }
  }
  ngAfterViewInit() {
    this.ngZone.runOutsideAngular(() => this.bind());
  }
  private bind() {
    const svg = this.canvas().nativeElement;
    const pointers = new Map<number, PointerEvent>();
    let start: Point | null = null;
    let original: Zone | null = null;
    let node: SVGGElement | null = null;
    let mode: 'pan' | 'move' | 'resize' | 'item' = 'pan';
    let itemId = 0;
    let draft: Rect | null = null;
    let startView = { ...this.viewport };
    let distance = 0;
    let moved = false;
    let itemNode: SVGGElement | null = null;
    let itemTransform = '';
    let pinchCenter = { x: 0, y: 0 };
    const down = (e: PointerEvent) => {
      if (this.disabled() || e.button !== 0) return;
      if ((e.target as Element).closest('[data-more]')) return;
      pointers.set(e.pointerId, e);
      svg.setPointerCapture(e.pointerId);
      if (pointers.size === 2) {
        const p = [...pointers.values()];
        distance = Math.hypot(p[0].clientX - p[1].clientX, p[0].clientY - p[1].clientY);
        pinchCenter = {
          x: (p[0].clientX + p[1].clientX) / 2,
          y: (p[0].clientY + p[1].clientY) / 2,
        };
        startView = { ...this.viewport };
        if (node && original) this.draw(node, original);
        original = null;
        mode = 'pan';
        return;
      }
      start = this.point(e);
      startView = { ...this.viewport };
      moved = false;
      const target = e.target as Element;
      node = target.closest<SVGGElement>('[data-zone]');
      original = this.zones().find((z) => z.id === Number(node?.dataset['zone'])) ?? null;
      const item = target.closest<SVGGElement>('[data-item]');
      itemNode = item;
      itemTransform = item?.getAttribute('transform') ?? '';
      itemId = Number(item?.dataset['item']);
      mode =
        this.editing() && original
          ? target.hasAttribute('data-resize')
            ? 'resize'
            : 'move'
          : item
            ? 'item'
            : 'pan';
      draft = null;
      if (original) this.ngZone.run(() => this.select.emit(original!.id));
    };
    const move = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, e);
      if (this.frame) cancelAnimationFrame(this.frame);
      this.frame = requestAnimationFrame(() => {
        if (pointers.size === 2) {
          const p = [...pointers.values()];
          const next = Math.hypot(p[0].clientX - p[1].clientX, p[0].clientY - p[1].clientY);
          const ratio = Math.max(
            120 / startView.width,
            Math.min(12000 / startView.width, distance / Math.max(1, next)),
          );
          const matrix = svg.getScreenCTM();
          const dx = ((p[0].clientX + p[1].clientX) / 2 - pinchCenter.x) / (matrix?.a ?? 1);
          const dy = ((p[0].clientY + p[1].clientY) / 2 - pinchCenter.y) / (matrix?.d ?? 1);
          this.viewport = {
            x: startView.x + (startView.width - startView.width * ratio) / 2 - dx,
            y: startView.y + (startView.height - startView.height * ratio) / 2 - dy,
            width: startView.width * ratio,
            height: startView.height * ratio,
          };
          this.renderViewport();
          moved = true;
          return;
        }
        if (!start) return;
        const point = this.point(e);
        const delta = { x: point.x - start.x, y: point.y - start.y };
        if (Math.abs(delta.x) + Math.abs(delta.y) > 3) moved = true;
        if ((mode === 'move' || mode === 'resize') && original && node) {
          draft = transformRect(
            original,
            delta,
            mode === 'resize',
            this.wardrobe(),
            this.snapping() && !e.shiftKey,
          );
          this.draw(node, draft);
        } else if (mode === 'item' && itemNode) {
          itemNode.setAttribute('transform', `translate(${delta.x} ${delta.y}) ${itemTransform}`);
          itemNode.setAttribute('opacity', '0.65');
        } else if (mode === 'pan') {
          this.viewport = {
            ...this.viewport,
            x: this.viewport.x - delta.x,
            y: this.viewport.y - delta.y,
          };
          this.renderViewport();
        }
      });
    };
    const end = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      cancelAnimationFrame(this.frame);
      pointers.delete(e.pointerId);
      if (svg.hasPointerCapture(e.pointerId)) svg.releasePointerCapture(e.pointerId);
      if (pointers.size) {
        start = null;
        return;
      }
      const cancelled = e.type === 'pointercancel';
      if (!cancelled && start && mode !== 'pan') {
        const finalPoint = this.point(e);
        moved ||= Math.abs(finalPoint.x - start.x) + Math.abs(finalPoint.y - start.y) > 3;
      }
      if (itemNode) {
        itemNode.setAttribute('transform', itemTransform);
        itemNode.removeAttribute('opacity');
      }
      if (node && original && (cancelled || !moved)) this.draw(node, original);
      if (!cancelled && start) {
        if (original && (mode === 'move' || mode === 'resize') && moved) {
          const point = this.point(e);
          draft = transformRect(
            original,
            { x: point.x - start.x, y: point.y - start.y },
            mode === 'resize',
            this.wardrobe(),
            this.snapping() && !e.shiftKey,
          );
          if (node) this.draw(node, draft);
        }
        if (draft && original && moved)
          this.ngZone.run(() =>
            this.changed.emit({ id: original!.id, before: rectOf(original!), after: draft! }),
          );
        if (mode === 'item' && moved) {
          const zone = hitTest(this.zones(), this.point(e));
          this.ngZone.run(() => this.relocate.emit({ itemId, zoneId: zone?.id ?? null }));
        } else if (mode === 'item' && !moved) {
          this.ngZone.run(() => this.itemOpen.emit(itemId));
        }
      }
      this.suppressClick = moved || mode === 'item';
      setTimeout(() => (this.suppressClick = false), 0);
      start = null;
      draft = null;
      original = null;
      itemNode = null;
    };
    const wheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      this.zoom(e.deltaY > 0 ? 1.1 : 0.9);
    };
    svg.addEventListener('pointerdown', down);
    svg.addEventListener('pointermove', move);
    svg.addEventListener('pointerup', end);
    svg.addEventListener('pointercancel', end);
    svg.addEventListener('wheel', wheel, { passive: false });
    this.cleanup = () => {
      svg.removeEventListener('pointerdown', down);
      svg.removeEventListener('pointermove', move);
      svg.removeEventListener('pointerup', end);
      svg.removeEventListener('pointercancel', end);
      svg.removeEventListener('wheel', wheel);
    };
  }
  private draw(node: SVGGElement, rect: Rect) {
    node.setAttribute('transform', `translate(${rect.position_x} ${rect.position_y})`);
    const bg = node.querySelector('.zone-background');
    bg?.setAttribute('width', String(rect.width));
    bg?.setAttribute('height', String(rect.height));
    const handle = node.querySelector('.resize-handle');
    handle?.setAttribute('x', String(rect.width - 18));
    handle?.setAttribute('y', String(rect.height - 18));
  }
  ngOnDestroy() {
    cancelAnimationFrame(this.frame);
    this.cleanup();
  }
}
