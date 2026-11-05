// src/helpers.js
// Funciones de utilidad y normalización segura.
// La normalización se utiliza exclusivamente para evaluar validaciones y no modifica los datos exportados.

/**
 * Normaliza una CLABE eliminando espacios en blanco.
 * Convierte el valor a cadena preservando los caracteres existentes.
 * No agrega ni asume dígitos faltantes.
 * @param {*} value - Valor de la celda.
 * @returns {string} - Cadena sin espacios.
 */
function normalizarClabe(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\s/g, '');
}

/**
 * Normaliza el nombre del beneficiario eliminando espacios en los extremos.
 * Evalúa nulos y no definidos previamente para evitar conversiones indebidas.
 * @param {*} value - Valor de la celda.
 * @returns {string} - Cadena limpia.
 */
function normalizarBeneficiario(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

/**
 * Convierte el importe a número para validaciones aritméticas.
 * @param {*} value - Valor de la celda.
 * @returns {number|null} - Número parseado o null si no es numérico.
 */
function normalizarImporte(value) {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  if (isNaN(num)) return null;
  return num;
}

/**
 * Cuenta la cantidad de decimales de un valor a partir de su representación textual.
 * Evita imprecisiones asociadas a métodos de coma flotante.
 * @param {*} value - Valor numérico o textual.
 * @returns {number} - Cantidad de dígitos decimales.
 */
function contarDecimales(value) {
  const str = String(value);
  const partes = str.split('.');
  if (partes.length < 2) return 0;
  return partes[1].length;
}

module.exports = { normalizarClabe, normalizarBeneficiario, normalizarImporte, contarDecimales };
