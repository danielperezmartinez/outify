import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ItemStore } from '../item-data/item-store';
import { WardrobeStore } from '../../wardrobes/wardrobe-data/wardrobe-store';
import { categoryOptions, seasonOptions, Item } from '../item-data/models';
import { errorMessage } from '../../platform/backend';
@Component({
  selector: 'app-item-form',
  imports: [RouterLink, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(window:beforeunload)': 'beforeUnload($event)' },
  template: `<a class="back-link" routerLink="/items">← Volver a artículos</a>
    <div class="page-heading">
      <div>
        <p class="eyebrow">CADA PRENDA, UNA HISTORIA</p>
        <h1>{{ id ? 'Editar artículo' : 'Una nueva pieza' }}<span class="heading-dot">.</span></h1>
      </div>
      @if (item()?.status === 'archived') {
        <span class="chip">Archivado</span>
      }
    </div>
    @if (loading()) {
      <p role="status">Cargando ficha…</p>
    } @else if (missing()) {
      <p class="error" role="alert">Este artículo no está disponible.</p>
    } @else {
      <form [formGroup]="form" (ngSubmit)="save()" class="item-form">
        <div class="photo-column">
          <div class="photo-preview">
            @if (preview()) {
              <img [src]="preview()" alt="Previsualización del artículo" width="400" height="500" />
            } @else {
              <div>
                <span class="empty-symbol" aria-hidden="true">＋</span>
                <p>Una foto para reconocerlo</p>
              </div>
            }
          </div>
          <label class="upload-label"
            >Imagen principal <span aria-hidden="true">*</span
            ><input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              (change)="chooseImage($event)"
              [disabled]="busy()"
          /></label>
          <p class="small muted">JPG, PNG o WebP · hasta 8 MB</p>
        </div>
        <div class="form-fields">
          <fieldset [disabled]="busy()">
            <legend>La ficha</legend>
            <label
              >Nombre *<input
                formControlName="name"
                maxlength="160"
                autocomplete="off"
                [attr.aria-invalid]="form.controls.name.touched && form.controls.name.invalid"
            /></label>
            @if (form.controls.name.touched && form.controls.name.invalid) {
              <p class="field-error">Escribe el nombre del artículo.</p>
            }
            <div class="form-row">
              <label
                >Categoría *<select formControlName="category">
                  @for (o of categories; track o.value) {
                    <option [value]="o.value">{{ o.label }}</option>
                  }
                </select></label
              ><label
                >Color principal<input
                  formControlName="primary_color"
                  placeholder="Ej. verde salvia"
              /></label>
            </div>
            <div class="form-row">
              <label>Marca<input formControlName="brand" /></label
              ><label
                >Talla<input formControlName="size_label" placeholder="Ej. M, 38, única"
              /></label>
            </div>
            <label
              >Material<input formControlName="material" placeholder="Ej. lino, algodón…" /></label
            ><label>Descripción<textarea rows="3" formControlName="description"></textarea></label>
            <fieldset class="season-options">
              <legend>Temporadas</legend>
              @for (o of seasons; track o.value) {
                <label
                  ><input
                    type="checkbox"
                    [checked]="selectedSeasons().includes(o.value)"
                    (change)="toggleSeason(o.value)"
                  />{{ o.label }}</label
                >
              }
            </fieldset>
            <label
              >Etiquetas<input
                formControlName="tags"
                placeholder="Trabajo, favorito, ocasiones…"
              /><span class="muted small">Separa las etiquetas con comas.</span></label
            >
          </fieldset>
          <fieldset [disabled]="busy() || item()?.status === 'archived'">
            <legend>Su lugar</legend>
            <div class="form-row">
              <label
                >Armario<select
                  formControlName="wardrobe"
                  (change)="form.controls.zone.setValue('')"
                >
                  <option value="">Sin asignar</option>
                  @for (w of wardrobes.wardrobes(); track w.id) {
                    <option [value]="w.id">{{ w.name }}</option>
                  }
                </select></label
              ><label
                >Zona<select formControlName="zone">
                  <option value="">Sin asignar</option>
                  @for (z of availableZones(); track z.id) {
                    <option [value]="z.id">{{ z.name }}</option>
                  }
                </select></label
              >
            </div>
            @if (item()?.zoneId) {
              <p>
                {{ wardrobes.locationLabel(item()!.zoneId) }}
                <a
                  routerLink="/wardrobes"
                  [queryParams]="{ wardrobe: form.controls.wardrobe.value }"
                  >Ver en el armario ↗</a
                >
              </p>
            }
          </fieldset>
          @if (error()) {
            <p class="error" role="alert">{{ error() }}</p>
          }
          <div class="form-actions">
            <a class="button" routerLink="/items">Cancelar</a
            ><button class="primary" type="submit" [disabled]="busy()">
              {{ busy() ? 'Guardando…' : id ? 'Guardar cambios' : 'Crear artículo' }}
            </button>
          </div>
          @if (item(); as current) {
            <div class="danger-actions">
              @if (current.status === 'active') {
                <button type="button" (click)="archive()" [disabled]="busy()">
                  Archivar artículo
                </button>
                <p class="muted small">Conserva su ficha y su imagen, sin ubicación.</p>
              } @else {
                <button type="button" (click)="restore()" [disabled]="busy()">
                  Restaurar sin asignar</button
                ><button type="button" class="danger" (click)="remove()" [disabled]="busy()">
                  Eliminar definitivamente
                </button>
              }
            </div>
          }
        </div>
      </form>
    }`,
})
export class ItemForm {
  readonly items = inject(ItemStore);
  readonly wardrobes = inject(WardrobeStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly element: ElementRef<HTMLElement> = inject(ElementRef);
  private completed = false;
  readonly id = Number(this.route.snapshot.paramMap.get('id')) || null;
  readonly item = signal<Item | null>(null);
  readonly preview = signal('');
  readonly error = signal('');
  readonly busy = signal(false);
  readonly loading = signal(true);
  readonly missing = signal(false);
  readonly selectedSeasons = signal<string[]>([]);
  readonly categories = categoryOptions;
  readonly seasons = seasonOptions;
  private file: File | null = null;
  private objectUrl = '';
  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(160)]],
    category: ['top', Validators.required],
    primary_color: '',
    brand: '',
    size_label: '',
    material: '',
    description: '',
    tags: '',
    wardrobe: '',
    zone: '',
  });
  private readonly wardrobeValue = toSignal(this.form.controls.wardrobe.valueChanges, {
    initialValue: '',
  });
  readonly availableZones = computed(() =>
    this.wardrobes.zones().filter((z) => z.wardrobe_id === Number(this.wardrobeValue())),
  );
  constructor() {
    inject(DestroyRef).onDestroy(() => URL.revokeObjectURL(this.objectUrl));
    this.form.controls.zone.disable();
    this.form.controls.wardrobe.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      if (value) this.form.controls.zone.enable();
      else this.form.controls.zone.disable();
    });
    void this.load();
  }
  canLeave() {
    return (
      this.completed ||
      (!this.form.dirty && !this.file) ||
      confirm('Tienes cambios sin guardar. ¿Salir de la ficha?')
    );
  }
  beforeUnload(event: BeforeUnloadEvent) {
    if (!this.completed && (this.form.dirty || this.file)) event.preventDefault();
  }
  async load() {
    try {
      await Promise.all([this.items.load(), this.wardrobes.load()]);
      if (this.id) {
        const item = this.items.items().find((i) => i.id === this.id);
        if (!item) {
          this.missing.set(true);
          return;
        }
        this.item.set(item);
        this.preview.set(item.imageUrl);
        this.selectedSeasons.set(item.seasons);
        const zone = this.wardrobes.zones().find((z) => z.id === item.zoneId);
        this.form.patchValue({
          ...item,
          tags: item.tags.join(', '),
          wardrobe: zone ? String(zone.wardrobe_id) : '',
          zone: item.zoneId ? String(item.zoneId) : '',
        });
      }
    } catch (e) {
      this.error.set(errorMessage(e));
    } finally {
      this.loading.set(false);
    }
  }
  chooseImage(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8388608) {
      this.error.set('Elige una imagen JPG, PNG o WebP de hasta 8 MB.');
      return;
    }
    URL.revokeObjectURL(this.objectUrl);
    this.file = file;
    this.objectUrl = URL.createObjectURL(file);
    this.preview.set(this.objectUrl);
    this.error.set('');
  }
  toggleSeason(value: string) {
    this.form.markAsDirty();
    this.selectedSeasons.update((values) =>
      values.includes(value) ? values.filter((v) => v !== value) : [...values, value],
    );
  }
  async save() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.element.nativeElement
        .querySelector<HTMLElement>('.ng-invalid[formControlName]')
        ?.focus();
      return;
    }
    if (!this.file && !this.item()) {
      this.error.set('Añade una imagen principal.');
      return;
    }
    this.busy.set(true);
    this.error.set('');
    let newPath = '';
    let saved = false;
    try {
      const values = this.form.getRawValue();
      newPath = this.file ? await this.items.upload(this.file) : '';
      await this.items.save(
        {
          id: this.id,
          name: values.name.trim(),
          category: values.category,
          description: values.description,
          primary_color: values.primary_color,
          brand: values.brand,
          size_label: values.size_label,
          material: values.material,
          image_path: newPath || this.item()!.image_path,
          seasons: this.selectedSeasons(),
        },
        this.item()?.status === 'archived' ? null : Number(values.zone) || null,
        values.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      );
      saved = true;
      this.completed = true;
      await this.router.navigateByUrl('/items');
    } catch (e) {
      this.error.set(errorMessage(e));
      if (newPath && !saved) {
        try {
          await this.items.retireImage(newPath);
        } catch {
          this.error.set('No se guardó la ficha. Quedó una foto pendiente de limpieza.');
        }
      }
    } finally {
      this.busy.set(false);
    }
  }
  async archive() {
    await this.action(() => this.items.archive(this.id!));
  }
  async restore() {
    await this.action(() => this.items.restore(this.id!));
  }
  async remove() {
    if (
      confirm(
        '¿Eliminar definitivamente este artículo y su imagen? Esta acción no se puede deshacer.',
      )
    )
      await this.action(() => this.items.delete(this.id!));
  }
  private async action(action: () => Promise<void>) {
    this.busy.set(true);
    this.error.set('');
    try {
      await action();
      this.completed = true;
      await this.router.navigateByUrl('/items');
    } catch (e) {
      this.error.set(errorMessage(e));
    } finally {
      this.busy.set(false);
    }
  }
}
