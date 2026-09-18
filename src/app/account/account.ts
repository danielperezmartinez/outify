import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Session } from '../platform/session';
import { errorMessage } from '../platform/backend';
@Component({
  selector: 'app-account',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="page-heading">
      <div>
        <p class="eyebrow">TU ESPACIO PERSONAL</p>
        <h1>Mi cuenta<span class="heading-dot">.</span></h1>
      </div>
    </div>
    <section class="account-panel">
      @if (avatar) {
        <img [src]="avatar" alt="Tu avatar de Google" class="avatar" referrerpolicy="no-referrer" />
      }
      <h2>{{ name }}</h2>
      <p>{{ session.user()?.email }}</p>
      <p class="muted">Tu nombre, correo y avatar proceden de tu cuenta de Google.</p>
      <hr />
      <h3>Un armario solo tuyo</h3>
      <p>Tus artículos, armarios y fotografías son privados.</p>
      <button (click)="logout()" [disabled]="busy()">
        {{ busy() ? 'Cerrando sesión…' : 'Cerrar sesión' }}
      </button>
      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
      }
    </section>`,
})
export class Account {
  readonly session = inject(Session);
  readonly error = signal('');
  readonly busy = signal(false);
  readonly name = String(this.session.user()?.user_metadata['full_name'] ?? 'Tu cuenta');
  readonly avatar = String(this.session.user()?.user_metadata['avatar_url'] ?? '');
  async logout() {
    this.busy.set(true);
    try {
      await this.session.logout();
    } catch (e) {
      this.error.set(errorMessage(e));
      this.busy.set(false);
    }
  }
}
