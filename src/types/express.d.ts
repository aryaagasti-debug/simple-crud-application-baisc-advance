import { ApiKey } from '@prisma/client';

declare module 'express-serve-static-core' {
  interface Request {
    csrfToken?: () => string;

    // ✅ ADD THIS
    apiKey?: ApiKey;
  }
}
