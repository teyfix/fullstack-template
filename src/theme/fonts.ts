/** Font stacks stay local so the template has no runtime font dependency. */
export const fonts = {
  mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  sans: "Inter, ui-sans-serif, system-ui, sans-serif",
  serif: "Newsreader, ui-serif, Georgia, Cambria, serif",
} as const;
