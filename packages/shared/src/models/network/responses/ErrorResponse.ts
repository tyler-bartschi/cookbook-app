import * as z from "zod";

/**
 * All endpoints, error response shape
 */

export const ErrorResponseSchema = z.strictObject({
  message: z.string(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
