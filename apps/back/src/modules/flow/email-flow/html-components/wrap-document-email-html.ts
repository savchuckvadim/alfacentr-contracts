import { EMAIL_STYLES } from './email-styles';

export const wrapDocumentEmailHtml = (params: {
    innerHtml: string;
    bodyId: string;
}): string => {
    return `<!DOCTYPE html>
<html lang="ru">
<body id="${params.bodyId}" style="margin:0;padding:12px 8px;background:${EMAIL_STYLES.pageBg};-webkit-font-smoothing:antialiased;">
  <div style="max-width:980px;margin:0 auto;background:${EMAIL_STYLES.surface};border-radius:12px;padding:24px 24px;box-shadow:0 1px 2px rgba(60,64,67,0.08),0 2px 8px rgba(60,64,67,0.06);">
    ${params.innerHtml.trim()}
  </div>
</body>
</html>`;
};

// export const wrapDocumentEmailHtml = (params: {
//     innerHtml: string;
//     bodyId: string;
// }): string => {
//     return `<!DOCTYPE html>
// <html lang="ru">
// <head>
//   <meta charset="utf-8" />
//   <meta name="viewport" content="width=device-width, initial-scale=1" />
//   <link rel="preconnect" href="https://fonts.googleapis.com" />
//   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
//   <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
// </head>
// <body id="${params.bodyId}" style="margin:0;padding:12px 8px;background:${EMAIL_STYLES.pageBg};-webkit-font-smoothing:antialiased;">
//   <div style="max-width:980px;margin:0 auto;background:${EMAIL_STYLES.surface};border-radius:12px;padding:24px 24px;box-shadow:0 1px 2px rgba(60,64,67,0.08),0 2px 8px rgba(60,64,67,0.06);">
//     ${params.innerHtml.trim()}
//   </div>
// </body>
// </html>`;
// };
