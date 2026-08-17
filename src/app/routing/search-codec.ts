import { parse, stringify } from "qs";

export type RouterSearch = Record<string, unknown>;

const parseOptions = {
  allowDots: true,
  comma: true,
  ignoreQueryPrefix: true,
} as const;

const stringifyOptions = {
  allowDots: true,
  arrayFormat: "comma",
  encodeValuesOnly: true,
} as const;

/** Decodes the public dotted/comma URL convention before route validation. */
export function parseRouterSearch(search: string): RouterSearch {
  return parse(search, parseOptions);
}

/** Encodes TanStack search state using the public dotted/comma convention. */
export function stringifyRouterSearch(search: RouterSearch): string {
  const encoded = stringify(search, stringifyOptions);
  return encoded.length === 0 ? "" : `?${encoded}`;
}
