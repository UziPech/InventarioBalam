/**
 * Utilidad para manejar el horario de operación personalizado
 * Horario de operación: 12:00 AM - 11:59 PM (medianoche a medianoche)
 */
class OperacionHorario {
    constructor() {
        this.HORA_INICIO_OPERACION = 0; // 12:00 AM
        this.HORA_FIN_OPERACION = 23; // 11:59 PM
        this.MINUTO_FIN_OPERACION = 59;
        this.SEGUNDO_FIN_OPERACION = 59;
        this.MILISEGUNDO_FIN_OPERACION = 999;
    }

    /**
     * Obtener la fecha de operación actual
     * Si es antes de las 12:00 AM, cuenta como el día anterior
     * Si es después de las 12:00 AM, cuenta como el día actual
     * @returns {Date} Fecha de operación actual
     */
    obtenerFechaOperacionActual() {
        const ahora = new Date();
        const horaActual = ahora.getHours();
        
        // Si es antes de las 12:00 AM, usar el día anterior
        if (horaActual < this.HORA_INICIO_OPERACION) {
            const fechaAnterior = new Date(ahora);
            fechaAnterior.setDate(ahora.getDate() - 1);
            return fechaAnterior;
        }
        
        return ahora;
    }

    /**
     * Obtener el inicio del día de operación (12:00 AM)
     * @param {Date} fecha - Fecha opcional, si no se proporciona usa la actual
     * @returns {Date} Inicio del día de operación
     */
    obtenerInicioDiaOperacion(fecha = null) {
        const fechaOperacion = fecha || this.obtenerFechaOperacionActual();
        const inicio = new Date(fechaOperacion);
        inicio.setHours(this.HORA_INICIO_OPERACION, 0, 0, 0);
        return inicio;
    }

    /**
     * Obtener el fin del día de operación (11:59:59.999 PM)
     * @param {Date} fecha - Fecha opcional, si no se proporciona usa la actual
     * @returns {Date} Fin del día de operación
     */
    obtenerFinDiaOperacion(fecha = null) {
        const fechaOperacion = fecha || this.obtenerFechaOperacionActual();
        const fin = new Date(fechaOperacion);
        fin.setHours(
            this.HORA_FIN_OPERACION,
            this.MINUTO_FIN_OPERACION,
            this.SEGUNDO_FIN_OPERACION,
            this.MILISEGUNDO_FIN_OPERACION
        );
        return fin;
    }

    /**
     * Verificar si una fecha está dentro del día de operación actual
     * @param {Date} fecha - Fecha a verificar
     * @returns {boolean} True si está en el día de operación actual
     */
    esDiaOperacionActual(fecha) {
        const inicio = this.obtenerInicioDiaOperacion();
        const fin = this.obtenerFinDiaOperacion();
        return fecha >= inicio && fecha <= fin;
    }

    /**
     * Obtener el rango de fechas para un día de operación específico
     * @param {Date} fecha - Fecha del día de operación
     * @returns {Object} Objeto con inicio y fin del día de operación
     */
    obtenerRangoDiaOperacion(fecha) {
        return {
            inicio: this.obtenerInicioDiaOperacion(fecha),
            fin: this.obtenerFinDiaOperacion(fecha)
        };
    }

    /**
     * Obtener el rango de fechas para la semana de operación actual
     * @returns {Object} Objeto con inicio y fin de la semana de operación
     */
    obtenerRangoSemanaOperacion() {
        const fechaOperacion = this.obtenerFechaOperacionActual();
        const inicioSemana = new Date(fechaOperacion);
        
        // Ajustar al inicio de la semana (domingo)
        const diaSemana = fechaOperacion.getDay();
        inicioSemana.setDate(fechaOperacion.getDate() - diaSemana);
        inicioSemana.setHours(this.HORA_INICIO_OPERACION, 0, 0, 0);
        
        const finSemana = new Date(inicioSemana);
        finSemana.setDate(inicioSemana.getDate() + 6);
        finSemana.setHours(
            this.HORA_FIN_OPERACION,
            this.MINUTO_FIN_OPERACION,
            this.SEGUNDO_FIN_OPERACION,
            this.MILISEGUNDO_FIN_OPERACION
        );
        
        return { inicio: inicioSemana, fin: finSemana };
    }

    /**
     * Obtener el rango de fechas para el mes de operación actual
     * @returns {Object} Objeto con inicio y fin del mes de operación
     */
    obtenerRangoMesOperacion() {
        const fechaOperacion = this.obtenerFechaOperacionActual();
        const inicioMes = new Date(fechaOperacion.getFullYear(), fechaOperacion.getMonth(), 1);
        inicioMes.setHours(this.HORA_INICIO_OPERACION, 0, 0, 0);
        
        const finMes = new Date(fechaOperacion.getFullYear(), fechaOperacion.getMonth() + 1, 0);
        finMes.setHours(
            this.HORA_FIN_OPERACION,
            this.MINUTO_FIN_OPERACION,
            this.SEGUNDO_FIN_OPERACION,
            this.MILISEGUNDO_FIN_OPERACION
        );
        
        return { inicio: inicioMes, fin: finMes };
    }

    /**
     * Formatear fecha para mostrar en la interfaz
     * @param {Date} fecha - Fecha a formatear
     * @returns {string} Fecha formateada
     */
    formatearFechaOperacion(fecha) {
        return fecha.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Obtener información de debug del horario de operación
     * @returns {Object} Información de debug
     */
    obtenerInfoDebug() {
        const ahora = new Date();
        const fechaOperacion = this.obtenerFechaOperacionActual();
        const rango = this.obtenerRangoDiaOperacion();
        
        return {
            horaActual: ahora.toLocaleTimeString('es-ES'),
            fechaActual: ahora.toLocaleDateString('es-ES'),
            fechaOperacion: fechaOperacion.toLocaleDateString('es-ES'),
            inicioOperacion: rango.inicio.toLocaleString('es-ES'),
            finOperacion: rango.fin.toLocaleString('es-ES'),
            esDiaOperacionActual: this.esDiaOperacionActual(ahora)
        };
    }
}

module.exports = OperacionHorario;
