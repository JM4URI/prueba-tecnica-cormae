// src/validators.js
// Funciones de validación independientes para cada campo del lote.
// Cada validador retorna un objeto { valido: boolean, error: string }.

const { normalizarBeneficiario, normalizarClabe, normalizarImporte, contarDecimales } = require('./helpers');

/**
 * Valida el nombre del beneficiario.
 * Regla: No puede ser nulo, indefinido, vacío ni contener únicamente espacios en blanco.
 * @param {*} value - Valor de la celda.
 * @returns {{ valido: boolean, error: string }}
 */
function validarBeneficiario(value) {
  const normalizado = normalizarBeneficiario(value);
  if (normalizado === '') {
    return { valido: false, error: 'Beneficiario está vacío' };
  }
  return { valido: true, error: '' };
}

/**
 * Valida la cuenta CLABE.
 * Reglas:
 * 1. Debe contener caracteres numéricos una vez removidos los espacios.
 * 2. Debe contar con una longitud exacta de 18 dígitos.
 * No se autocompletan ni modifican dígitos si la longitud no coincide.
 * @param {*} value - Valor de la celda.
 * @returns {{ valido: boolean, error: string }}
 */
function validarClabe(value) {
  const normalizado = normalizarClabe(value);

  if (normalizado === '') {
    return { valido: false, error: 'CLABE está vacía' };
  }

  if (!/^\d+$/.test(normalizado)) {
    return { valido: false, error: 'CLABE contiene caracteres no numéricos' };
  }

  if (normalizado.length !== 18) {
    return {
      valido: false,
      error: `CLABE tiene ${normalizado.length} dígitos (debe tener 18)`,
    };
  }

  return { valido: true, error: '' };
}

/**
 * Valida el importe del pago.
 * Reglas:
 * 1. Debe ser un valor numérico.
 * 2. Debe ser estrictamente mayor a 0.
 * 3. No debe tener más de 2 decimales.
 * @param {*} value - Valor de la celda.
 * @returns {{ valido: boolean, error: string }}
 */
function validarImporte(value) {
  const num = normalizarImporte(value);

  if (num === null) {
    return { valido: false, error: 'Importe no es numérico' };
  }

  if (num <= 0) {
    return { valido: false, error: 'Importe debe ser mayor a 0' };
  }

  if (contarDecimales(value) > 2) {
    return { valido: false, error: 'Importe tiene más de 2 decimales' };
  }

  return { valido: true, error: '' };
}

module.exports = { validarBeneficiario, validarClabe, validarImporte };
