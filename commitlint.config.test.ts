import { describe, expect, test } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { $ } from "bun";

async function lintCommitMessage(message: string): Promise<number> {
  const directory = await mkdtemp(join(tmpdir(), "commitlint-"));
  const messageFile = join(directory, "COMMIT_EDITMSG");
  const commitlint = join(import.meta.dir, "node_modules/.bin/commitlint");
  const bun = process.execPath;

  try {
    await writeFile(messageFile, `${message}\n`);
    const result = await $`${bun} ${commitlint} --edit ${messageFile}`
      .cwd(import.meta.dir)
      .env({ ...process.env, FORCE_COLOR: "0" })
      .quiet()
      .nothrow();

    return result.exitCode;
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
}

describe("commitlint configuration", () => {
  test("accepts a conventional commit", async () => {
    const exitCode = await lintCommitMessage(
      "feat(tooling): validate commit messages",
    );

    expect(exitCode).toBe(0);
  });

  test("rejects a message without a conventional type", async () => {
    const exitCode = await lintCommitMessage("validate commit messages");

    expect(exitCode).toBe(1);
  });
});
