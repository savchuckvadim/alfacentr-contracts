import { NextResponse } from 'next/server';

// Битрикс открывает приложение POST-запросом на /api/app.
// Отвечаем 303 на страницу приложения, чтобы браузер перешёл на неё GET-ом.
//
// Location относительный специально: за nginx в Docker req.url содержит
// внутренний адрес контейнера (localhost:3000), и абсолютный редирект
// уводил фрейм Битрикса на localhost. Относительный путь браузер
// разрешает от текущего домена, поэтому он работает и на Vercel,
// и на собственном сервере.
export async function POST() {
    return new NextResponse(null, {
        status: 303,
        headers: { Location: '/bitrix/main' },
    });
}

export async function GET() {
    return NextResponse.json({
        message: 'Этот маршрут поддерживает только POST-запросы',
    });
}
