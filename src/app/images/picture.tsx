import type { JSX } from "solid-js";

import type { ImageDomain } from "./image.model";

export type PictureProps = ImageDomain &
  Readonly<{
    class?: string;
    loading?: "eager" | "lazy";
  }>;

/** Provider-neutral, already-optimized image primitive. */
export function Picture(props: PictureProps): JSX.Element {
  return (
    <picture>
      <img
        alt={props.alt}
        class={props.class}
        decoding="async"
        height={props.height}
        loading={props.loading ?? "lazy"}
        sizes={props.sizes}
        src={props.src}
        width={props.width}
      />
    </picture>
  );
}
