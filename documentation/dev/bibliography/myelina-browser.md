# Myelina Browser

Myelina Browser es una herramienta que permite a los agentes de IA navegar por la web y obtener información de manera estructurada.

## Lógica

El navegador es una clase dentro de [myelina-browser](../../../src/api/logic/tools/myelina-browser.ts)

myelina browser es un managger de sesiones, este manager tiene un estado global para guardar el estado de sus pestañas.

cada pestaña tiene también su propio estado.

la pestañas tienen una función llamada searchbar, esta sirve para buscar palabras clave y links directos, espera recibir un str (palabras clave, enunciado o link directo) y un int (paginación)

cuando el agente busca palabras clabe y su paginación (ej: searchbar(keywords="micro controladores estadounidenses", page=1)) el browser hace un llamado a una api de busqueda y los resultados los guarda como se muestrra en [planeación](planeacion.md) sección **3.2.2.1** los resultados se guardan dentro del estado **resultados** de la pestaña.

la pestaña tiene una función llamada **navigate** que sirve para navegar a una página mediante url.

cuando se abre una de las páginas con navigate, el contenido se guarda en el estado **viewPage** de la pestaña. y su contenido se actualiza según el contendio de la página.

la pestaña tiene un estado **historial** que guarda hasta 10 paginas anteriores para poder hacer back.

## APIs Utilizadas

### Tavily Search API — `searchbar()`

- **Endpoint:** `POST https://api.tavily.com/search`
- **Auth:** Bearer token con `TRAVILY_APIKEY`
- **Parámetros:** `query`, `search_depth: "basic"`, `max_results: 10`
- **Mapeo:** Los resultados de Tavily se convierten a la estructura `SearchResult`:
  ```yaml
  result:
    - id: "1"
    - title: "Titulo del resultado"
    - resume: "Resumen del resultado"
    - seo: "palabras clave originales"
    - url: "http://result.com"
    - score: 0.81
  ```

### Tavily Extract API — `navigate()`

- **Endpoint:** `POST https://api.tavily.com/extract`
- **Auth:** Bearer token con `TRAVILY_APIKEY`
- **Parámetros:** `urls`, `extract_depth: "basic"`, `format: "markdown"`, `include_images: true`
- **Resultado:** Contenido en markdown guardado en `viewPage`

## Arquitectura

```
MyelinaBrowser (singleton)
├── Tab 1
│   ├── resultados: SearchResult[]
│   ├── viewPage: PageContent | null
│   ├── historial: PageContent[] (max 10)
│   └── currentQuery: string
├── Tab 2
│   └── ...
└── Tab N
```

## MCP Tools Registradas

| Tool                | Parámetros                   | Descripción               |
| ------------------- | ---------------------------- | ------------------------- |
| `browser_new_tab`   | —                            | Crea una nueva pestaña    |
| `browser_close_tab` | `tabId`                      | Cierra una pestaña        |
| `browser_list_tabs` | —                            | Lista pestañas abiertas   |
| `browser_search`    | `tabId`, `keywords`, `page?` | Busca en la web           |
| `browser_navigate`  | `tabId`, `url`               | Navega y extrae contenido |
| `browser_back`      | `tabId`                      | Retrocede en el historial |

## Flujo de Uso del Agente

1. El agente llama `browser_new_tab` → recibe un `tabId`
2. Llama `browser_search` con keywords → recibe resultados estructurados
3. Elige un resultado y llama `browser_navigate` con su URL → recibe el contenido de la página en markdown
4. Si necesita ver la página anterior → `browser_back`
5. Cuando termina → `browser_close_tab`
