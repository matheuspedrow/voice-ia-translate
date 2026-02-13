/** URL base da API - use /api para deploy unificado (Vercel), ou URL externa para backend separado */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? '/api';
