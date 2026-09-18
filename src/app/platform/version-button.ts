import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AppUpdates } from './app-updates';

@Component({
  selector: 'app-version-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<button
    type="button"
    class="version-button"
    [attr.aria-label]="'Versión ' + updates.version + '. Comprobar actualizaciones'"
    title="Comprobar actualizaciones"
    [disabled]="updates.checking()"
    (click)="updates.check(true)"
  >
    v{{ updates.version }}
  </button>`,
  styles: `
    .version-button {
      border: 0;
      background: transparent;
      color: var(--smoked-stone);
      font-family: 'IBM Plex Mono', monospace;
      font-size: 11px;
      padding: 8px;
      min-height: 44px;
      white-space: nowrap;
    }
    .version-button:hover {
      color: var(--body);
      background: var(--sage-50);
    }
  `,
})
export class VersionButton {
  readonly updates = inject(AppUpdates);
}
