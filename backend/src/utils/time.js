const { zonedTimeToUtc, utcToZonedTime } = require('date-fns-tz');
const { addDays, set } = require('date-fns');

// Config del negocio
const TZ = 'America/Merida';             // Zona horaria de México (Mérida)
const START_HOUR = 0;                    // 0 = 00:00 (medianoche)

/**
 * Obtener el rango del día de operación
 * @param {Date} nowUtc - Fecha UTC actual (opcional)
 * @param {string} tz - Zona horaria (opcional)
 * @param {number} startHour - Hora de inicio del día (opcional)
 * @returns {Object} Rango del día de operación
 */
function rangoDiaOperacion(nowUtc = new Date(), tz = TZ, startHour = START_HOUR) {
  // 1) Convertir "ahora" a hora local del negocio
  const nowLocal = utcToZonedTime(nowUtc, tz);

  // 2) Construir inicio local del día de operación
  let localStart = set(nowLocal, { hours: startHour, minutes: 0, seconds: 0, milliseconds: 0 });

  // Si aún no hemos llegado a la hora de inicio, el día vigente empezó ayer
  if (nowLocal < localStart) {
    localStart = addDays(localStart, -1);
  }

  // 3) Fin local: siguiente inicio (rango semiabierto [inicio, fin) )
  const localEnd = addDays(localStart, 1);

  // 4) Convertir ambos a UTC para guardar/consultar en Mongo
  const startUtc = zonedTimeToUtc(localStart, tz);
  const endUtc   = zonedTimeToUtc(localEnd, tz);

  return { startUtc, endUtc, localStart, localEnd, tz };
}

/**
 * Obtener información del próximo reinicio
 * @param {Date} nowUtc - Fecha UTC actual (opcional)
 * @param {string} tz - Zona horaria (opcional)
 * @param {number} startHour - Hora de inicio del día (opcional)
 * @returns {Object} Información del próximo reinicio
 */
function proximoReinicio(nowUtc = new Date(), tz = TZ, startHour = START_HOUR) {
  const nowLocal = utcToZonedTime(nowUtc, tz);
  let nextLocal  = set(nowLocal, { hours: startHour, minutes: 0, seconds: 0, milliseconds: 0 });
  if (nowLocal >= nextLocal) nextLocal = addDays(nextLocal, 1);       // siguiente inicio

  const nextUtc = zonedTimeToUtc(nextLocal, tz);
  const msLeft  = +nextUtc - +nowUtc;

  const horas   = Math.floor(msLeft / 3_600_000);
  const minutos = Math.floor((msLeft % 3_600_000) / 60_000);

  return { nextUtc, nextLocal, msLeft, horas, minutos, tz };
}

/**
 * Formatear fecha local
 * @param {Date} dateUtc - Fecha UTC
 * @param {string} tz - Zona horaria (opcional)
 * @param {Object} opts - Opciones de formato (opcional)
 * @returns {string} Fecha formateada
 */
function fmtLocal(dateUtc, tz = TZ, opts = {}) {
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: tz,
    ...opts
  }).format(dateUtc);
}

/**
 * Verificar si una fecha está en el día de operación actual
 * @param {Date} fechaUtc - Fecha UTC a verificar
 * @param {Date} nowUtc - Fecha UTC actual (opcional)
 * @param {string} tz - Zona horaria (opcional)
 * @param {number} startHour - Hora de inicio del día (opcional)
 * @returns {boolean} True si está en el día de operación actual
 */
function esDiaOperacionActual(fechaUtc, nowUtc = new Date(), tz = TZ, startHour = START_HOUR) {
  const { startUtc, endUtc } = rangoDiaOperacion(nowUtc, tz, startHour);
  return fechaUtc >= startUtc && fechaUtc < endUtc;
}

/**
 * Obtener información de debug del horario de operación
 * @param {Date} nowUtc - Fecha UTC actual (opcional)
 * @param {string} tz - Zona horaria (opcional)
 * @param {number} startHour - Hora de inicio del día (opcional)
 * @returns {Object} Información de debug
 */
function obtenerInfoDebug(nowUtc = new Date(), tz = TZ, startHour = START_HOUR) {
  const { startUtc, endUtc, localStart, localEnd } = rangoDiaOperacion(nowUtc, tz, startHour);
  const prx = proximoReinicio(nowUtc, tz, startHour);
  
  return {
    zonaHoraria: tz,
    horaInicio: startHour,
    fechaActual: {
      utc: nowUtc.toISOString(),
      local: fmtLocal(nowUtc, tz)
    },
    rangoOperacion: {
      inicioUtc: startUtc.toISOString(),
      finUtc: endUtc.toISOString(),
      inicioLocal: fmtLocal(startUtc, tz),
      finLocal: fmtLocal(endUtc, tz)
    },
    proximoReinicio: {
      utc: prx.nextUtc.toISOString(),
      local: fmtLocal(prx.nextUtc, tz, { dateStyle: 'full', timeStyle: 'short' }),
      restante: { horas: prx.horas, minutos: prx.minutos, ms: prx.msLeft }
    }
  };
}

module.exports = { 
  rangoDiaOperacion, 
  proximoReinicio, 
  fmtLocal, 
  esDiaOperacionActual,
  obtenerInfoDebug,
  TZ, 
  START_HOUR 
};
