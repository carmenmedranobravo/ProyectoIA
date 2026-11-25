# PROJECT: BLACKSITE

> Sistema informático interno de la **Instalación 07**, una base científica ultrasecreta que
> investiga experimentos y anomalías que no deberían existir.
> Proyecto de clase · HTML5 + CSS3 + JavaScript Vanilla (ES6+) · sin frameworks ni librerías.

**Estado:** v2.0 — capa interactiva con JavaScript completada y probada.

---

## 1. Descripción

BLACKSITE es una web de varias páginas que imita la terminal de control de una instalación
secreta: estética *dark sci-fi* industrial, interfaz tipo HUD, expedientes clasificados y
paneles de monitorización.

- **v1.0**: toda la experiencia está hecha solo con HTML y CSS (radios, `:checked`, `:target`,
  `:has()`, animaciones…).
- **v2.0**: una capa de **JavaScript Vanilla** convierte la web en un sistema "vivo". Añade
  terminal de comandos, arranque del sistema, reloj real, alertas, eventos aleatorios,
  buscadores, mapa interactivo, alarmas, secretos, sonido y preferencias guardadas.

La capa JS es una **mejora progresiva**: si JavaScript no está disponible, la web sigue
funcionando como en la v1.0. No se ha cambiado la composición, los colores, las tipografías ni
la navegación. Los estilos nuevos están en la sección 17 de `style.css` y reutilizan las
variables y componentes existentes (`.panel`, `.btn`, `.modal`, `.switch`, `.tag`…).

---

## 2. Estructura de carpetas

```
BLACKSITE/
├── index.html            01 · Mainframe
├── experiments.html      02 · Database
├── dossier.html          03 · Dossier (EXP-001)
├── control.html          04 · Containment Control
├── incidents.html        05 · Incident Reports
├── archives.html         06 · Classified Archives
├── README.md
├── css/
│   └── style.css         Hoja de estilos única (secciones 00–17; la 17 es la capa JS)
├── js/
│   ├── core.js           Núcleo: espacio BS, utilidades, almacenamiento, eventos, módulos
│   ├── data.js           Datos compartidos (experimentos, incidentes, archivo, fotos)
│   ├── prefs.js          Preferencias y favoritos (localStorage)
│   ├── audio.js          Efectos de sonido sintetizados (Web Audio API)
│   ├── notify.js         Notificaciones y registro de alertas
│   ├── ui.js             Modales, paneles laterales, dock y ajustes
│   ├── secrets.js        Descubrimientos secretos y códigos
│   ├── clock.js          Reloj en tiempo real
│   ├── boot.js           SYSTEM BOOT SEQUENCE
│   ├── transitions.js    Transiciones cinematográficas entre páginas
│   ├── cursor.js         Cursor táctico (escritorio)
│   ├── monitor.js        Estado vivo y panel de monitorización
│   ├── anomalies.js      Eventos aleatorios
│   ├── alarms.js         Alarmas y estados de emergencia
│   ├── terminal.js       Terminal interactiva
│   ├── database.js       Página Database
│   ├── dossier.js        Página Dossier
│   ├── control.js        Página Containment Control (incluye el mapa)
│   ├── incidents.js      Página Incident Reports
│   ├── archives.js       Página Classified Archives
│   └── main.js           Punto de entrada (arranca los módulos)
└── assets/
    └── images/           Fotos opcionales (ver LEEME.txt)
```

---

## 3. Funcionalidades JavaScript

| Funcionalidad | Dónde | Cómo se usa |
|---|---|---|
| **Terminal interactiva** | Todas las páginas | Tecla `º` / `` ` ``, botón `>_ Terminal` del dock o "Abrir terminal" en el Mainframe. Comandos: `HELP`, `STATUS`, `EXPERIMENTS [ID]`, `INCIDENTS [gravedad]`, `ARCHIVES [texto]`, `OPEN <módulo>`, `ALARM <0/1/2/OFF/OMEGA>`, `SCAN`, `CODE <código>`, `DISCOVERIES`, `FAVORITES`, `SOUND ON/OFF`, `WHOAMI`, `DATE`, `HISTORY`, `CLEAR`, `EXIT`. Historial con ↑ ↓ y autocompletado con Tab. |
| **SYSTEM BOOT SEQUENCE** | Primera página de la sesión | Diagnóstico línea a línea, barra de progreso, escáner biométrico y "ACCESS GRANTED". Se omite con cualquier tecla. Configurable: una vez por sesión, siempre o nunca. |
| **Reloj en tiempo real** | Metabarra de todas las páginas | Hora UTC real con el año fijado en 2047. Contador "Actualizado hace…" en el Mainframe. Se vuelve loco con las anomalías temporales. |
| **Notificaciones y alertas** | Todas | Avisos con nivel (info / ok / aviso / crítica), barra de vida, acciones y registro de la sesión en el dock (`▲ Alertas`). |
| **Eventos aleatorios** | Todas | Cada 25–55 s: interferencias, apagones, fallos de contención, anomalías temporales, contactos y voces. Se pueden desactivar en Ajustes. |
| **Buscador y filtros** | Database | Búsqueda de texto (atajo `/`), orden por ID / amenaza / contención y filtro de favoritos. Se combina con el filtro CSS de amenaza. |
| **Modales ampliados** | Database | "Vista rápida" de cada experimento: imagen, ficha completa, informe ampliado (censurado sin CLR-5) e integridad en tiempo real. |
| **Pestañas** | Dossier | Las 4 secciones del expediente se muestran en pestañas accesibles (teclado ← →). Recuerda la última abierta. |
| **Documentos desbloqueables** | Dossier y Archives | Autopsias (Dossier), LCK-01/02 (descifrado con animación y memoria) y LCK-03/04 (con código). |
| **Monitorización dinámica** | Mainframe y Control | Integridad, temperaturas, energía, baterías y personal evolucionan en directo. El registro de actividad recibe eventos. |
| **Mapa interactivo** | Control | Selección de sector (clic / Enter), cámara de seguridad, sellar / abrir y envío de equipos tácticos con informe. |
| **Alarmas y emergencias** | Todas (estado compartido) | Niveles Normal, Alerta, Lockdown (luces y sirena) y Omega (cuenta atrás simulada). Selector de modo en Control. Se mantiene al cambiar de página. |
| **Controles reales** | Control | ACK de alarmas, reinicio de sensores, purga térmica, evacuación, sellado del ascensor e interruptores con efectos (p. ej. apagar la luz de B-12 baja la contención). |
| **Archivo secreto** | Archives | Buscador de texto completo y categorías (Documentos, Fotografías, Registros, Bloqueados). |
| **Descubrimientos secretos** | Todas | 6 secretos con códigos ocultos en el contenido (ver sección 6). |
| **Transiciones cinematográficas** | Enlaces internos | Obturador que se cierra con el nombre del módulo de destino y se abre en la página nueva. |
| **Preferencias y favoritos** | Dock → `⚙ Ajustes` | Sonido, volumen, cursor, efectos CRT, eventos, arranque, favoritos (★ en experimentos e informes) y progreso. Todo en `localStorage`. |
| **Cursor personalizado** | Escritorio con ratón | Anillo con inercia, punto rojo y coordenadas. Crece sobre elementos interactivos. |
| **Sonido opcional** | Dock → `♪ Sonido` | Clics, avisos, sirena, arranque y desbloqueos sintetizados en tiempo real (sin archivos). Desactivado por defecto. |

---

## 4. Módulos JavaScript

Todos los archivos usan **scripts clásicos con `defer`** (no módulos ES). Así la web funciona
también abriendo `index.html` con doble clic. Cada archivo es una IIFE que se registra en el
núcleo con `BS.register(nombre, { pages, init })`. `main.js` arranca solo los módulos de la
página actual (`<body data-page="…">`). Cada inicio va dentro de un `try/catch`, de modo que
un fallo en un módulo no rompe los demás. Los módulos se comunican con un bus de eventos
(`BS.on` / `BS.emit`) y no se llaman directamente entre sí.

| Módulo | Responsabilidad | API / eventos principales |
|---|---|---|
| `core.js` | Se carga en `<head>` sin `defer` y añade `<html class="js">` antes del primer pintado. Utilidades DOM (`BS.el`, `BS.$`), almacenamiento seguro (`BS.store`, `BS.session`), bus de eventos y registro de módulos. | `BS.register`, `BS.start`, `BS.on/emit` |
| `data.js` | Única fuente de datos: páginas, experimentos (y EXP-005 oculto), incidentes, índice del archivo y lista de fotos disponibles. | `BS.data`, `BS.applyPhotos` |
| `prefs.js` | Preferencias con valores por defecto y favoritos persistentes. Crea los botones ★. | `BS.prefs`, `BS.favorites`, `prefs:change` |
| `audio.js` | Sintetiza todos los sonidos con osciladores y ruido. La sirena funciona en bucle. Respeta el volumen. | `BS.sfx.play()`, `BS.sfx.siren()` |
| `notify.js` | Toasts accesibles (`aria-live`), registro de sesión, contador de no leídas y silencio en el apagón de comunicaciones. | `BS.notify()`, `notify` |
| `ui.js` | Modal genérico (con la piel de los modales `:target`), paneles laterales, dock, panel de ajustes y cierre con Escape de los modales CSS. | `BS.ui.modal`, `BS.ui.drawer` |
| `secrets.js` | Códigos tecleados en cualquier parte, Konami, enlace oculto, formulario de código y progreso guardado. | `BS.secrets`, `secret:unlocked` |
| `clock.js` | Reloj UTC alineado al segundo y contador "Actualizado hace". | `BS.clock`, escucha `anomaly:time` |
| `boot.js` | Pantalla de arranque asíncrona (async/await) que se puede omitir. | `boot:done`, `<html class="booted">` |
| `transitions.js` | Intercepta enlaces internos y guarda el destino en `sessionStorage` para la entrada. | — |
| `cursor.js` | Bucle `requestAnimationFrame` con interpolación. Solo con `pointer: fine`. | — |
| `monitor.js` | Estado de la instalación (paseo aleatorio, umbrales, guardado por sesión) y enlace con el DOM mediante `data-bind`. | `BS.state`, `BS.monitor`, `state:update` |
| `anomalies.js` | Planificador de eventos aleatorios ponderados. | `BS.anomalies.trigger()`, `anomaly` |
| `alarms.js` | Máquina de estados de alarma con banner, luces, sirena y cuenta atrás Omega. | `BS.alarm.set/clear/omega`, `alarm:change` |
| `terminal.js` | Intérprete de comandos con historial, autocompletado y salida tabulada. | `BS.terminal.open/run` |
| `database.js` | Filtros combinados, orden, vista rápida y aparición de EXP-005. | — |
| `dossier.js` | Pestañas ARIA (`tablist` / `tab` / `tabpanel`) y documento de autopsias. | — |
| `control.js` | Modos, ACK, acciones con estado ocupado, interruptores, Omega y mapa. | — |
| `incidents.js` | Buscador, favoritos, expandir / contraer y enlaces directos `#INC-…`. | — |
| `archives.js` | Buscador, categorías, descifrado con animación y expedientes sellados. | — |
| `main.js` | Llama a `BS.start()`. | — |

**Integración en el HTML:** solo se han añadido atributos y etiquetas `<script>`, sin cambiar
la estructura. Se añadieron `data-page` (en `<body>`), `data-clock`, `data-updated`,
`data-bind` (valores vivos), `data-cmd` (botones de control), `data-switch` (interruptores) y un
botón `js-only` "Abrir terminal".

---

## 5. Cómo ejecutar el proyecto

1. **Opción rápida:** abrir `index.html` con doble clic. Todo funciona sin servidor.
2. **Recomendado:** usar un servidor local para que también funcionen las transiciones de
   página nativas del navegador (View Transitions):

   ```bash
   cd BLACKSITE
   python3 -m http.server 8047
   ```

   y abrir <http://localhost:8047>.
3. Navegador recomendado: Chrome, Edge, Safari o Firefox actuales (se usa `:has()`).

**Fotos opcionales:** copie las fotos en `assets/images/` con los nombres de `LEEME.txt` y
añada cada nombre a `BS.data.photos` en `js/data.js`. Sin JavaScript se cargan solas. Con
JavaScript solo se piden las de la lista, para no generar errores 404 en consola.

---

## 6. Descubrimientos secretos (spoilers)

<details>
<summary>Mostrar códigos</summary>

| Secreto | Código / acción | Pista en la web | Recompensa |
|---|---|---|---|
| Modo CLR-5 | `↑ ↑ ↓ ↓ ← → ← → B A` | Mensaje en la consola del navegador | Se revela todo el texto censurado y se activan los botones CLR-5 de Control |
| Proyecto ESPEJO | `7741K` | Credencial del operador en la metabarra | Desbloquea LCK-03 |
| EXP-005 · The Echo | `0300` | Hora del sol rojo (EXP-004) | Nuevo experimento en Database y LCK-04 |
| Autopsias | `ARENAS` | Técnico J. Arenas (Dossier, Archives) | Documento CLR-5 del Dossier |
| Llave del Director | `HALVORSEN` | Firma del memorándum Nº 0007 | Autoriza el Protocolo Omega (cuenta atrás) |
| Archivo Ω | Punto rojo casi invisible en LCK-04 | Archives → Bloqueados | Mensaje desde mañana |

Los códigos se pueden teclear en cualquier página, con `CODE <código>` en la terminal o en los
formularios de documentos bloqueados.
</details>

---

## 7. Registro de cambios

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 25.11.2026 | Web completa en HTML + CSS: 6 páginas, identidad visual y efectos CSS. |
| 2.0-dev | 25.11.2026 | Inicio de la capa JavaScript. README reorganizado con todos los prompts íntegros. |
| 2.0-dev | 25.11.2026 | Módulos base: núcleo, datos, preferencias, audio, notificaciones, interfaz. |
| 2.0-dev | 25.11.2026 | Módulos globales: reloj, arranque, transiciones, cursor, terminal, secretos, monitor, anomalías y alarmas. |
| 2.0-dev | 25.11.2026 | Módulos de página: Database, Dossier, Control (mapa), Incidents y Archives. |
| 2.0-dev | 25.11.2026 | Integración en los 6 HTML (`data-page`, `data-bind`, `data-cmd`, `data-switch`, scripts). |
| 2.0 | 25.11.2026 | Pruebas y correcciones: foco inmediato de la terminal, apertura de modales sin depender de `requestAnimationFrame`, descifrado con temporizador, fotos opcionales sin errores 404, deriva de EXP-002 más suave. Verificado: 0 errores nuevos en consola y ningún desbordamiento horizontal a 375 y 768 px. |

---

## 8. Funcionalidades completadas y pendientes

**Completadas**

- [x] Terminal interactiva (HELP, STATUS, EXPERIMENTS, INCIDENTS, ARCHIVES, CLEAR y 12 comandos más)
- [x] SYSTEM BOOT SEQUENCE
- [x] Reloj digital en tiempo real
- [x] Sistema de notificaciones y alertas dinámicas con registro
- [x] Eventos aleatorios de anomalías, fallos de contención e interferencias
- [x] Buscador, orden y filtros funcionales en la base de datos
- [x] Modales con información ampliada de los experimentos
- [x] Pestañas interactivas en el expediente
- [x] Documentos clasificados desbloqueables
- [x] Panel de monitorización con valores dinámicos
- [x] Mapa interactivo de la instalación
- [x] Simulación de alarmas y estados de emergencia (incluido Omega)
- [x] Archivo secreto con buscador y categorías
- [x] Descubrimientos secretos mediante códigos ocultos
- [x] Transiciones cinematográficas entre páginas
- [x] Preferencias y favoritos con localStorage
- [x] Cursor personalizado para escritorio
- [x] Efectos de sonido opcionales y controles de audio
- [x] Responsive (dock y terminal adaptados a móvil) y `prefers-reduced-motion`

**Pendientes / ideas futuras**

- [ ] Fotografías reales en `assets/images/` (la web usa arte CSS mientras tanto)
- [ ] Expedientes completos para EXP-002, EXP-003 y EXP-004 (ahora muestran "Acceso denegado")
- [ ] Más comandos de terminal (p. ej. `LOGS` con exportación del registro)
- [ ] Atrapar el foco dentro de los modales generados por JS (ahora se enfoca el primer control y Escape cierra)

---

## 9. Historial de prompts

Todos los prompts se conservan íntegros. El **Prompt 3** es el prompt original que define
PROJECT: BLACKSITE; el **Prompt 4** es la ampliación con JavaScript.

| # | Proyecto | Resultado | Estado |
|---|----------|-----------|--------|
| 1 | Calcetines Sostenibles S.L. ("NO PULSAR") | — | Descartado |
| 2 | El Calcetín Despierta (aventura apocalíptica) | — | Descartado |
| 3 | **PROJECT: BLACKSITE** (prompt original) | HTML + CSS | v1.0 |
| 4 | **BLACKSITE · ampliación JavaScript** | JS Vanilla | v2.0 |

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

---

## Prompt 4 — Ampliación con JavaScript Vanilla (v2.0)

```text
Quiero que amplíes mi proyecto actual PROJECT: BLACKSITE añadiendo funcionalidades avanzadas con JavaScript Vanilla (ES6+).
IMPORTANTE: NO QUIERO QUE REHAGAS LA WEB DESDE CERO.
Ya tengo el proyecto desarrollado en HTML5 y CSS3. Quiero que trabajes sobre los archivos existentes, respetando completamente su identidad visual, diseño, estructura, estilos y contenido.
1. JAVASCRIPT
Añade funcionalidades interactivas reales utilizando JavaScript Vanilla.
Quiero incorporar:

* Terminal interactiva con comandos como HELP, STATUS, EXPERIMENTS, INCIDENTS, ARCHIVES y CLEAR.
* Pantalla de arranque del sistema (SYSTEM BOOT SEQUENCE).
* Reloj digital en tiempo real.
* Sistema de notificaciones y alertas dinámicas.
* Eventos aleatorios de anomalías, fallos de contención e interferencias.
* Buscador y filtros funcionales en la base de datos de experimentos.
* Modales con información ampliada de los experimentos.
* Pestañas interactivas en los expedientes.
* Documentos clasificados desbloqueables.
* Panel de monitorización con valores dinámicos.
* Mapa interactivo de la instalación.
* Simulación de alarmas y estados de emergencia.
* Sistema de archivos secretos con buscador y categorías.
* Sistema de descubrimientos secretos mediante códigos ocultos.
* Transiciones cinematográficas entre páginas.
* Preferencias y favoritos guardados mediante localStorage.
* Cursor personalizado para escritorio.
* Efectos de sonido opcionales y controles de audio.

Todas las funcionalidades deben funcionar realmente. No quiero botones decorativos que no hagan nada.
2. RESPETA EL DISEÑO ACTUAL
Es fundamental que NO modifiques innecesariamente:

* La composición de las páginas.
* Los colores.
* Las tipografías.
* Las imágenes.
* Los tamaños y espaciados.
* La estructura de navegación.
* La identidad visual BLACKSITE.

Puedes mejorar detalles visuales cuando sea necesario para integrar las nuevas funcionalidades, pero sin cambiar la estética original.
3. ORGANIZACIÓN DEL CÓDIGO
Utiliza JavaScript Vanilla, sin React, Vue, frameworks ni librerías externas.
Organiza el código en módulos independientes y reutilizables.
Evita duplicaciones y mantén el código limpio.
Comprueba que los scripts no generen errores en páginas donde determinadas funcionalidades no existan.
4. README.MD OBLIGATORIO
Crea o actualiza el archivo README.md en la raíz del proyecto.
Debe incluir:

* El prompt original completo que define PROJECT: BLACKSITE.
* Una descripción del proyecto.
* La estructura actualizada de carpetas y archivos.
* Las nuevas funcionalidades JavaScript añadidas.
* Una explicación de cada módulo JavaScript.
* Instrucciones para ejecutar el proyecto.
* Un registro de cambios.
* Una lista de funcionalidades completadas y pendientes.

MUY IMPORTANTE: conserva íntegramente el prompt original. No lo sustituyas por un resumen ni lo elimines.
Actualiza el README.md durante el desarrollo, no solamente al finalizar.
5. FORMA DE TRABAJAR
Antes de modificar nada:

1. Analiza todos los archivos existentes.
2. Comprende cómo está organizado el proyecto.
3. Identifica dónde integrar cada funcionalidad.
4. Comprueba qué funcionalidades ya existen para no duplicarlas.
5. Planifica las modificaciones necesarias.

Después implementa las mejoras directamente sobre el proyecto existente.
No elimines funcionalidades actuales ni sustituyas páginas completas sin una razón técnica justificada.
6. RESULTADO FINAL
Quiero que BLACKSITE evolucione de una web visual a una experiencia interactiva, inmersiva y dinámica.
Mantén toda su personalidad original, pero añade la sensación de estar utilizando un auténtico sistema informático de una instalación científica ultrasecreta.
No quiero una propuesta ni una explicación de cómo hacerlo: quiero que implementes los cambios directamente en los archivos del proyecto.
Al terminar, comprueba que todo funciona, que no hay errores en consola y que el diseño sigue siendo responsive.
Trabaja sobre el proyecto existente. No lo reconstruyas desde cero.
```
