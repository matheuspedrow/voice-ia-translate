/** URL base da API - /api para Next.js (padrão). Para backend separado: http://localhost:3001/api */
export const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/$/, '');
