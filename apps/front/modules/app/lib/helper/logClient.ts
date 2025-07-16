'use client'

const isServer = typeof window === 'undefined';
const baseUrl = isServer
  ? process.env.NEXT_PUBLIC_BASE_URL
  : '';


export async function logClient(title: string, payload: any) {
  console.log('logClient', title, payload);
  // if (typeof window === 'undefined') {
    return
  // }
  try {
    // await fetch(`${baseUrl}/api/admin/logs`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     title,
    //     domain: 'alfa',
    //     useId: 777,
    //     level: 'error',
    //     payload,
    //     timestamp: new Date().toISOString(),
    //   }),
    // });
  } catch (e) {
    console.warn('Не удалось отправить лог на сервер', e);
  }
}
