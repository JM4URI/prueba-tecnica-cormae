# Prueba técnica CORMAE — Validación de pagos

Programa en Node.js que lee un archivo Excel con datos de beneficiarios, valida cada registro según reglas definidas y genera un nuevo archivo con el resultado de la validación.

---

## Requisitos

- **Node.js** v18 o superior (desarrollado y probado con v24.13.0)
- **npm** v8 o superior
- **Git**

---

## Instalación y preparación

1. **Clonar el repositorio:**

```bash
git clone https://github.com/JM4URI/prueba-tecnica-cormae.git
```

2. **Acceder al directorio del proyecto:**

```bash
cd prueba-tecnica-cormae
```

3. **Instalar dependencias:**

```bash
npm install
```

---

## Ejecución

```bash
npm start
```

El programa leerá automáticamente el archivo `input/datos_entrada.xlsx` y generará el resultado en `output/resultado.xlsx`.

---

## Estructura del proyecto

```
prueba-tecnica-cormae/
│
├── input/
│   └── datos_entrada.xlsx      ← Archivo de entrada (15 beneficiarios)
│
├── output/
│   └── resultado.xlsx          ← Archivo generado tras la ejecución
│
├── src/
│   ├── index.js                ← Punto de entrada: lee, procesa y genera el Excel
│   ├── validators.js           ← Validaciones independientes por campo
│   └── helpers.js              ← Normalización segura de valores
│
├── package.json
└── README.md
```

---

## Resultado

El archivo `output/resultado.xlsx` contiene las mismas columnas originales del archivo de entrada más dos columnas adicionales:

| Columna        | Descripción                                                                                |
| -------------- | ------------------------------------------------------------------------------------------ |
| `estado`       | `válido` si el registro pasó todas las validaciones, `inválido` si tiene al menos un error |
| `motivo_error` | Vacío si es válido; descripción específica del error o errores separados por `; `          |

---

## Reglas de validación aplicadas

| Campo        | Regla                                                                                         |
| ------------ | --------------------------------------------------------------------------------------------- |
| Beneficiario | No puede estar vacío, ser `null` o contener solo espacios                                     |
| CLABE        | Exactamente 18 dígitos numéricos (se eliminan espacios intermedios como normalización segura) |
| Importe      | Numérico, mayor a 0, con máximo 2 decimales                                                   |

---

## ¿Qué fue lo más difícil del reto y cómo lo resolviste?

Lo más desafiante fue manejar correctamente las CLABEs, que en el archivo Excel están almacenadas de formas distintas según cómo fueron capturadas originalmente.

El caso más crítico fue una CLABE que Excel guardó internamente como un número entero en lugar de texto. Al leerla con `exceljs`, su valor llegaba con `typeof === 'number'`. Visualmente en Excel podría haberse mostrado en notación científica (`2.18002E+15`), y al convertirla con `String()` el resultado tenía solo 16 dígitos en vez de 18, porque los ceros iniciales se habían perdido al momento en que alguien la escribió en la celda sin formato de texto.

La decisión fue no inventar los dígitos faltantes. No es posible saber con certeza qué dígitos se perdieron, así que el registro se marcó como inválido con el mensaje `CLABE tiene 16 dígitos (debe tener 18)`, lo que es honesto y preciso.

Otros casos manejados:

- **CLABE con espacios intermedios** (`072 1800 1526 7530 288`): se eliminan los espacios como normalización segura y, si resultan 18 dígitos numéricos, se considera válida.
- **CLABE con letras** (`0141800152675AB290`): detectada con `/^\d+$/` y marcada con `CLABE contiene caracteres no numéricos`.
- **Beneficiario `null`**: el chequeo de `null` se hace de forma explícita antes de llamar `String()`, ya que `String(null)` produce `"null"` (4 caracteres) y pasaría incorrectamente la validación de vacío.

La solución priorizó validar y reportar con precisión sin modificar ni inventar datos.
