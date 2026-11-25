/* ==========================================================================
   BLACKSITE OS · data.js
   Datos compartidos (una sola fuente para terminal, modales y buscadores).
   Coinciden con el contenido de las páginas HTML.
   ========================================================================== */
(() => {
  'use strict';

  BS.data = {
    /* Páginas del sistema (para la terminal y las transiciones) */
    pages: [
      { key: 'mainframe',   num: '01', name: 'Mainframe',           file: 'index.html' },
      { key: 'database',    num: '02', name: 'Database',            file: 'experiments.html' },
      { key: 'dossier',     num: '03', name: 'Dossier',             file: 'dossier.html' },
      { key: 'control',     num: '04', name: 'Containment Control', file: 'control.html' },
      { key: 'incidents',   num: '05', name: 'Incident Reports',    file: 'incidents.html' },
      { key: 'archives',    num: '06', name: 'Classified Archives', file: 'archives.html' },
    ],

    experiments: [
      {
        id: 'EXP-001', name: 'The Organism', visual: 'organism', threat: 4, threatLabel: 'Alta',
        status: 'stable', statusLabel: 'Contenido · inestable', integrity: 72, cell: 'Celda B-12',
        cls: 'Biológica', clearance: 4, dossier: 'dossier.html',
        summary: 'Biomasa de origen desconocido extraída de un pozo de hielo a 3.900 m de profundidad. Crece, aprende y, desde el día 212, imita las voces del personal.',
        detail: 'Sus células carecen de núcleo pero se replican siguiendo patrones "intencionados". Conduce impulsos eléctricos a 120 m/s y responde a la presencia de observadores incluso a través de 40 cm de plomo. Sin vigilancia, su crecimiento se acelera un 600%.',
        facts: { 'Descubierto': '04.02.2044', 'Masa actual': '318 kg (+2,1%/día)', 'Investigadora jefe': 'Dra. Ilse Varga', 'Bajas asociadas': '03', 'Protocolo': 'PRT-B12' },
      },
      {
        id: 'EXP-002', name: 'The Void', visual: 'void', threat: 5, threatLabel: 'Crítica',
        status: 'breach', statusLabel: 'Riesgo de brecha', integrity: 41, cell: 'Sector 09',
        cls: 'Espacial', clearance: 5, dossier: 'dossier.html#denied-002',
        summary: 'Esfera de 2,3 m de "ausencia absoluta": no refleja luz, no emite calor y no aparece en ningún instrumento. Lo que entra no sale. El sonido, tampoco.',
        detail: 'Desde su hallazgo el diámetro ha crecido 4 cm. El corredor que la rodea mide hoy 48,2 m, aunque en los planos mide 31. Un dron atado a un cable de 500 m sigue transmitiendo desde su interior 709 días después.',
        facts: { 'Descubierto': '19.09.2045', 'Diámetro': '2,30 m (creciendo)', 'Protocolo': 'VACÍO-3', 'Personal perdido': '██', 'Gravedad local': '+0,4 g' },
      },
      {
        id: 'EXP-003', name: 'Subject Zero', visual: 'subject', threat: 3, threatLabel: 'Elevada',
        status: 'stable', statusLabel: 'Contenido · cooperativo', integrity: 96, cell: 'Celda A-01',
        cls: 'Humana', clearance: 5, dossier: 'dossier.html#denied-003',
        summary: 'Varón, edad aparente 34 años. No figura en ningún registro civil. Responde a las preguntas segundos antes de que se formulen. Afirma que "ya ha estado aquí".',
        detail: 'Apareció en la celda A-01 el 01.01.2046 a las 00:00:00. Las cámaras lo registran 3,2 s antes de que entre en plano. Ha pedido que la puerta de su celda permanezca abierta; nunca ha salido.',
        facts: { 'Ingreso': '01.01.2046 — 00:00:00', 'Adelanto medio': '3,2 s', 'Entrevistador': 'Dr. Henrik Lund', 'Entrevistas': '311', 'Estado': 'Cooperativo' },
      },
      {
        id: 'EXP-004', name: 'Red Sun', visual: 'redsun', threat: 5, threatLabel: 'Crítica',
        status: 'breach', statusLabel: 'Contención parcial', integrity: 58, cell: 'Nivel −7',
        cls: 'Desconocida', clearance: 5, dossier: 'dossier.html#denied-004',
        summary: 'Fuente de luz roja que "amanece" cada noche a las 03:00 en una caverna del nivel −7, sin cielo ni origen visible. Quien la observa más de 40 s pierde minutos de memoria.',
        detail: 'Emite a una longitud de onda constante de 700 nm. El tiempo perdido acumulado por el personal supera las 41 horas. Las plantas del nivel −7 crecen orientadas hacia ella aunque esté apagada.',
        facts: { 'Primer avistamiento': '27.06.2046', 'Longitud de onda': 'λ 700 nm', 'Tiempo perdido total': '41 h 12 min', 'Exposición máx.': '40 s', 'Hora de salida': '03:00' },
      },
    ],

    /* Experimento oculto: solo aparece al descubrir el código correspondiente */
    hiddenExperiment: {
      id: 'EXP-005', name: 'The Echo', visual: 'subject', threat: 5, threatLabel: '██████',
      status: 'breach', statusLabel: 'No registrado', integrity: 0, cell: '██████',
      cls: 'Desconocida', clearance: 5, dossier: 'archives.html#locked',
      summary: 'Este experimento no existe. El registro se creó el 14.11.2047, un día después de la fecha actual del sistema, desde la terminal T-01.',
      detail: 'Única anotación disponible: "Lo que bajó al nivel −7 a las 03:00 no es lo mismo que subió". Firmado con la credencial 7741-K.',
      facts: { 'Creado': '14.11.2047', 'Terminal': 'T-01', 'Credencial': '7741-K', 'Estado': 'No registrado' },
    },

    incidents: [
      { id: 'INC-2047-0118', date: '13.11.2047', title: 'Fluctuación gravitacional', place: 'Sector 09', sev: 'critical', status: 'Abierto' },
      { id: 'INC-2047-0117', date: '13.11.2047', title: 'Alarma activada por el espécimen', place: 'Celda B-12', sev: 'severe', status: 'En revisión' },
      { id: 'INC-2047-0112', date: '02.11.2047', title: 'Pérdida colectiva de tiempo', place: 'Nivel −7', sev: 'moderate', status: 'Cerrado' },
      { id: 'INC-2047-0098', date: '21.10.2047', title: 'Respuesta anticipada en entrevista', place: 'Celda A-01', sev: 'minor', status: 'Cerrado' },
      { id: 'INC-2046-0031', date: '17.03.2046', title: 'Primera brecha biológica', place: 'Celda B-12', sev: 'critical', status: 'Redacted' },
      { id: 'INC-2045-0077', date: '02.12.2045', title: 'Dron de reconocimiento perdido', place: 'Sector 09', sev: 'severe', status: 'Abierto' },
      { id: 'INC-2045-0042', date: '09.07.2045', title: 'Credencial de empleado fallecido', place: 'Terminal 4-B', sev: 'moderate', status: 'Cerrado' },
      { id: 'INC-2044-0003', date: '05.02.2044', title: 'Broca de perforación "digerida"', place: 'Pozo P-3', sev: 'minor', status: 'Archivado' },
    ],
    severityLabel: { critical: 'Crítica', severe: 'Grave', moderate: 'Moderada', minor: 'Leve' },

    /* Índice del archivo (la terminal lo usa para buscar) */
    archives: [
      { cat: 'documents', id: 'documents', title: 'Memorándum interno Nº 0007 · Emplazamiento', tags: 'halvorsen glaciar latido' },
      { cat: 'documents', id: 'documents', title: 'Normativa de personal · Rev. 3', tags: 'puertas corredor' },
      { cat: 'documents', id: 'documents', title: 'Mensaje cifrado del Consejo', tags: 'aurora eliminación' },
      { cat: 'documents', id: 'documents', title: 'Nota manuscrita · taquilla 117', tags: 'sol ojo 03:00' },
      { cat: 'documents', id: 'documents', title: 'Manual de evacuación · Procedimiento E-1', tags: 'ascensor escalera' },
      { cat: 'photos', id: 'ph-1', title: 'EV-0112 · Corredor C-0', tags: 'pasillo' },
      { cat: 'photos', id: 'ph-2', title: 'EV-0204 · Muestra L-2', tags: 'organism' },
      { cat: 'photos', id: 'ph-3', title: 'EV-0311 · CAM-22', tags: 'subject zero cámara' },
      { cat: 'photos', id: 'ph-4', title: 'EV-0403 · Nivel −7', tags: 'red sun' },
      { cat: 'photos', id: 'ph-5', title: 'EV-0099 · Laboratorio L-1', tags: 'clausurado' },
      { cat: 'photos', id: 'ph-6', title: 'EV-0001 · Pozo P-3', tags: 'cráter' },
      { cat: 'logs', id: 'logs', title: 'AUD-0311 · Entrevista #311 con EXP-003', tags: 'lund jueves ascensor' },
      { cat: 'logs', id: 'logs', title: 'AUD-0207 · Micrófono interno B-12', tags: 'arenas voz' },
      { cat: 'logs', id: 'logs', title: 'AUD-0002 · Señal del dron RX-4', tags: 'void tono' },
      { cat: 'locked', id: 'locked', title: 'LCK-01 · Lista de turnos de B-12', tags: 'turnos' },
      { cat: 'locked', id: 'locked', title: 'LCK-02 · Inventario del nivel −7', tags: 'sillas' },
      { cat: 'locked', id: 'locked', title: 'LCK-03 · Proyecto ██████', tags: 'sellado' },
      { cat: 'locked', id: 'locked', title: 'LCK-04 · EXP-005', tags: 'sellado' },
    ],
    archiveCategories: { documents: 'Documentos', photos: 'Fotografías', logs: 'Registros', locked: 'Bloqueados' },
  };

  /* ---------- Fotografías opcionales ----------
     Al copiar una foto en assets/images/, añada aquí su nombre de archivo.
     Solo se cargan las fotos listadas: así no aparecen errores 404 en consola.
     Ejemplo: photos: ['exp-001-organism.jpg', 'archive-01-corridor.jpg'] */
  BS.data.photos = [];

  const PHOTO_FILES = {
    organism: 'exp-001-organism.jpg', void: 'exp-002-void.jpg', subject: 'exp-003-subject-zero.jpg', redsun: 'exp-004-red-sun.jpg',
    'photo-1': 'archive-01-corridor.jpg', 'photo-2': 'archive-02-specimen.jpg', 'photo-3': 'archive-03-surveillance.jpg',
    'photo-4': 'archive-04-sky.jpg', 'photo-5': 'archive-05-lab.jpg', 'photo-6': 'archive-06-crater.jpg',
  };

  /** Asigna la foto real (si existe en la lista) a los .visual dentro de "scope" */
  BS.applyPhotos = (scope = document) => {
    if (!BS.data.photos.length) return;
    BS.$$('.visual', scope).forEach((el) => {
      const key = Object.keys(PHOTO_FILES).find((k) => el.classList.contains(`visual--${k}`));
      if (key && BS.data.photos.includes(PHOTO_FILES[key])) el.style.setProperty('--photo', `url("assets/images/${PHOTO_FILES[key]}")`);
    });
  };
  BS.register('photos', { init: () => BS.applyPhotos() });

  BS.data.findExperiment = (id) => {
    const key = String(id).toUpperCase().replace(/^(EXP-?)?0*/, '');
    const all = BS.data.experiments.concat(BS.data.hiddenExperiment);
    return all.find((e) => e.id.replace(/^EXP-0*/, '') === key) || null;
  };
})();
