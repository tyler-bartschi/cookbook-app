import * as z from "zod";

export const UsernameSchema = z.string().trim().toLowerCase().min(3).max(32);