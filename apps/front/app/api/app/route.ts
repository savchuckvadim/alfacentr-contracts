
import { NextRequest, NextResponse } from 'next/server';



//редирект next из post запроса в апп
export async function POST(req: NextRequest) {
  try {

    // logServer(
    //   'info',
    //   'redirect from api/bitrix/app',
    //   'KPI REPORT SALES api/bitrix/app',
    //   'report post to get report redirect in bitrix',
    //   'domain',
    //   'ID',
    //   {
    //     req: req.json(),
    //   },
    //   new Date().toISOString()
    // )




    const response = NextResponse.redirect(new URL('/bitrix', req.url), 303);



    return response;
  } catch (error) {
    console.error('Ошибка обработки запроса:', error);
    return NextResponse.json({ error: 'Ошибка загрузки файла' }, { status: 500 });
  }
}



// const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://next.april-app.ru/kpi-sales';

// //редирект next из post запроса в апп
// export async function POST(req: NextRequest) {
//   try {





//     const response = NextResponse.redirect(new URL('/report', siteUrl), 303);



//     return response;
//   } catch (error) {
//     console.error('Ошибка обработки запроса:', error);
//     return NextResponse.json({ error: 'Ошибка загрузки файла' }, { status: 500 });
//   }
// }


export async function GET(req: NextRequest) {
  console.log(req)
  return NextResponse.json({ message: 'Этот маршрут поддерживает только POST-запросы' });
}