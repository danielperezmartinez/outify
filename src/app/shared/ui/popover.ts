import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  signal,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-popover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'close()', '(focusout)': 'leave($event)' },
  template: `
    <button
      #trigger
      type="button"
      [attr.aria-expanded]="opened()"
      (click)="opened() ? close() : open()"
    >
      {{ label() }}
    </button>
    @if (opened()) {
      <div
        class="popover-backdrop"
        aria-hidden="true"
        (pointerdown)="$event.preventDefault()"
        (click)="close()"
      ></div>
      <div #panel class="popover-panel" role="group" [attr.aria-label]="label()">
        <ng-content />
      </div>
    }
  `,
  styles: [
    `
      :host {
        position: relative;
        display: inline-block;
      }
      button {
        position: relative;
      }
      :host:has(.popover-panel) > button {
        z-index: 31;
      }
      .popover-backdrop {
        position: fixed;
        inset: 0;
        background: #29272412;
        z-index: 30;
      }
      .popover-panel {
        position: absolute;
        right: 0;
        top: calc(100% + 8px);
        z-index: 31;
        background: var(--rice-paper);
        border: 1px solid var(--border);
        border-radius: 6px;
        padding: 20px;
        width: min(280px, calc(100vw - 32px));
        max-height: 70dvh;
        overflow: auto;
        overscroll-behavior: contain;
        box-shadow: 0 8px 24px #29272418;
      }
      @media (max-width: 700px) {
        .popover-panel {
          position: fixed;
          top: 25dvh;
          right: 16px;
        }
      }
    `,
  ],
})
export class Popover {
  readonly label = input.required<string>();
  readonly opened = signal(false);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  open() {
    this.opened.set(true);
  }
  close() {
    if (!this.opened()) return;
    this.opened.set(false);
    this.trigger().nativeElement.focus();
  }
  leave(event: FocusEvent) {
    if (
      event.relatedTarget instanceof Node &&
      !(event.currentTarget as HTMLElement).contains(event.relatedTarget)
    )
      this.opened.set(false);
  }
}
