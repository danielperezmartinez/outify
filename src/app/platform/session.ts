import { Injectable, inject, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { User } from '@supabase/supabase-js';
import { Backend } from './backend';
@Injectable({ providedIn: 'root' })
export class Session {
  private readonly backend = inject(Backend);
  private readonly router = inject(Router);
  private readonly current = signal<User | null>(null);
  readonly user = this.current.asReadonly();
  readonly ready = this.initialize();
  private async initialize() {
    const { data, error } = await this.backend.client.auth.getSession();
    if (!error) this.current.set(data.session?.user ?? null);
    this.backend.client.auth.onAuthStateChange((event, session) => {
      this.current.set(session?.user ?? null);
      if (event === 'SIGNED_OUT') void this.router.navigateByUrl('/acceso');
    });
  }
  async login() {
    const { error } = await this.backend.client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) throw error;
  }
  async logout() {
    const { error } = await this.backend.client.auth.signOut({ scope: 'local' });
    if (error) throw error;
    this.current.set(null);
    await this.router.navigateByUrl('/acceso');
  }
}
export const sessionGuard: CanActivateFn = async () => {
  const session = inject(Session);
  const router = inject(Router);
  await session.ready;
  return session.user() ? true : router.createUrlTree(['/acceso']);
};
