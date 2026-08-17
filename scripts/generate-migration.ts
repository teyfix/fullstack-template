import { type GenerateOptions, generate } from "drizzle-kit/cli";

export type GenerateMigration = (
  options: GenerateOptions,
) => ReturnType<typeof generate>;

export function parseMigrationName(value: string | undefined): string {
  const name = value?.trim();
  if (name === undefined || name.length === 0) {
    throw new Error("Provide a migration name, for example: initial");
  }
  if (!/^[a-z0-9]+(?:[_-][a-z0-9]+)*$/.test(name)) {
    throw new Error(
      "Migration names use lowercase letters, numbers, underscores, or hyphens",
    );
  }
  return name;
}

export async function generateNamedMigration(
  name: string,
  generateMigration: GenerateMigration = generate,
) {
  const result = await generateMigration({
    config: "./drizzle.config.ts",
    name: parseMigrationName(name),
  });

  if (result.status === "error") {
    throw new Error(`Drizzle Kit failed: ${JSON.stringify(result.error)}`);
  }
  if (result.status === "missing_hints") {
    throw new Error(
      `Drizzle Kit needs explicit rename/data-loss hints: ${JSON.stringify(result.unresolved)}`,
    );
  }

  return result;
}

if (import.meta.main) {
  const [name, ...unexpected] = Bun.argv.slice(2);
  if (unexpected.length > 0) {
    throw new Error("Expected exactly one migration name");
  }
  await generateNamedMigration(parseMigrationName(name));
}
