/**
 * Minimal shim for the `framer` runtime, enough to run vendored Framer
 * community components outside the Framer editor. Everything the components
 * import from "framer" resolves here.
 *
 *  - addPropertyControls: editor-only metadata; no-op at runtime.
 *  - ControlType: an enum object; components only read its members as tags.
 *  - useIsStaticRenderer: false so WebGL / effects actually run in the browser.
 *  - RenderTarget: report "preview" (live) so components render their real UI,
 *    not the editor-canvas placeholder.
 */

export function addPropertyControls(): void {
  /* editor-only; intentionally empty (extra call args are ignored) */
}

// Components read ControlType.Enum / .Number / .Boolean / .ResponsiveImage etc.
// as opaque tags, so a Proxy that returns the key name for any access is enough.
export const ControlType: Record<string, string> = new Proxy(
  {},
  { get: (_t, key) => String(key) }
) as Record<string, string>;

export function useIsStaticRenderer(): boolean {
  return false;
}

const CANVAS = "CANVAS";
export const RenderTarget = {
  canvas: CANVAS,
  export: "EXPORT",
  preview: "PREVIEW",
  thumbnail: "THUMBNAIL",
  current(): string {
    return "PREVIEW";
  },
} as const;
