# ProyectoIA — Registro de prompts

Prompts usados para generar las webs de este proyecto (concurso de clase) con Claude.
Todas las webs están hechas **solo con HTML y CSS**, sin JavaScript.

| # | Proyecto | Resultado | Estado |
|---|----------|-----------|--------|
| 1 | Calcetines Sostenibles S.L. ("NO PULSAR") | `index.html` | Descartado |
| 2 | El Calcetín Despierta (aventura apocalíptica) | `aventura/index.html` | Descartado |
| 3 | **PROJECT: BLACKSITE** | [`BLACKSITE/`](BLACKSITE/) | **Versión final** |

---

## Prompt 1 — Web "MUY LOCA": Calcetines Sostenibles S.L.

```text
Actúa como un desarrollador front-end experto y un humorista. Quiero una
web "MUY LOCA" para un concurso de clase, hecha ÚNICAMENTE con HTML y CSS
(cero JavaScript, cero librerías, cero imágenes externas, todo en un único
archivo index.html con el CSS dentro de <style>).

CONCEPTO
Una página corporativa aburridísima de una empresa ficticia ("Calcetines
Sostenibles S.L.") con menú, texto de relleno gracioso y un botón enorme que
pone "NO PULSAR". Al pulsarlo, todo estalla.

ANTES DE PULSAR
- Diseño gris/azul, tipografía del sistema, texto soporífero y divertido.
- El botón es un <label> estilizado, vinculado a un checkbox oculto.
- Easter eggs escondidos con :hover (un punto casi invisible en una esquina
  que muestra un mensaje secreto, el logo que guiña un ojo, etc.).

AL PULSAR (usando :checked o :has())
- La pantalla tiembla, todo gira y se invierte.
- El menú huye de la pantalla, los textos se desordenan y los colores se
  corrompen (hue-rotate, invert, glitch con clip-path).
- Aparecen grietas con gradientes y emojis/formas CSS cayendo por la pantalla.
- Un mensaje de Claude te regaña con humor, con texto que aparece letra a
  letra usando animation-delay.
- Un segundo botón escondido ("¿Y si lo pulsas otra vez?") que desencadena
  un último nivel de caos.

FINAL
- Botón "Reiniciar" con un <a href="#"> o truco CSS.
- Mensaje de cuarta pared: "Te dije que no lo pulsaras. Esta web la ha
  escrito una IA y aun así la has roto".

REQUISITOS TÉCNICOS
- HTML5 y CSS3 modernos (:has(), @keyframes, clip-path, mix-blend-mode,
  filter, grid/flex, custom properties). Responsive.
- Código comentado en español, indicando dónde está cada truco.
- Entrégame el archivo completo y, al final, una explicación corta de los 5
  trucos de CSS más importantes que has usado.
```

---

## Prompt 2 — Aventura apocalíptica "elige tu propio camino"

```text
Actúa como un desarrollador front-end experto y un guionista de humor absurdo.
Quiero una web "MUY LOCA" para un concurso de clase, hecha ÚNICAMENTE con
HTML y CSS (cero JavaScript, cero librerías, cero imágenes externas, todo en
un único archivo index.html con el CSS dentro de <style>).

CONCEPTO
Una aventura apocalíptica de "elige tu propio camino" en la que la propia
web se va destruyendo a medida que avanzo en la historia. El apocalipsis lo
provoca algo ridículo (por ejemplo, un calcetín que cobra consciencia).

HISTORIA
- Escrita por ti, en español, con humor absurdo.
- Al menos 5 escenas, 4 decisiones y 3 finales distintos.
- Cada escena tiene 2 o 3 opciones que llevan a escenas diferentes.
- Usa el truco de radio buttons ocultos + labels, y los selectores ~ o :has()
  para mostrar solo la escena activa.

LA WEB SE ROMPE
- Escena 1: todo normal, diseño limpio.
- Escena 2: pequeños temblores y algún color raro.
- Escena 3: letras que se caen y rotan, grietas hechas con gradientes.
- Escena 4: glitch fuerte (clip-path, hue-rotate, invert), fondo que se derrite.
- Finales: cada uno con su propia animación espectacular (explosión de
  colores, pantalla negra con texto letra a letra con animation-delay,
  amanecer absurdo, etc.).

EXTRAS
- Botón "Reiniciar" (un <a href="#"> o un truco con radio inicial).
- Un mensaje final rompiendo la cuarta pared: "Esta historia la ha escrito
  una IA y tú has elegido destruir el mundo por un calcetín".

REQUISITOS TÉCNICOS
- HTML5 y CSS3 modernos (:has(), @keyframes, clip-path, filter, grid/flex,
  custom properties). Responsive.
- Código comentado en español, indicando dónde está cada truco.
- Entrégame el archivo completo y, al final, una explicación corta de los 5
  trucos de CSS más importantes que has usado.
```

---

## Prompt 3 — PROJECT: BLACKSITE (versión final)

> Enviado con el comentario: *"no me gusta nada, aquí va otro prompt"*.

```text
Quiero que desarrolles una web completa llamada PROJECT: BLACKSITE.
Actúa como un desarrollador frontend senior, director creativo y diseñador de interfaces especializado en experiencias digitales cinematográficas y proyectos Awwwards.
IMPORTANTE: SOLAMENTE PUEDES UTILIZAR HTML5 Y CSS3 VANILLA. PROHIBIDO JAVASCRIPT, REACT, FRAMEWORKS, LIBRERÍAS O BOOTSTRAP.
1. CONCEPTO
La web representa el sistema informático interno de una instalación científica ultrasecreta que investiga experimentos y anomalías que no deberían existir.
El usuario está accediendo a un sistema restringido.
Debe transmitir:

* Misterio.
* Ciencia ficción.
* Peligro.
* Tecnología avanzada.
* Secretismo gubernamental.
* Investigación prohibida.

No quiero que parezca una web convencional. Quiero que parezca una interfaz de control real de una instalación secreta.
2. DIRECCIÓN ARTÍSTICA
Estética dark sci-fi, industrial y cinematográfica.
Inspiraciones visuales:

* Interfaces futuristas de películas de ciencia ficción.
* Sistemas informáticos militares.
* Laboratorios de investigación secretos.
* Interfaces HUD.
* Expedientes gubernamentales clasificados.
* Diseño editorial tecnológico.

Paleta:

* Negro: #08090B
* Gris oscuro: #15171A
* Gris técnico: #777777
* Blanco: #E8E8E8
* Rojo de alerta: #E53935
* Rojo oscuro: #541414

Utiliza tipografías modernas, monoespaciadas y condensadas.
Mucho espacio negativo, líneas divisorias, etiquetas técnicas, numeración y microdetalles.
3. ESTRUCTURA DE LA WEB
Quiero las siguientes páginas:
A) INDEX.HTML — MAINFRAME
La página principal debe incluir:

* Barra de navegación tecnológica.
* Logotipo BLACKSITE.
* Indicador de acceso restringido.
* Fecha y código de instalación.
* Mensaje principal impactante.
* Panel de estado de la instalación.
* Indicadores de contención.
* Número de experimentos activos.
* Alertas de seguridad.
* Acceso a la base de datos de experimentos.

B) EXPERIMENTS.HTML — DATABASE
Un catálogo de experimentos clasificados.
Crear cuatro tarjetas:

* EXP-001: THE ORGANISM.
* EXP-002: THE VOID.
* EXP-003: SUBJECT ZERO.
* EXP-004: RED SUN.

Cada tarjeta debe tener:

* Imagen.
* Identificador.
* Nombre.
* Nivel de amenaza.
* Estado de contención.
* Breve descripción.
* Botón para consultar expediente.

Las tarjetas deben tener efectos hover espectaculares. Al pasar el ratón, deben revelar información adicional, cambiar la iluminación, hacer zoom en la imagen y mostrar etiquetas de información clasificada.
C) DOSSIER.HTML — EXPEDIENTE
Crear una ficha de investigación muy detallada.
Debe incluir:

* Imagen principal del experimento.
* Código de identificación.
* Nivel de amenaza.
* Estado de contención.
* Clasificación.
* Descripción científica ficticia.
* Historial de investigación.
* Observaciones.
* Documentos restringidos.
* Advertencias de seguridad.

D) CONTROL.HTML — CONTAINMENT CONTROL
Crear un panel de control futurista.
Incluir:

* Estado de los sistemas.
* Barras de energía.
* Indicadores de contención.
* Panel de temperatura.
* Alarmas.
* Mapa esquemático de la instalación.
* Botones de control visuales.

Los controles deben ser demostrativos, sin ejecutar acciones reales.
E) INCIDENTS.HTML — INCIDENT REPORTS
Una base de datos de accidentes y sucesos extraños.
Crear informes clasificados con:

* Número de incidente.
* Fecha ficticia.
* Ubicación.
* Nivel de gravedad.
* Descripción.
* Estado del informe.

F) ARCHIVES.HTML — CLASSIFIED ARCHIVES
Una sección de archivos secretos.
Crear documentos, fotografías, registros y expedientes bloqueados visualmente.
Utilizar elementos desplegables y enlaces para descubrir contenido oculto.
4. FUNCIONALIDADES CSS OBLIGATORIAS
Quiero que aproveches al máximo CSS.
Implementar:

* Animaciones de luces de alarma.
* Efectos glitch.
* Texto con parpadeo.
* Barras de progreso animadas.
* Tarjetas interactivas.
* Efectos hover avanzados.
* Transiciones entre páginas.
* Menús desplegables.
* Paneles expandibles.
* Botones con estados visuales.
* Ventanas de advertencia.
* Overlays.
* Animaciones de carga.
* Efectos de escaneo.
* Elementos que simulen pantallas de monitorización.

Utilizar:

* @keyframes.
* :hover.
* :focus.
* :checked.
* :target.
* CSS Grid.
* Flexbox.
* clip-path.
* transform.
* perspective.
* mix-blend-mode.
* filter.
* backdrop-filter.
* variables CSS.
* media queries.

No utilices JavaScript bajo ninguna circunstancia.
5. DETALLES QUE MARCARÁN LA DIFERENCIA
Quiero detalles pequeños que hagan que la web parezca un sistema real:

* Códigos de acceso.
* Identificadores de experimentos.
* Coordenadas ficticias.
* Etiquetas CONFIDENTIAL.
* Marcas de agua CLASSIFIED.
* Número de versión del sistema.
* Registros de actividad.
* Advertencias rojas.
* Numeración de sectores.
* Barras de carga.
* Indicadores luminosos.
* Pequeños textos técnicos.

No llenes todo de elementos sin sentido. Mantén una jerarquía visual profesional.
6. DISEÑO Y RESPONSIVE
La web debe funcionar perfectamente en:

* Ordenador.
* Tablet.
* Móvil.

El diseño de escritorio debe ser especialmente espectacular.
No quiero una plantilla genérica. Diseña una interfaz con personalidad propia.
7. ORGANIZACIÓN DE ARCHIVOS
Utiliza esta estructura:
BLACKSITE/ index.html experiments.html dossier.html control.html incidents.html archives.html css/ style.css assets/ images/
Todos los archivos HTML deben enlazarse correctamente.
Centraliza los estilos en style.css.
8. CALIDAD DEL CÓDIGO

* Código limpio y organizado.
* HTML semántico.
* CSS ordenado por secciones.
* Clases con nombres comprensibles.
* Sin dependencias externas de JavaScript.
* Sin código innecesario.
* Responsive.
* Navegación funcional.
* Todas las páginas deben tener coherencia visual.

9. INSTRUCCIONES DE TRABAJO
Primero diseña la identidad visual y la estructura completa.
Después desarrolla la web página por página.
No simplifiques las páginas para ahorrar código.
No quiero una demo básica ni un wireframe. Quiero una web terminada, con contenido ficticio convincente, diseño cuidado y una ejecución visual de alto nivel.
Si necesitas imágenes, indica qué imágenes debo conseguir y qué nombres deben tener dentro de assets/images.
Empieza por index.html y style.css, y después continúa con el resto de páginas.
Recuerda: SOLO HTML Y CSS VANILLA.
```

### Resultado

```
BLACKSITE/
├── index.html         01 · Mainframe
├── experiments.html   02 · Database
├── dossier.html       03 · Dossier (EXP-001)
├── control.html       04 · Containment Control
├── incidents.html     05 · Incident Reports
├── archives.html      06 · Classified Archives
├── css/style.css      Hoja de estilos única
└── assets/images/     Fotos opcionales (ver LEEME.txt)
```

Para verla con las transiciones entre páginas activas:

```bash
cd BLACKSITE && python3 -m http.server 8047
```

y abrir <http://localhost:8047>.
