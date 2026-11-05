# Prueba Técnica CORMAE — Validación de pagos

## 1. Contexto

Se debe desarrollar una solución en **JavaScript con Node.js** para procesar un archivo Excel llamado:

```text
datos_entrada.xlsx
```

El archivo contiene un lote de **15 beneficiarios** con información de pagos.

El objetivo es procesar automáticamente cada fila, validar sus datos y generar un nuevo archivo llamado:

```text
resultado.xlsx
```

La solución debe demostrar capacidad para trabajar con:

- Datos imperfectos o inconsistentes.
- Archivos Excel (`.xlsx`).
- Validación y normalización de datos.
- JavaScript.
- Automatización de procesos.
- Mensajes de error claros y específicos.

> Esta prueba está relacionada con una vacante de Desarrollador/a Jr. de Automatización, donde se utilizan herramientas como n8n, JavaScript, APIs y procesamiento de archivos.

---

# 2. Objetivo principal

Crear un programa en Node.js que:

1. Lea el archivo `datos_entrada.xlsx`.
2. Procese sus 15 filas de datos.
3. Valide cada registro según las reglas especificadas.
4. Conserve todas las columnas originales.
5. Agregue dos nuevas columnas:
   - `estado`
   - `motivo_error`
6. Genere el archivo final `resultado.xlsx`.
7. Incluya un `README.md` breve con instrucciones de ejecución y una explicación sobre la dificultad principal encontrada.

---

# 3. Tecnologías

Utilizar:

- **Node.js**
- **JavaScript**
- Una librería para manipular archivos `.xlsx`

La opción recomendada es:

- `exceljs`

No agregar dependencias innecesarias.

El proyecto debe mantenerse simple, claro y fácil de ejecutar.

---

# 4. Estructura inicial del proyecto

Se recomienda la siguiente estructura:

```text
prueba-tecnica-cormae/
│
├── input/
│   └── datos_entrada.xlsx
│
├── output/
│   └── resultado.xlsx
│
├── src/
│   ├── index.js
│   ├── validators.js
│   └── helpers.js
│
├── package.json
├── README.md
└── .gitignore
```

La estructura puede simplificarse si mejora la claridad.

No sobrearquitectar el proyecto.

---

# 5. Estructura esperada del Excel

El archivo contiene las siguientes columnas originales:

| Columna | Campo |
|---|---|
| A | Beneficiario |
| B | CLABE |
| C | Importe |
| D | Concepto |

El programa debe conservar todas estas columnas y agregar:

| Nueva columna | Descripción |
|---|---|
| `estado` | `válido` o `inválido` |
| `motivo_error` | Vacío si es válido; descripción específica si es inválido |

El resultado esperado conceptualmente es:

| Beneficiario | CLABE | Importe | Concepto | estado | motivo_error |
|---|---|---|---|---|---|

---

# 6. Regla crítica antes de implementar

## INSPECCIONAR EL ARCHIVO REAL PRIMERO

Antes de implementar la lógica definitiva, inspeccionar cómo la librería utilizada interpreta los valores reales del archivo Excel.

Esto es especialmente importante para las CLABEs.

La captura proporcionada muestra posibles casos como:

- CLABEs almacenadas como texto.
- CLABEs con cero inicial.
- CLABEs posiblemente almacenadas como número.
- Una CLABE mostrada en notación científica.
- Una CLABE con letras.
- Una CLABE con espacios.

El agente debe inspeccionar temporalmente:

- Valor original de la celda.
- Tipo de dato detectado.
- Valor interpretado por la librería.
- Posible formato de la celda.

No asumir que el valor mostrado visualmente en Excel es necesariamente el valor exacto almacenado internamente.

La implementación final debe basarse en el contenido real del archivo.

---

# 7. Reglas de validación

## 7.1 Beneficiario

El beneficiario no puede estar vacío.

Se deben considerar inválidos:

- `null`
- `undefined`
- Una cadena vacía.
- Una cadena que contenga únicamente espacios.

### Ejemplo válido

```text
Pedro Martínez Luna
```

### Ejemplos inválidos

```text

```

```text
"     "
```

### Mensaje recomendado

```text
Beneficiario está vacío
```

---

# 7.2 CLABE

La CLABE debe cumplir las siguientes reglas:

1. Debe contener exactamente **18 dígitos**.
2. Debe contener únicamente caracteres numéricos después de aplicar una normalización segura.

## Normalización permitida

Se pueden eliminar espacios que no formen parte del valor numérico.

Por ejemplo:

```text
072 1800 1526 7530 288
```

Después de eliminar espacios:

```text
072180015267530288
```

Si contiene exactamente 18 dígitos, debe considerarse válida.

## No inventar información

No se deben agregar dígitos arbitrariamente.

Por ejemplo, si después de obtener y normalizar el valor se tienen:

```text
12345678901234567
```

No se debe agregar automáticamente un `0` inicial únicamente para convertirlo en una CLABE de 18 dígitos.

Debe marcarse como inválido:

```text
CLABE tiene 17 dígitos (debe tener 18)
```

Esto es importante porque no se puede garantizar que el dígito faltante sea realmente un cero.

---

## CLABE con caracteres no numéricos

Ejemplo:

```text
0141800152675AB290
```

Debe marcarse como inválida.

Mensaje recomendado:

```text
CLABE contiene caracteres no numéricos
```

Si se considera útil, el mensaje puede incluir información adicional sobre la longitud, pero debe mantenerse claro y específico.

---

## CLABE con longitud incorrecta

Ejemplo:

```text
12345678901234567
```

Mensaje:

```text
CLABE tiene 17 dígitos (debe tener 18)
```

Ejemplo con 19 dígitos:

```text
CLABE tiene 19 dígitos (debe tener 18)
```

---

## CLABE en notación científica

La captura muestra un caso visual similar a:

```text
2.18002E+15
```

Este caso debe analizarse cuidadosamente.

El agente debe:

1. Revisar cómo está almacenada realmente la celda.
2. Determinar si el valor puede recuperarse sin inventar información.
3. Convertirlo correctamente a una representación textual únicamente si la precisión original se conserva.
4. Validar posteriormente los 18 dígitos.

### Restricción importante

Si Excel ya perdió precisión o eliminó información relevante, **no inventar los dígitos faltantes**.

El comportamiento debe documentarse en el código y/o README si este caso resulta ambiguo.

---

# 7.3 Importe

El importe debe cumplir:

1. Ser numérico.
2. Ser mayor que cero.
3. Tener máximo dos decimales.

---

## Importe válido

```text
5000
```

```text
5000.00
```

```text
8750.25
```

---

## Importe inválido: cero o negativo

Ejemplos:

```text
0
```

```text
-3200.00
```

Mensaje recomendado:

```text
Importe debe ser mayor a 0
```

---

## Importe inválido: no numérico

Ejemplo:

```text
abc
```

Mensaje:

```text
Importe no es numérico
```

---

## Importe con más de dos decimales

Ejemplo:

```text
1200.123
```

Mensaje:

```text
Importe tiene más de 2 decimales
```

---

# 8. Validaciones independientes

La lógica debe mantenerse clara.

Se recomienda separar conceptualmente las validaciones:

```text
validarBeneficiario()
validarClabe()
validarImporte()
```

Cada función debe permitir determinar:

- Si el valor es válido.
- El motivo específico del error cuando corresponda.

Evitar una única función demasiado grande con toda la lógica mezclada.

---

# 9. Manejo de múltiples errores

Una misma fila puede contener más de un error.

El programa debe validar todos los campos relevantes.

Por ejemplo:

```text
Beneficiario está vacío; CLABE contiene caracteres no numéricos; Importe debe ser mayor a 0
```

No detener la validación después del primer error.

---

# 10. Determinación del estado

Si una fila no tiene errores:

```text
estado = válido
motivo_error = ""
```

Si tiene uno o más errores:

```text
estado = inválido
motivo_error = "[lista de errores específicos]"
```

Los errores deben separarse de forma clara.

Se recomienda:

```text
; 
```

Ejemplo:

```text
Beneficiario está vacío; Importe debe ser mayor a 0
```

---

# 11. Conservación de los datos originales

El archivo de salida debe conservar:

- Las 15 filas originales.
- Las columnas originales.
- Los valores originales tanto como sea posible.

No modificar silenciosamente los datos de entrada para "corregirlos".

La normalización utilizada para validar no necesariamente debe reemplazar el valor original mostrado en el archivo de salida.

La prioridad es:

> Validar y reportar correctamente, no modificar o inventar datos.

---

# 12. Flujo del programa

El flujo esperado es:

```text
Inicio
  ↓
Leer datos_entrada.xlsx
  ↓
Inspeccionar y obtener cada fila
  ↓
Normalizar valores únicamente para validación
  ↓
Validar beneficiario
  ↓
Validar CLABE
  ↓
Validar importe
  ↓
Recopilar errores
  ↓
Determinar estado
  ↓
Agregar estado y motivo_error
  ↓
Generar resultado.xlsx
  ↓
Finalizar
```

---

# 13. Mensajes de error

Los mensajes deben ser específicos.

## Correcto

```text
Beneficiario está vacío
```

```text
CLABE tiene 17 dígitos (debe tener 18)
```

```text
CLABE contiene caracteres no numéricos
```

```text
Importe debe ser mayor a 0
```

```text
Importe tiene más de 2 decimales
```

## Incorrecto

Evitar mensajes genéricos como:

```text
CLABE inválida
```

```text
Datos incorrectos
```

```text
Error en la fila
```

---

# 14. Generación del archivo resultado.xlsx

El programa debe generar:

```text
output/resultado.xlsx
```

El archivo debe incluir:

```text
Beneficiario
CLABE
Importe
Concepto
estado
motivo_error
```

Debe ser posible abrir el archivo directamente en Microsoft Excel.

No es necesario agregar diseño complejo.

Se puede conservar un formato básico y profesional:

- Encabezados claros.
- Columnas legibles.
- Ajuste razonable de ancho.

La funcionalidad tiene prioridad sobre el diseño.

---

# 15. Verificación final

Antes de considerar terminada la prueba:

## Verificar cantidad de filas

Confirmar que existen:

```text
15 registros procesados
```

## Revisar manualmente cada registro

Confirmar:

- Beneficiario correcto.
- CLABE correctamente interpretada.
- Espacios manejados correctamente.
- Ceros iniciales tratados correctamente.
- Caracteres no numéricos detectados.
- Importes negativos detectados.
- Estado correcto.
- Mensaje específico.

---

# 16. README.md

Crear un README breve.

Debe incluir:

## Nombre del proyecto

```text
Prueba técnica CORMAE — Validación de pagos
```

## Requisitos

Indicar la versión recomendada de Node.js.

## Instalación

Ejemplo:

```bash
npm install
```

## Ejecución

Ejemplo:

```bash
npm start
```

## Resultado

Indicar que el archivo generado estará disponible en:

```text
output/resultado.xlsx
```

---

# 17. Pregunta obligatoria del README

Responder:

> ¿Qué fue lo más difícil del reto y cómo lo resolviste?

La respuesta debe ser honesta y basada en la implementación real.

Una línea de razonamiento recomendada es:

> Lo más desafiante fue manejar valores que Excel puede representar de diferentes formas, especialmente las CLABEs. Algunas pueden almacenarse como texto, números o mostrarse en notación científica. Para resolverlo, primero inspeccioné cómo se interpretaban los valores al leer el archivo y apliqué únicamente normalizaciones seguras, como eliminar espacios, sin inventar o modificar dígitos cuando la información original era ambigua.

No copiar necesariamente este texto de forma literal; ajustarlo según lo que realmente ocurra durante la implementación.

---

# 18. Principios importantes

Durante toda la implementación:

### Sí hacer

- Mantener el código simple.
- Usar funciones pequeñas y claras.
- Validar todos los registros.
- Generar mensajes específicos.
- Manejar datos imperfectos.
- Documentar decisiones importantes.
- Verificar el archivo final manualmente.

### No hacer

- Sobrearquitectar.
- Crear una aplicación web.
- Agregar dependencias innecesarias.
- Inventar datos faltantes.
- Agregar automáticamente ceros sin una justificación segura.
- Detener el procesamiento por un registro inválido.
- Utilizar mensajes genéricos.
- Modificar silenciosamente los datos originales.

---

# 19. Objetivo de calidad

La solución debe transmitir lo siguiente:

> Se puede recibir información imperfecta desde un archivo externo, procesarla automáticamente, normalizar lo que sea seguro, validar cada registro y generar una salida clara y útil.

Esto está directamente relacionado con un puesto de automatización que requiere:

- JavaScript.
- Procesamiento de Excel y CSV.
- Validación de información.
- Pensamiento lógico.
- Automatización de procesos.
- Comunicación clara.

---

# 20. Orden de implementación obligatorio

Seguir este orden:

1. Crear la estructura mínima del proyecto.
2. Instalar la dependencia para trabajar con Excel.
3. Leer el archivo real.
4. Inspeccionar los tipos y valores de las celdas problemáticas.
5. Confirmar cómo se interpretan las CLABEs.
6. Implementar la normalización segura.
7. Implementar las validaciones.
8. Procesar las 15 filas.
9. Generar `resultado.xlsx`.
10. Abrir y revisar manualmente el resultado.
11. Crear el README basado en lo que realmente se encontró.
12. Revisar que la solución sea simple, clara y ejecutable.

---

# Restricción final

No implementar funcionalidades adicionales que no sean necesarias para la prueba.

La prioridad es:

```text
Correctitud
↓
Mensajes específicos
↓
Claridad del código
```

La solución debe ser pequeña, profesional y fácil de entender.