'use client'
export async function logClient(title: string, payload: any) {
  if (typeof window === 'undefined') {
    return
  }
  try {
    await fetch('/api/admin/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        domain: 'alfa',
        useId: 777,
        level: 'error',
        payload,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (e) {
    console.warn('Не удалось отправить лог на сервер', e);
  }
}
