import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LegalLinks } from '../shared/ui/legal-links';

@Component({
  selector: 'app-legal',
  imports: [RouterLink, LegalLinks],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<header class="public-header">
      <a routerLink="/" class="wordmark">outify<span aria-hidden="true">↗</span></a>
      <a routerLink="/login" class="button">Abrir mi armario</a>
    </header>
    <main class="legal-document">
      <p class="eyebrow">TU ESPACIO. TUS DATOS.</p>
      <h1>{{ privacy ? 'Política de privacidad' : 'Condiciones de uso' }}</h1>
      <p class="muted">Versión 1 · 22 de septiembre de 2026</p>
      @if (privacy) {
        <p class="intro">
          Tu inventario es privado. Aquí explicamos qué guardamos, para qué y cómo puedes
          eliminarlo.
        </p>
        <h2>1. Responsable y contacto</h2>
        <p>
          Daniel Pérez Martínez, establecido en España, es el responsable del tratamiento de los
          datos de Outify. Para soporte, privacidad o ejercer tus derechos, escribe a
          <a href="mailto:dlperezmartinez@gmail.com">dlperezmartinez&#64;gmail.com</a>.
        </p>
        <h2>2. Qué datos utilizamos</h2>
        <p>
          Google nos facilita tu identificador, nombre, correo y avatar al iniciar sesión. No
          recibimos tu contraseña de Google. Guardamos los armarios, zonas, medidas y posiciones que
          defines, así como las fichas de prendas, fotografías, etiquetas, categorías, temporadas y
          ubicaciones que añades.
        </p>
        <p>
          El registro está disponible desde los 14 años. Guardamos cuándo declaras cumplir esa edad;
          no pedimos fecha de nacimiento ni documento de identidad en el alta ordinaria. La
          declaración no equivale a una verificación documental.
        </p>
        <p>
          Las fotografías se almacenan como archivos originales y pueden contener metadatos,
          incluida ubicación. Evita incluir datos personales innecesarios o imágenes de otras
          personas sin permiso.
        </p>
        <p>
          Los proveedores de infraestructura procesan datos técnicos, como dirección IP, navegador,
          fecha y resultado de las solicitudes, para prestar y proteger el servicio.
        </p>
        <h2>3. Finalidades y bases jurídicas</h2>
        <p>
          Tratamos tu cuenta y tu inventario para ejecutar el servicio que solicitas. Utilizamos la
          información estrictamente necesaria para resolver incidencias y proteger el acceso por
          nuestro interés legítimo en mantener un servicio seguro. Cuando corresponda, conservamos
          información para cumplir obligaciones legales.
        </p>
        <p>
          No vendemos tus datos. Outify no incorpora publicidad, analítica de comportamiento ni
          entrenamiento de inteligencia artificial con tus fotografías. La política informa del
          tratamiento; no es un consentimiento general para otros usos.
        </p>
        <h2>4. Proveedores y transferencias</h2>
        <p>
          Supabase presta autenticación, base de datos y almacenamiento; Vercel aloja la aplicación.
          Google interviene en el inicio de sesión y sirve el avatar de tu cuenta. Las fuentes
          tipográficas se sirven desde Outify.
        </p>
        <p>
          La base de datos principal de Supabase está en Frankfurt. Esto no significa que todos los
          servicios y subencargados operen exclusivamente en la Unión Europea. Puedes consultar las
          condiciones de tratamiento, subencargados y garantías de transferencia de
          <a href="https://supabase.com/legal/customer-resources/data-processing-addendum"
            >Supabase</a
          >
          y <a href="https://vercel.com/legal/dpa">Vercel</a>, y la
          <a href="https://policies.google.com/privacy?hl=es">política de Google</a>. Puedes
          pedirnos información sobre las garantías aplicables en el correo de contacto.
        </p>
        <p>
          El inventario no se muestra a otros usuarios. Las imágenes se sirven con enlaces
          temporales: quien reciba uno puede abrirlo mientras siga siendo válido. No compartas esos
          enlaces si quieres mantener las imágenes privadas.
        </p>
        <h2>5. Conservación y baja</h2>
        <p>
          El correo de soporte se aloja en Gmail. Conservamos el mensaje mínimo de cierre de una
          consulta durante seis meses para su seguimiento, salvo que una obligación o reclamación
          concreta justifique otro plazo. Eliminamos los documentos de identificación al verificar
          la solicitud y las copias de exportación tras entregarlas, como máximo a los siete días de
          crearlas.
        </p>
        <p>
          Conservamos el inventario mientras mantienes tu espacio. Archivar una prenda conserva su
          ficha e imagen; eliminar una zona o un armario deja las prendas sin ubicación. Borrar
          definitivamente una prenda elimina su ficha y deja su fotografía pendiente de limpieza. Si
          falla, la aplicación reintenta la limpieza al abrir el inventario.
        </p>
        <p>
          En Mi cuenta puedes solicitar «Eliminar mis datos de Outify». Al registrarse la solicitud
          se cierra el acceso al espacio. El servidor limpia las fotografías y después elimina el
          perfil y el inventario. Puedes cerrar la página: el proceso continúa y su estado se
          muestra al volver a entrar.
        </p>
        <p>
          La limpieza incluye una comprobación posterior para cubrir cargas pendientes y reintentos
          diarios. No es instantánea; si hay un fallo del proveedor, la solicitud se mantiene
          pendiente hasta poder completarse. El plan actual de Supabase no incluye copias
          automáticas recuperables del proyecto. Los registros técnicos siguen los ciclos de
          conservación del proveedor; las ventanas de consulta disponibles no equivalen a los plazos
          de todos sus registros internos. No se utilizan para reactivar tu espacio.
        </p>
        <p>
          La baja afecta al entorno indicado en la confirmación. No elimina tu cuenta de Google ni
          la identidad compartida necesaria para otras aplicaciones. Para eliminar también otros
          entornos de Outify o revisar la supresión de la identidad central, contacta con nosotros:
          primero deben comprobarse las dependencias de las otras aplicaciones.
        </p>
        <p>
          Tras la baja conservamos únicamente un registro de control con tu identificador técnico,
          estado y fechas de cierre, para impedir que sesiones antiguas reabran el espacio. Este
          registro no incluye prendas ni fotografías y se mantiene mientras sea necesario para
          controlar esa identidad compartida. Volver a empezar requiere una nueva sesión y crear
          expresamente un espacio vacío.
        </p>
        <h2>6. Tus derechos</h2>
        <p>
          Puedes solicitar acceso, rectificación, supresión, limitación, oposición y, cuando
          corresponda, portabilidad en el correo de contacto. Verificaremos tu identidad de forma
          proporcionada. Para obtener una copia de tu inventario, solicita una exportación antes de
          confirmar una baja.
        </p>
        <p>
          Responderemos sin dilación indebida y como máximo en un mes. Si la complejidad o el número
          de solicitudes requiere una ampliación, te informaremos dentro del primer mes de los
          motivos y del plazo adicional, de hasta dos meses más.
        </p>
        <p>
          Puedes reclamar ante la
          <a href="https://www.aepd.es/derechos-y-deberes/ejerce-tus-derechos"
            >Agencia Española de Protección de Datos</a
          >
          u otra autoridad de control competente.
        </p>
        <h2>7. Tu navegador y los cambios de esta política</h2>
        <p>
          El navegador conserva la sesión, los datos temporales necesarios para completar el acceso
          con Google y los recursos de la aplicación instalada. Outify no guarda un inventario
          privado completo para usarlo sin conexión. No utilizamos cookies de publicidad o
          analítica; Google aplica sus propias políticas durante el acceso.
        </p>
        <p>
          Publicaremos las nuevas versiones en esta página. Los cambios relevantes se comunicarán
          también en la aplicación o mediante el correo de la cuenta antes de aplicarlos cuando sea
          necesario. Cualquier finalidad que requiera consentimiento se solicitará por separado.
        </p>
      } @else {
        <p class="intro">Un inventario visual para recordar qué tienes y dónde lo guardas.</p>
        <h2>1. El servicio</h2>
        <p>
          Outify es un servicio de Daniel Pérez Martínez, establecido en España. Permite registrar
          ropa, calzado y accesorios, organizar armarios por zonas y consultar las ubicaciones que
          indicas. No detecta movimientos físicos de las prendas. Guardar conjuntos u outfits
          todavía no está disponible.
        </p>
        <p>
          El servicio es gratuito en su lanzamiento. Cualquier cambio económico se comunicará antes
          de aplicarse y requerirá tu aceptación cuando corresponda. El uso actual no autoriza
          cobros futuros.
        </p>
        <h2>2. Registro y uso</h2>
        <p>
          Necesitas una cuenta de Google y tener al menos 14 años. Las personas menores de 14 años
          no pueden registrarse. Si por tu edad o situación necesitas asistencia de tus
          representantes para aceptar estas condiciones, debes contar con ella.
        </p>
        <p>
          Protege tu acceso y utiliza Outify de forma lícita. No accedas a espacios ajenos, eludas
          medidas de seguridad ni subas contenido ilícito o que vulnere derechos de otras personas.
          Puedes comunicar incidencias a
          <a href="mailto:dlperezmartinez@gmail.com">dlperezmartinez&#64;gmail.com</a>.
        </p>
        <h2>3. Tus contenidos</h2>
        <p>
          Conservas los derechos de tus fotografías y contenidos. Debes disponer de los permisos
          necesarios para subirlos. Autorizas únicamente su alojamiento, reproducción técnica y
          visualización para prestar el servicio y cumplir obligaciones aplicables.
        </p>
        <p>
          Esta autorización no permite publicar tus fotografías en galerías promocionales,
          utilizarlas en campañas ni entrenar modelos con ellas. No incluyas información personal
          innecesaria. El tratamiento de datos se explica en la
          <a routerLink="/privacy">política de privacidad</a>.
        </p>
        <h2>4. Guardado, archivo y eliminación</h2>
        <p>
          Archivar conserva una prenda. Borrarla definitivamente no permite recuperarla desde
          Outify. Eliminar una zona o un armario conserva sus prendas sin asignar. El historial de
          zonas del editor permite deshacer y rehacer durante la sesión actual; desaparece al
          recargar o cambiar de armario y no es una copia de seguridad.
        </p>
        <p>
          Puedes solicitar la eliminación de tus datos en Mi cuenta. Una vez registrada, la baja no
          se puede cancelar ni deshacer. La limpieza continúa desde el servidor y puedes consultar
          su estado al entrar. El cierre afecta al espacio indicado, sin eliminar tu cuenta de
          Google ni los datos de otras aplicaciones.
        </p>
        <p>
          Para pedir una copia antes de eliminar el espacio o gestionar una solicitud que abarque
          otros entornos de Outify, utiliza el correo de contacto. La reapertura tras una baja
          requiere una sesión nueva y crear expresamente un espacio vacío.
        </p>
        <h2>5. Disponibilidad y cambios</h2>
        <p>
          La aplicación puede evolucionar y requerir mantenimiento. No se garantiza disponibilidad
          ininterrumpida. Comunicaremos los cambios relevantes en la aplicación o mediante el correo
          de la cuenta, con antelación cuando proceda.
        </p>
        <p>
          Ninguna de estas condiciones excluye derechos irrenunciables de consumidores ni
          responsabilidades que no puedan limitarse legalmente.
        </p>
        <h2>6. Contacto y legislación</h2>
        <p>
          Para cualquier consulta, escribe a
          <a href="mailto:dlperezmartinez@gmail.com">dlperezmartinez&#64;gmail.com</a>. Se aplica la
          legislación española respetando las normas imperativas y los fueros que correspondan al
          usuario. No se impone un tribunal exclusivo que limite tus derechos.
        </p>
      }
    </main>
    <footer class="public-footer">
      <a routerLink="/">Volver a Outify</a><app-legal-links />
    </footer>`,
})
export class Legal {
  readonly privacy = inject(ActivatedRoute).snapshot.data['document'] === 'privacy';
}
