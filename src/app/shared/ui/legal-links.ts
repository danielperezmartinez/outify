import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-legal-links',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<nav class="legal-links" [attr.aria-label]="label()">
    <a routerLink="/privacy">Privacidad</a>
    <a routerLink="/terms">Condiciones</a>
    <a href="mailto:dlperezmartinez@gmail.com">Contacto</a>
  </nav>`,
})
export class LegalLinks {
  readonly label = input('Información y soporte');
}
