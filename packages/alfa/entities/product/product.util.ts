import { ProductType } from './product.type';


// Семинар - это С, все после С - принадлежность к отделу, дате и месту проведения
// ППК - ППК, он к счастью всю жизнь такой
// УП Видеозапись - УВ
// УП Комплектом - УП
// Спецпродукт (УП Семинаром) - УС (это точно не будут изменять)
// В товарах основная часть префикса именно эта, остальное - принадлежность к продающему отделу (Р\Н\З), у ППК, УП, УВ отличаются только эти буквы и цифры, указывающие на год курсов ППК и УП , т.е. в 2026 году у всех например УПН26\ППКН26, вне зависимости от других параметров товара (часы обучения\тип учреждения). У семинаров у всех разные префиксы, т.к. их составляют из отдела + дата + город после буквы С.
// Спецпродукту присвоено УС, после этого только отдел и год, на скрине пример, что УС для здравоохранения и др. учреждений он одинаковый УСР.
// Если возможно разделить понимание, что УСР и СР это разное, то нужно конечно, чтобы спецпродукт не проскочил как семинар, поскольку у них совершенно разные договоры. В остальном другие кейсы не встречались

const seminarPrixPart = 'С';
const ppkPrixPart = 'ППК';
const upVideoPrixPart = 'УВ';
const upComplectPrixPart = 'УП';
const upSpecialPrixPart = 'УС';
// const upSpecialPrixPartSecond = 'УВР';
export const getProductTypeByProductName = (
    productName: string,
): ProductType => {
    const prefix = getPrefixByProductName(productName);

    if (prefix.includes(seminarPrixPart)
        && !prefix.includes(ppkPrixPart)
        && !prefix.includes(upVideoPrixPart)
        && !prefix.includes(upComplectPrixPart)
        && !prefix.includes(upSpecialPrixPart)
        // && !prefix.includes(upSpecialPrixPartSecond)
    ) {
        return 'seminar';
    } else if (prefix.includes(ppkPrixPart)) {
        return 'ppk';
    } else if (
        prefix.includes(upVideoPrixPart)
        // && !prefix.includes(upSpecialPrixPartSecond)
    ) {
        return 'up_video';
    } else if (prefix.includes(upComplectPrixPart)) {
        return 'up_complect';
    } else if (
        prefix.includes(upSpecialPrixPart)
        // || prefix.includes(upSpecialPrixPartSecond)
    ) {
        return 'up_special';
    }
    return 'seminar';
};


//old version оставил пока на всякий случай для отлавливания багов
// export const getProductTypeByProductName = (
//     productName: string,
// ): ProductType => {
//     const prefix = getPrefixByProductName(productName);

//     if (prefix.includes('СР') || prefix.includes('СН')) {
//         return 'seminar' as ProductType;
//     } else if (prefix.includes('ППК')) {
//         return 'ppk' as ProductType;
//     } else {
//         return 'up' as ProductType;
//     }
// };

export function getPrefixByProductName(productName: string): string {
    const match = productName.match(/\[\]\s*(.*)/);
    return match ? (match[1] as string) : '';
}
