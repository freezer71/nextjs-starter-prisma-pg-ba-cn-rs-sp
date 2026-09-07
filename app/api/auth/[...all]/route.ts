import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth/auth";

// Toutes les routes Better Auth (/api/auth/*). Le rate limiting et la protection CSRF sont intégrés.
export const { GET, POST } = toNextJsHandler(auth);
