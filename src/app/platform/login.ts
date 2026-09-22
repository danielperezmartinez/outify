import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Session } from './session';
import { errorMessage } from './backend';
import { VersionButton } from './version-button';
import { ageConfirmationKey } from './workspace-access';
import { LegalLinks } from '../shared/ui/legal-links';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-login',
  imports: [VersionButton, LegalLinks, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<main class="login-layout">
    <section class="login-copy">
      <a class="wordmark" href="/">outify<span aria-hidden="true">↗</span></a>
      <div>
        <p class="eyebrow">UN LUGAR PARA CADA COSA</p>
        <h1>Tu ropa.<br />Tu espacio.<br /><em>En armonía.</em></h1>
        <p class="intro">
          Redescubre lo que tienes. Dale un lugar.<br />Un armario más claro, un día más sencillo.
        </p>
        <label class="age-confirmation">
          <input type="checkbox" [checked]="ageConfirmed()" (change)="confirmAge($event)" />
          Confirmo que tengo al menos 14 años.
        </label>
        <button
          class="primary google-button"
          (click)="login()"
          [disabled]="busy() || !ageConfirmed()"
        >
          <span aria-hidden="true">G</span> {{ busy() ? 'Conectando…' : 'Continuar con Google' }}
          <span aria-hidden="true">↗</span>
        </button>
        @if (error()) {
          <p class="error" role="alert">{{ error() }}</p>
        }
        <p class="muted small">Tu inventario y tus fotografías, solo para ti.</p>
        <p class="small">
          Al abrir tu espacio aceptas las <a routerLink="/terms">condiciones de uso</a>. Consulta
          cómo tratamos tus datos en la <a routerLink="/privacy">política de privacidad</a>.
        </p>
        <app-legal-links />
      </div>
      <div class="login-footer">
        <p class="eyebrow">MENOS BUSCAR. MÁS DISFRUTAR.</p>
        <app-version-button />
      </div>
    </section>
    <section class="login-art" aria-label="Un armario organizado en dos zonas">
      <p class="eyebrow">EL ARTE DE TENERLO A MANO</p>
      <svg
        viewBox="0 0 480 520"
        role="img"
        aria-label="Ilustración de un armario con ropa colgada y doblada"
      >
        <path
          d="M35 35 L445 31 L447 468 L34 470 Z"
          fill="#F8F7F5"
          stroke="#716D6C"
          stroke-width="2"
        />
        <path d="M49 51H246V450H49Z" fill="#DEE7D8" />
        <path d="M260 51H429V243H260Z" fill="#D9D6CF" />
        <path d="M260 258H429V450H260Z" fill="#C3BBB0" />
        <g fill="none" stroke="#52664E" stroke-width="3" stroke-linecap="round">
          <path
            d="M60 98H235M110 111q-8-20 4-20t0 22l-35 30h70l-35-30M169 111q-8-20 4-20t0 22l-35 30h70l-35-30"
          />
        </g>
        <path
          d="M84 145l-28 34 20 20 11-10-7 128h65l-6-128 12 10 19-20-29-34-17 10h-22z"
          fill="#F8F7F5"
          stroke="#716D6C"
          stroke-width="2"
        />
        <path
          d="M145 147l-17 36 15 11 9-8-4 155h65l-5-155 9 8 15-11-20-36-20 9h-28z"
          fill="#B7C7A8"
          stroke="#52664E"
          stroke-width="2"
        />
        <g fill="#F8F7F5" stroke="#716D6C" stroke-width="2">
          <path d="M286 177q40-5 115 0v22H286zM292 152q40-5 103 0v23H292zM283 350h123v52H283z" />
          <path d="M296 330h98v20h-98z" fill="#DEE7D8" />
        </g>
        <path d="M47 470v18m385-19v18" stroke="#716D6C" stroke-width="5" />
      </svg>
      <p class="art-note">
        Cada prenda cuenta una historia.<br />Que encontrarla sea la parte fácil.
      </p>
    </section>
  </main>`,
})
export class Login {
  private readonly session = inject(Session);
  private readonly router = inject(Router);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly ageConfirmed = signal(false);
  confirmAge(event: Event) {
    this.ageConfirmed.set((event.target as HTMLInputElement).checked);
  }
  constructor() {
    if (new URLSearchParams(location.search).has('error'))
      this.error.set('No se pudo completar el acceso con Google. Vuelve a intentarlo.');
    void this.session.ready.then(() => {
      if (this.session.user()) void this.router.navigateByUrl('/wardrobes');
    });
  }
  async login() {
    if (!this.ageConfirmed() || this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    try {
      sessionStorage.setItem(ageConfirmationKey, String(Date.now()));
      await this.session.login();
    } catch (e) {
      this.error.set(errorMessage(e));
      this.busy.set(false);
    }
  }
}
