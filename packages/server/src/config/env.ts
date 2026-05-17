import * as z from "zod";

const envSchema = z.object({
  AWS_REGION: z.string().min(1).default("us-east-1"),

  USERS_DB_NAME: z.string().min(1).default("cookbook_users"),

  LONG_TERM_AUTH_DB_NAME: z.string().min(1).default("cookbook_long_term_auth"),
  LONG_TERM_AUTH_DB_INDEX_NAME: z.string().min(1).default("cookbook_long_term_auth_index"),

  SHORT_TERM_AUTH_DB_NAME: z.string().min(1).default("cookbook_short_term_auth"),
  SHORT_TERM_AUTH_DB_INDEX_NAME: z.string().min(1).default("cookbook_short_term_auth_index"),

  PROFILE_PICTURE_S3_BUCKET_NAME: z.string().min(1).default("cookbook_profile_pictures_bartschi"),
});

export const env = envSchema.parse(process.env);
