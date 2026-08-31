export {};

declare global {
  interface Window {
    jotformEmbedHandler?: (iframeSelector: string, baseUrl: string) => void;
  }
}
