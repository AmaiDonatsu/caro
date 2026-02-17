/**
 * Myelina Browser — Mini browser para agentes de IA.
 *
 * Usa Tavily Search API para búsquedas y Tavily Extract API
 * para obtener contenido limpio de páginas web.
 */

// ─── Types ───────────────────────────────────────────────────────────

export interface SearchResult {
  id: string;
  title: string;
  resume: string;
  seo: string;
  url: string;
  score: number;
}

export interface PageContent {
  url: string;
  title: string;
  content: string;
  images: string[];
}

export interface TabState {
  id: string;
  resultados: SearchResult[];
  viewPage: PageContent | null;
  historial: PageContent[];
  currentQuery: string;
}

// ─── Tavily API response types ───────────────────────────────────────

interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  raw_content?: string | null;
}

interface TavilySearchResponse {
  query: string;
  results: TavilySearchResult[];
  response_time: string;
}

interface TavilyExtractResult {
  url: string;
  raw_content: string;
  images?: string[];
}

interface TavilyExtractResponse {
  results: TavilyExtractResult[];
  failed_results: { url: string; error: string }[];
  response_time: number;
}

// ─── Constants ───────────────────────────────────────────────────────

const TAVILY_SEARCH_URL = "https://api.tavily.com/search";
const TAVILY_EXTRACT_URL = "https://api.tavily.com/extract";
const MAX_HISTORY = 10;
const MAX_RESULTS = 10;

function getTavilyApiKey(): string {
  const key = process.env.TRAVILY_APIKEY;
  if (!key) {
    throw new Error("[MyelinaBrowser] TRAVILY_APIKEY not found in environment variables");
  }
  return key;
}

// ─── Tab Class ───────────────────────────────────────────────────────

export class Tab {
  public readonly id: string;
  private resultados: SearchResult[] = [];
  private viewPage: PageContent | null = null;
  private historial: PageContent[] = [];
  private currentQuery: string = "";

  constructor(id?: string) {
    this.id = id ?? crypto.randomUUID();
  }

  /**
   * Busca palabras clave usando Tavily Search API.
   * Guarda los resultados en el estado `resultados` de la pestaña.
   */
  async searchbar(keywords: string, page: number = 1): Promise<SearchResult[]> {
    const apiKey = getTavilyApiKey();

    const body = {
      query: keywords,
      search_depth: "basic",
      max_results: MAX_RESULTS,
      include_answer: false,
      include_raw_content: false,
      include_images: false,
    };

    console.log(`[MyelinaBrowser][Tab:${this.id}] Searching: "${keywords}" (page ${page})`);

    const response = await fetch(TAVILY_SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`[MyelinaBrowser] Tavily Search failed (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as TavilySearchResponse;

    // Map Tavily results to our SearchResult format
    this.resultados = data.results.map((r, index) => ({
      id: String((page - 1) * MAX_RESULTS + index + 1),
      title: r.title,
      resume: r.content,
      seo: keywords,
      url: r.url,
      score: r.score,
    }));

    this.currentQuery = keywords;

    console.log(`[MyelinaBrowser][Tab:${this.id}] Found ${this.resultados.length} results`);

    return this.resultados;
  }

  /**
   * Navega a una URL usando Tavily Extract API.
   * El contenido se guarda en `viewPage` y la página anterior va al `historial`.
   */
  async navigate(url: string): Promise<PageContent> {
    const apiKey = getTavilyApiKey();

    console.log(`[MyelinaBrowser][Tab:${this.id}] Navigating to: ${url}`);

    // Push current page to history before navigating
    if (this.viewPage) {
      this.historial.push(this.viewPage);
      // Keep history at max 10 entries
      if (this.historial.length > MAX_HISTORY) {
        this.historial.shift();
      }
    }

    const body = {
      urls: [url],
      extract_depth: "basic",
      include_images: true,
      format: "markdown",
    };

    const response = await fetch(TAVILY_EXTRACT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`[MyelinaBrowser] Tavily Extract failed (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as TavilyExtractResponse;

    if (data.failed_results.length > 0) {
      throw new Error(
        `[MyelinaBrowser] Failed to extract: ${data.failed_results[0].error}`
      );
    }

    if (data.results.length === 0) {
      throw new Error(`[MyelinaBrowser] No content extracted from ${url}`);
    }

    const extracted = data.results[0];

    // Extract title from the first line of markdown content, or use URL
    const titleMatch = extracted.raw_content?.match(/^#\s+(.+)/m);
    const title = titleMatch ? titleMatch[1] : url;

    this.viewPage = {
      url: extracted.url,
      title,
      content: extracted.raw_content || "",
      images: extracted.images ?? [],
    };

    console.log(`[MyelinaBrowser][Tab:${this.id}] Page loaded: "${this.viewPage.title}"`);

    return this.viewPage;
  }

  /**
   * Retrocede al historial. Restaura la página anterior en `viewPage`.
   */
  back(): PageContent | null {
    if (this.historial.length === 0) {
      console.log(`[MyelinaBrowser][Tab:${this.id}] No history to go back to`);
      return null;
    }

    this.viewPage = this.historial.pop()!;
    console.log(`[MyelinaBrowser][Tab:${this.id}] Back to: "${this.viewPage.title}"`);
    return this.viewPage;
  }

  /**
   * Retorna el estado actual de la pestaña.
   */
  getState(): TabState {
    return {
      id: this.id,
      resultados: this.resultados,
      viewPage: this.viewPage,
      historial: this.historial,
      currentQuery: this.currentQuery,
    };
  }

  /**
   * Retorna un resumen compacto de la pestaña (sin contenido completo).
   */
  getSummary(): { id: string; query: string; resultsCount: number; currentPage: string | null; historyLength: number } {
    return {
      id: this.id,
      query: this.currentQuery,
      resultsCount: this.resultados.length,
      currentPage: this.viewPage?.title ?? null,
      historyLength: this.historial.length,
    };
  }
}

// ─── MyelinaBrowser Class ────────────────────────────────────────────

export class MyelinaBrowser {
  private tabs: Map<string, Tab> = new Map();

  /**
   * Crea una nueva pestaña y retorna su ID.
   */
  newTab(): Tab {
    const tab = new Tab();
    this.tabs.set(tab.id, tab);
    console.log(`[MyelinaBrowser] New tab created: ${tab.id}`);
    return tab;
  }

  /**
   * Cierra una pestaña por ID.
   */
  closeTab(tabId: string): boolean {
    const deleted = this.tabs.delete(tabId);
    if (deleted) {
      console.log(`[MyelinaBrowser] Tab closed: ${tabId}`);
    }
    return deleted;
  }

  /**
   * Retorna una pestaña por ID.
   */
  getTab(tabId: string): Tab | undefined {
    return this.tabs.get(tabId);
  }

  /**
   * Lista todos los tabs con resumen.
   */
  listTabs(): { id: string; query: string; resultsCount: number; currentPage: string | null; historyLength: number }[] {
    return Array.from(this.tabs.values()).map((tab) => tab.getSummary());
  }

  /**
   * Número de pestañas abiertas.
   */
  get tabCount(): number {
    return this.tabs.size;
  }
}

// ─── Singleton instance ──────────────────────────────────────────────

export const myelinaBrowser = new MyelinaBrowser();