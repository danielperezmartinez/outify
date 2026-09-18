import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { runtimeConfig } from './runtime-config';
@Injectable({ providedIn: 'root' })
export class Backend {
  readonly client = createClient<Database, 'outify' | 'outify_dev'>(
    runtimeConfig.url,
    runtimeConfig.key,
    {
      db: { schema: runtimeConfig.schema },
      auth: {
        flowType: 'pkce',
        storageKey: `outify-${runtimeConfig.schema}-session`,
        detectSessionInUrl: true,
      },
    },
  );
  readonly images = this.client.storage.from(runtimeConfig.bucket);
}
export function unwrap<T>(result: { data: T; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}
export function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (/fetch|network|offline/i.test(error.message))
      return 'No hay conexión. Comprueba tu red y vuelve a intentarlo.';
    if (/jwt|session.*expired|refresh token/i.test(error.message))
      return 'Tu sesión ha caducado. Vuelve a iniciar sesión.';
    if (/row-level security|permission denied/i.test(error.message))
      return 'No tienes acceso a estos datos. Vuelve a iniciar sesión e inténtalo de nuevo.';
    if (/check constraint|invalid input/i.test(error.message))
      return 'Revisa los campos: los nombres son obligatorios y las medidas deben estar dentro del armario.';
    if (/foreign key/i.test(error.message))
      return 'La ubicación ya no está disponible. Actualiza la página y elige otra zona.';
  }
  return error instanceof Error
    ? error.message
    : 'No se pudo completar la operación. Inténtalo de nuevo.';
}
