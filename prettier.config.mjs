const sortJSON = { jsonRecursiveSort: true };

const compactMarkdownTable = { tableLayout: "compact" };

const sql = {
  dataTypeCase: "upper",
  database: "postgresql",
  denseOperators: false,
  expressionWidth: 140,
  formatter: "sql-formatter",
  functionCase: "lower",
  identifierCase: "preserve",
  indentStyle: "standard",
  keywordCase: "upper",
  language: "postgresql",
  linesBetweenQueries: 1,
  logicalOperatorNewline: "before",
  newlineBeforeSemicolon: false,
};

export default {
  ...sql,
  ...sortJSON,
  ...compactMarkdownTable,
  embeddedLanguageFormatting: "off",
  objectWrap: "collapse",
  plugins: [
    "prettier-plugin-embed",
    "prettier-plugin-compact-markdown-table",
    "prettier-plugin-packagejson",
    "prettier-plugin-sort-json",
    "prettier-plugin-sh",
    "prettier-plugin-sql",
  ],
  printWidth: 80,
  overrides: [
    {
      files: "*.yaml",
      options: { printWidth: 140 },
    },
  ],
};
