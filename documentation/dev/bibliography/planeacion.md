# Etapa de Planeación

Este proyecto busca hacer un asistente de IA especializado para automatizar la cadena logística de las importaciones y exportaciones en el comercio internacional.

## 1.0 Features Planeadas

Las features están basadas en mi proyecto final de la universidad cuando estudiaba la carrera de Comercio internacional.

Mi proyecto final consistió en hacer de forma manual todo el proceso para importar un producto, desde la elección del producto, buscar el proovedor, planear la ruta, llenar papeleo, etc.

### 1.1 Pasos de la Cadena Logística con Capacidad de Rectificación **[Tool 2.6]**

El asistente no ejecutará esto linealmente, sino que tratará cada fase como un módulo que puede reiniciar si las condiciones cambian.

---

### Fase A: Selección y Validación Comercial

#### 1.1.1 Búsqueda y Filtrado de Proveedores

- **1.1.1.1** Buscar los mejores proveedores del producto solicitado **[Tool 2.1]**.
- **1.1.1.2** Comparar precios y condiciones iniciales.
- **1.1.1.3** Hacer un Top Descendente de candidatos (Candidato A, B, C...).
- **1.1.1.4** Contactar escalonadamente **[Tool 2.2, 2.3, 2.4]**.
  > [!NOTE]
  > Se contacta al Candidato A. Si no hay respuesta en X tiempo, se pasa al B.

#### 1.1.2 Inteligencia Logística Preliminar (Pre-Validación)

- **1.1.2.1** Analizar restricciones del Usuario (Presupuesto, tiempos, ubicación).
- **1.1.2.2** Buscar situación fiscal/legal de origen (país del proveedor) y destino **[Tool 2.1]**.

#### 1.1.3 Negociación y [Nodo de Decisión: Incoterms]

- **1.1.3.1** Cotizar formalmente con el proveedor activo.
- **1.1.3.2** Evaluación de Incoterms: El agente analiza qué responsabilidad logística implica la oferta del proveedor.
  > [!TIP]
  > **Ejemplo:** El proveedor exige Ex Works (recoger en fábrica), pero el usuario necesita entrega en frontera.
- **1.1.3.3 [Bucle de Rectificación 1]: Viabilidad Comercial**
  - Si el Incoterm es desfavorable: El agente intenta re-negociar para cambiar el término (ej. pasar de EXW a FCA).
  - Si el proveedor es inflexible: El agente calcula el costo estimado de asumir esa logística extra.
  - **Acción de Retroceso:** Si `Costo Logístico Extra + Precio Producto > Presupuesto`, el agente descarta al proveedor actual y regresa automáticamente al paso **1.1.1.4** para contactar al siguiente candidato del Top.
- **1.1.3.4** Presentar resumen al usuario solo cuando la viabilidad esté confirmada y pedir aprobación inicial.

---

### Fase B: Ingeniería Logística y Adaptación

#### 1.1.5 Planeación de Ruta Dinámica

- **1.1.5.1** Definir puntos exactos de transferencia de responsabilidad (basado en el Incoterm acordado en **1.1.3**).
- **1.1.5.2** Generación de Escenarios **[Tool 2.5]**: El agente crea Rutas Primarias y Rutas Alternativas (Plan B y C).
  - **Ruta A:** Marítima (más lenta, barata).
  - **Ruta B:** Terrestre/Aérea (rápida, cara).

#### 1.1.6 Negociación Logística y [Nodo de Decisión: Transporte]

- **1.1.6.1** Contactar transportistas para la Ruta Primaria.
- **1.1.6.2 [Bucle de Rectificación 2]: Viabilidad Operativa**
  - **Escenario:** El transportista informa que la ruta es imposible (ej. carreteras bloqueadas, no entran a la zona del proveedor).
  - **Acción de Improvisación:** El agente activa inmediatamente la Ruta Alternativa (definida en **1.1.5.2**) y contacta nuevos transportistas.
  - **Acción de Retroceso Crítico:** Si todas las rutas son inviables o excesivamente caras con el proveedor actual, el agente regresa al paso **1.1.3** para renegociar el Incoterm (pedir que el proveedor acerque la mercancía a un punto más seguro) o incluso al **1.1.1.4** (cambiar de proveedor).

---

### Fase C: Consolidación y Ejecución

#### 1.1.7 Consolidación del Plan

- **1.1.7.1** Integrar Proveedor + Incoterm + Ruta Validada + Transportista Confirmado en el documento maestro **[Tool 2.6]**.
- **1.1.7.2** Enviar informe final "A prueba de fallos" al usuario y esperar aprobación final.

---

## 2.0 Tools Internas

| ID      | Herramienta           | Descripción                                        |
| :------ | :-------------------- | :------------------------------------------------- |
| **2.1** | Búsqueda y Navegación | Búsqueda y navegación web profunda.                |
| **2.2** | Email                 | Mensajería vía Correo Electrónico.                 |
| **2.3** | SMS                   | Mensajería vía SMS.                                |
| **2.4** | Llamadas              | Llamadas telefónicas automatizadas.                |
| **2.5** | Rutas                 | Constructor y optimizador de rutas logísticas.     |
| **2.6** | Documentación         | Crear y llenar documentos maestros de seguimiento. |

## 3.0 Busqueda y Navegación.

### 3.1 Resumen Arch de Busqueda y navegación.

La Tool tiene como objetivo ser una interfaz del motor de búsqueda, mostrando los datos estructurados al agente como si se los mostrara a una persona, pero optimizada para AI.

### 3.2 Componentes

#### 3.2.1 entrada de busqueda.

Entrada de búsqueda directa al motor de búsqueda.

#### 3.2.2 Pantalla de resultados.

Resultados de las búsquedas estructurado e interactuable para profundizar en los resultados.

- 3.2.2.1 **Estructura de los resultados (a modo de fichero)**

```yaml
result:
  - id: "1"
  - title: "Titulo del resultado"
  - resume: "Resumen del resultado"
  - seo: "palabras clave"
  - url: "http://result.com"

result:
  - id: "2"
  - title: "Titulo del resultado"
  - resume: "Resumen del resultado"
  - seo: "palabras clave"
  - url: "http://result.com"
```

- 3.2.2.2 **al dar "click" en un resultado**

```json
{
  {
    "id":"123",
    "component": "text",
    "content": ""
  },

  {
    "id": "adfw",
    "component": "route",
    "to": "http://route",
    "method": "GET",
    "params": {
      "id": "123"
    }
  },
  {
    "id": "adc",
    "component": "component",
    structure:[
      {
        "id": "qwef",
        "component": "text",
        "content": ""
      },
      {
        "id": "qwef",
        "component": "text",
        "content": ""
      }
    ]
  }
}
```

- 3.2.2.3 [Documentación del Navegador](myelina-browser.md)
