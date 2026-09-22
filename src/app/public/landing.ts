import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LegalLinks } from '../shared/ui/legal-links';

@Component({
  selector: 'app-landing',
  imports: [RouterLink, NgOptimizedImage, LegalLinks],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div [attr.lang]="english ? 'en' : 'es'">
    <header class="public-header">
      <a routerLink="/" class="wordmark" aria-label="Outify"
        ><img ngSrc="/brand/symbol.svg" width="32" height="32" alt="" />outify</a
      >
      <nav [attr.aria-label]="english ? 'Navigation' : 'Navegación'">
        <a [routerLink]="english ? '/' : '/en'" [attr.lang]="english ? 'es' : 'en'">{{
          english ? 'Español' : 'English'
        }}</a>
        <a routerLink="/login" class="button"
          >{{ english ? 'Open your wardrobe' : 'Abrir mi armario' }}
          <span aria-hidden="true">↗</span></a
        >
      </nav>
    </header>
    <main>
      <section class="landing-hero">
        <div class="hero-copy">
          <p class="eyebrow">
            {{ english ? 'A PLACE FOR EVERY PIECE' : 'UN LUGAR PARA CADA PRENDA' }}
          </p>
          <h1>
            {{ english ? 'Know what you own.' : 'Tu ropa, a la vista.' }}<br /><em>{{
              english ? 'Find where it lives.' : 'Cada cosa, en su lugar.'
            }}</em>
          </h1>
          <p class="intro">
            {{
              english
                ? 'Photograph your clothes. Map your closets. Give every item a place, so finding it is the easy part.'
                : 'Fotografía tus prendas, dibuja las zonas de tus armarios y guarda cada artículo en su sitio. Que encontrarlo sea la parte fácil.'
            }}
          </p>
          <a routerLink="/login" class="button primary"
            >{{ english ? 'Start your inventory' : 'Empezar mi inventario' }}
            <span aria-hidden="true">↗</span></a
          >
          <p class="small muted">
            {{
              english
                ? 'Free to use at launch · Google sign-in · Ages 14+'
                : 'Gratuito en su lanzamiento · Acceso con Google · Desde 14 años'
            }}
          </p>
          @if (english) {
            <p class="language-note">The app and legal documents are currently in Spanish.</p>
          }
        </div>
        <figure class="hero-figure">
          <div class="figure-label">
            <span class="eyebrow">OUTIFY / 01</span
            ><span>{{ english ? 'Your wardrobe, at a glance' : 'Un mapa de tu armario' }}</span>
          </div>
          <img
            ngSrc="/launch/wardrobe.png"
            width="1440"
            height="1000"
            priority
            [alt]="
              english
                ? 'Outify wardrobe screen with sections and sample clothing'
                : 'Pantalla de Outify con un armario, zonas y prendas de ejemplo'
            "
          />
          <figcaption>
            {{
              english
                ? 'Actual app. Sample inventory with original illustrations.'
                : 'Aplicación real. Inventario de ejemplo con ilustraciones propias.'
            }}
          </figcaption>
        </figure>
      </section>
      <section
        class="landing-workflow"
        [attr.aria-label]="english ? 'How it works' : 'Cómo funciona'"
      >
        <article>
          <span class="eyebrow">01 / {{ english ? 'REMEMBER' : 'RECUERDA' }}</span>
          <h2>{{ english ? 'See what you have.' : 'Mira lo que tienes.' }}</h2>
          <p>
            {{
              english
                ? 'Add a photo and a few details. Browse your collection and filter by category, color or season.'
                : 'Añade una foto y sus detalles. Recorre tu colección y filtra por categoría, color o temporada.'
            }}
          </p>
        </article>
        <article>
          <span class="eyebrow">02 / {{ english ? 'ORGANIZE' : 'ORGANIZA' }}</span>
          <h2>{{ english ? 'Make a little map.' : 'Dibuja un pequeño mapa.' }}</h2>
          <p>
            {{
              english
                ? 'Create your closets and divide them into shelves, drawers and sections. Move and resize each zone.'
                : 'Crea tus armarios y divídelos en baldas, cajones y secciones. Mueve cada zona y ajusta su tamaño.'
            }}
          </p>
        </article>
        <article>
          <span class="eyebrow">03 / {{ english ? 'FIND' : 'ENCUENTRA' }}</span>
          <h2>{{ english ? 'Give it a place.' : 'Dale su lugar.' }}</h2>
          <p>
            {{
              english
                ? 'Assign each piece to a zone. Next time you need it, your inventory tells you where you put it.'
                : 'Asigna cada prenda a una zona. La próxima vez que la busques, tu inventario te recuerda dónde la guardaste.'
            }}
          </p>
        </article>
      </section>
      <section class="landing-collection">
        <div>
          <p class="eyebrow">
            {{ english ? 'LESS SEARCHING. MORE LIVING.' : 'MENOS BUSCAR. MÁS DISFRUTAR.' }}
          </p>
          <h2>{{ english ? 'Rediscover your own collection.' : 'Redescubre tu colección.' }}</h2>
          <p>
            {{
              english
                ? 'A private inventory for the things that already belong to you. No shopping feed. No pressure to add more.'
                : 'Un inventario privado de lo que ya te acompaña. Sin un escaparate de compras ni presión por tener más.'
            }}
          </p>
          <a routerLink="/login"
            >{{ english ? 'Make room for your clothes' : 'Haz sitio a tus prendas' }} ↗</a
          >
        </div>
        <figure>
          <img
            ngSrc="/launch/inventory.png"
            width="1440"
            height="1000"
            [alt]="
              english
                ? 'Actual Outify inventory with sample garments and search filters'
                : 'Inventario real de Outify con prendas de ejemplo y filtros'
            "
          />
          <figcaption>
            {{
              english
                ? 'Sample content. Your own inventory stays private.'
                : 'Contenido de demostración. Tu inventario permanece privado.'
            }}
          </figcaption>
        </figure>
      </section>
      <section class="landing-story">
        <p class="eyebrow">
          {{ english ? 'A NOTE FROM DANIEL, THE MAKER' : 'UNA NOTA DE DANIEL, SU CREADOR' }}
        </p>
        <h2>
          {{
            english ? 'It started with a forgotten outfit.' : 'Todo empezó con un outfit olvidado.'
          }}
        </h2>
        <p>
          {{
            english
              ? 'Whenever I bought a complete outfit, I eventually forgot which pieces I had planned to wear together. I wanted a place to save those combinations. The idea grew into Outify: a visual inventory to remember what I own and where it is.'
              : 'Cada vez que compraba un outfit completo, con el tiempo olvidaba qué prendas había pensado combinar. Quería un lugar donde guardar esas combinaciones. La idea creció hasta convertirse en Outify: un inventario visual para recordar qué tengo y dónde está.'
          }}
        </p>
        <p class="muted">
          {{
            english
              ? 'Saved outfits are a future idea, not a feature available today. For now, it starts with giving each piece a place.'
              : 'Guardar outfits sigue siendo una idea para el futuro; todavía no está disponible. Por ahora, todo empieza por darle un lugar a cada prenda.'
          }}
        </p>
        <a href="mailto:dlperezmartinez@gmail.com"
          >{{
            english
              ? 'Tell me what would make it useful for you'
              : 'Cuéntame qué lo haría más útil para ti'
          }}
          ↗</a
        >
      </section>
    </main>
    <footer class="public-footer">
      <span>{{
        english ? 'Made with care. Free at launch.' : 'Hecho con calma. Gratuito en su lanzamiento.'
      }}</span
      ><app-legal-links />
    </footer>
  </div>`,
})
export class Landing {
  readonly english = inject(ActivatedRoute).snapshot.data['language'] === 'en';
}
