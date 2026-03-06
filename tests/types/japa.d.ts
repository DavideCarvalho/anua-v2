declare module '@japa/runner' {
  interface TestContext {
    /** Browser instance (Playwright). Only available in browser suite. */
    browser?: import('playwright').Browser
    /** Browser context for the current test. Only available in browser suite. */
    browserContext?: import('playwright').BrowserContext
    /** Visit a URL and return the page. Only available in browser suite. */
    visit?: (url: string) => Promise<import('playwright').Page>
    /** Generate URL for a named route. */
    route?: (name: string, params?: Record<string, any>) => string
  }
}
