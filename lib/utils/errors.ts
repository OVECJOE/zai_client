export function getErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === 'string' && msg.trim().length > 0) return msg;
  }
  return fallback;
}

