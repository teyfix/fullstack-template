import { watch } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import {
  defaultAppMessagesDirectory,
  defaultFeaturesDirectory,
} from "./sync-features";

export type FeatureWatchEvent = Readonly<{
  filename: string | null;
}>;

const syncScript = new URL("./sync-features.ts", import.meta.url);

/** Runs sync in a fresh module graph so edited TypeScript manifests reload. */
export async function runFeatureSync(): Promise<void> {
  const child = Bun.spawn([process.execPath, fileURLToPath(syncScript)], {
    cwd: fileURLToPath(new URL("../", import.meta.url)),
    stderr: "inherit",
    stdout: "inherit",
  });
  const exitCode = await child.exited;
  if (exitCode !== 0) {
    throw new Error(`Feature sync exited with status ${exitCode}`);
  }
}

/** Serializes rebuilds so generated artifacts always represent one full scan. */
export async function syncFeaturesOnChanges(
  events: AsyncIterable<FeatureWatchEvent>,
  sync: () => Promise<unknown> = runFeatureSync,
): Promise<void> {
  for await (const _event of events) await sync();
}

/** Merges independent watch streams while leaving synchronization serialized. */
export async function* mergeFeatureWatchEvents(
  sources: readonly AsyncIterable<FeatureWatchEvent>[],
): AsyncGenerator<FeatureWatchEvent> {
  const iterators = sources.map((source) => source[Symbol.asyncIterator]());
  const pending = new Map<
    number,
    Promise<{
      index: number;
      result: IteratorResult<FeatureWatchEvent>;
    }>
  >();
  const readNext = (index: number) => {
    const iterator = iterators[index];
    if (iterator === undefined) return;
    pending.set(
      index,
      iterator.next().then((result) => ({ index, result })),
    );
  };
  for (const index of iterators.keys()) readNext(index);

  try {
    while (pending.size > 0) {
      const { index, result } = await Promise.race(pending.values());
      pending.delete(index);
      if (result.done === true) continue;
      readNext(index);
      yield result.value;
    }
  } finally {
    await Promise.allSettled(iterators.map((iterator) => iterator.return?.()));
  }
}

export async function watchFeatures(signal?: AbortSignal): Promise<void> {
  try {
    await syncFeaturesOnChanges(
      mergeFeatureWatchEvents([
        watch(defaultFeaturesDirectory, { recursive: true, signal }),
        watch(defaultAppMessagesDirectory, { recursive: true, signal }),
      ]),
    );
  } catch (error) {
    if (signal?.aborted !== true) throw error;
  }
}

if (import.meta.main) {
  await runFeatureSync();
  const controller = new AbortController();
  process.once("SIGINT", () => controller.abort());
  process.once("SIGTERM", () => controller.abort());
  await watchFeatures(controller.signal);
}
