// src/index.js
// Punto de entrada principal: lee, valida y genera resultado.xlsx

const ExcelJS = require('exceljs');
const path = require('path');
const { validarBeneficiario, validarClabe, validarImporte } = require('./validators');

const INPUT_FILE  = path.join(__dirname, '..', 'input',  'datos_entrada.xlsx');
const OUTPUT_FILE = path.join(__dirname, '..', 'output', 'resultado.xlsx');

// Colores para la columna "estado"
const COLOR_VALIDO   = { argb: 'FFD6F5D3' }; // verde suave
const COLOR_INVALIDO = { argb: 'FFFFD6D6' }; // rojo suave
const COLOR_HEADER   = { argb: 'FF2F4F7F' }; // azul oscuro

async function main() {
  // ── Leer archivo de entrada ────────────────────────────────────────────────
  const workbookIn = new ExcelJS.Workbook();
  await workbookIn.xlsx.readFile(INPUT_FILE);
  const sheetIn = workbookIn.worksheets[0];

  // ── Preparar libro de salida ───────────────────────────────────────────────
  const workbookOut = new ExcelJS.Workbook();
  const sheetOut = workbookOut.addWorksheet('Resultado');

  // Definir columnas con ancho fijo y clave para acceso
  sheetOut.columns = [
    { header: 'Beneficiario', key: 'beneficiario', width: 28 },
    { header: 'CLABE',        key: 'clabe',        width: 26 },
    { header: 'Importe',      key: 'importe',      width: 14 },
    { header: 'Concepto',     key: 'concepto',     width: 24 },
    { header: 'estado',       key: 'estado',       width: 11 },
    { header: 'motivo_error', key: 'motivo',       width: 65 },
  ];

  // Estilo del encabezado
  const headerRow = sheetOut.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font       = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill       = { type: 'pattern', pattern: 'solid', fgColor: COLOR_HEADER };
    cell.alignment  = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      bottom: { style: 'medium', color: { argb: 'FF1A3A5C' } },
    };
  });
  headerRow.height = 20;
  headerRow.commit();

  // ── Procesar filas ─────────────────────────────────────────────────────────
  let totalProcesados = 0;

  sheetIn.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // saltar encabezado original

    // Valores crudos tal como los entrega exceljs
    const beneficiario = row.getCell(1).value;
    const clabe        = row.getCell(2).value;
    const importe      = row.getCell(3).value;
    const concepto     = row.getCell(4).value;

    // Validaciones independientes — se acumulan TODOS los errores de la fila
    const errores = [];

    const resBeneficiario = validarBeneficiario(beneficiario);
    if (!resBeneficiario.valido) errores.push(resBeneficiario.error);

    const resClabe = validarClabe(clabe);
    if (!resClabe.valido) errores.push(resClabe.error);

    const resImporte = validarImporte(importe);
    if (!resImporte.valido) errores.push(resImporte.error);

    const estado      = errores.length === 0 ? 'válido' : 'inválido';
    const motivoError = errores.join('; ');
    const esValido    = estado === 'válido';

    // ── Escribir fila de salida ──────────────────────────────────────────────
    // Se conservan los valores ORIGINALES del archivo de entrada sin modificar.
    // La normalización aplicada durante la validación no reemplaza los datos exportados.
    const dataRow = sheetOut.addRow({
      beneficiario,
      clabe,
      importe,
      concepto,
      estado,
      motivo: motivoError,
    });

    // Forzar celda CLABE como texto (@) para que Excel no convierta a número
    // ni muestre notación científica al abrir el archivo.
    const clabeCell = dataRow.getCell('clabe');
    clabeCell.numFmt = '@';
    clabeCell.value  = clabe !== null && clabe !== undefined ? String(clabe) : '';

    // Alineación y color de fila según estado
    const colorFondo = esValido ? COLOR_VALIDO : COLOR_INVALIDO;
    const colEstado  = dataRow.getCell('estado');

    colEstado.fill      = { type: 'pattern', pattern: 'solid', fgColor: colorFondo };
    colEstado.font      = { bold: true, color: { argb: esValido ? 'FF276221' : 'FF8B0000' } };
    colEstado.alignment = { horizontal: 'center' };

    // Alinear importe a la derecha
    dataRow.getCell('importe').alignment = { horizontal: 'right' };

    // Ajustar alto de fila si el motivo de error es largo
    dataRow.height = motivoError.length > 60 ? 30 : 16;

    totalProcesados++;
  });

  // Congelar fila de encabezado para navegación más cómoda en Excel
  sheetOut.views = [{ state: 'frozen', ySplit: 1 }];

  // ── Guardar archivo de salida ──────────────────────────────────────────────
  await workbookOut.xlsx.writeFile(OUTPUT_FILE);

  console.log(`\nProcesamiento completado.`);
  console.log(`Registros procesados : ${totalProcesados}`);
  console.log(`Archivo generado en  : ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error('Error durante el procesamiento:', err.message);
  process.exit(1);
});
