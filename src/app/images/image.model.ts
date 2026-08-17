import { z } from "zod";

export const ImageSourceModelSchema = z.object({
  alt: z.string(),
  height: z.int().positive(),
  quality: z.int().min(1).max(100).default(80),
  sizes: z.string().optional(),
  source: z.string().min(1),
  width: z.int().positive(),
});

export type ImageSourceModel = z.infer<typeof ImageSourceModelSchema>;

export const ImageDomainSchema = z.object({
  alt: z.string(),
  height: z.int().positive(),
  sizes: z.string().optional(),
  src: z.url(),
  width: z.int().positive(),
});

export type ImageDomain = z.infer<typeof ImageDomainSchema>;

export interface ImageBackend {
  url(model: ImageSourceModel): string;
}

/** Resolve provider-specific URLs at a server boundary before rendering. */
export function resolveImage(
  backend: ImageBackend,
  input: ImageSourceModel,
): ImageDomain {
  const model = ImageSourceModelSchema.parse(input);
  return ImageDomainSchema.parse({
    alt: model.alt,
    height: model.height,
    sizes: model.sizes,
    src: backend.url(model),
    width: model.width,
  });
}
