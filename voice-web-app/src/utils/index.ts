/**
 * Utilitários genéricos reutilizáveis
 */

/**
 * Extrai mensagem de erro de forma segura
 * @param err - Erro desconhecido (Error, string, etc.)
 * @param fallback - Mensagem padrão quando não for possível extrair
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return fallback;
}

/**
 * Copia texto para a área de transferência
 * Usa Clipboard API com fallback para execCommand em navegadores antigos
 * @returns true se copiou com sucesso
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  }
}

/**
 * Extrai mensagem de erro de resposta de API
 * @param errorData - Objeto de erro retornado pela API
 * @param statusFallback - Mensagem quando formato é desconhecido
 */
export function parseApiErrorMessage(
  errorData: unknown,
  statusFallback: string,
): string {
  if (!errorData || typeof errorData !== 'object') return statusFallback;

  const data = errorData as { message?: string | string[] };
  const msg = data.message;

  if (typeof msg === 'string') return msg;
  if (Array.isArray(msg)) return msg.join(', ');
  return statusFallback;
}
