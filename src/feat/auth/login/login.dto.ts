import { z } from "zod";

export const LoginModelSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export type LoginModel = z.infer<typeof LoginModelSchema>;
