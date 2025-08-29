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
  const nowLocal = new Date(nowUtc.toLocaleString("en-US", {timeZone: tz}));

  // 2) Construir inicio local del día de operación
  let localStart = new Date(nowLocal);
  localStart.setHours(startHour, 0, 0, 0);

  // Si aún no hemos llegado a la hora de inicio, el día vigente empezó ayer
  if (nowLocal < localStart) {
    localStart.setDate(localStart.getDate() - 1);
  }

  // 3) Fin local: siguiente inicio (rango semiabierto [inicio, fin) )
  const localEnd = new Date(localStart);
  localEnd.setDate(localEnd.getDate() + 1);

  // 4) Convertir ambos a UTC para guardar/consultar
  const startUtc = new Date(localStart.toLocaleString("en-US", {timeZone: "UTC"}));
  const endUtc = new Date(localEnd.toLocaleString("en-US", {timeZone: "UTC"}));

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
  const nowLocal = new Date(nowUtc.toLocaleString("en-US", {timeZone: tz}));
  let nextLocal = new Date(nowLocal);
  nextLocal.setHours(startHour, 0, 0, 0);
  
  if (nowLocal >= nextLocal) {
    nextLocal.setDate(nextLocal.getDate() + 1);
  }

  const nextUtc = new Date(nextLocal.toLocaleString("en-US", {timeZone: "UTC"}));
  const msLeft = nextUtc.getTime() - nowUtc.getTime();

  const horas = Math.floor(msLeft / 3_600_000);
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

/**
 * Filtrar pedidos por día de operación
 * @param {Array} pedidos - Array de pedidos
 * @param {Date} nowUtc - Fecha UTC actual (opcional)
 * @param {string} tz - Zona horaria (opcional)
 * @param {number} startHour - Hora de inicio del día (opcional)
 * @returns {Array} Pedidos del día de operación actual
 */
function filtrarPedidosDiaOperacion(pedidos, nowUtc = new Date(), tz = TZ, startHour = START_HOUR) {
  const { startUtc, endUtc } = rangoDiaOperacion(nowUtc, tz, startHour);
  return pedidos.filter(pedido => {
    const fechaPedido = new Date(pedido.fecha);
    return fechaPedido >= startUtc && fechaPedido < endUtc;
  });
}

/**
 * Obtener estadísticas de pedidos del día de operación
 * @param {Array} pedidos - Array de pedidos
 * @param {Date} nowUtc - Fecha UTC actual (opcional)
 * @param {string} tz - Zona horaria (opcional)
 * @param {number} startHour - Hora de inicio del día (opcional)
 * @returns {Object} Estadísticas del día de operación
 */
function obtenerEstadisticasDiaOperacion(pedidos, nowUtc = new Date(), tz = TZ, startHour = START_HOUR) {
  const pedidosDiaOperacion = filtrarPedidosDiaOperacion(pedidos, nowUtc, tz, startHour);
  const ventasDiaOperacion = pedidosDiaOperacion.reduce((sum, pedido) => sum + pedido.total, 0);
  const pedidosPendientes = pedidosDiaOperacion.filter(pedido => pedido.estado === 'pendiente');
  
  return {
    totalPedidos: pedidosDiaOperacion.length,
    ventas: ventasDiaOperacion,
    pendientes: pedidosPendientes.length,
    infoHorario: obtenerInfoDebug(nowUtc, tz, startHour)
  };
}

// Exportar para uso global
window.TimeUtils = { 
  rangoDiaOperacion, 
  proximoReinicio, 
  fmtLocal, 
  esDiaOperacionActual,
  obtenerInfoDebug,
  filtrarPedidosDiaOperacion,
  obtenerEstadisticasDiaOperacion,
  TZ, 
  START_HOUR 
};
