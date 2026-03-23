// 'use client';

// import {
//     Controller,
//     Control,
//     FieldPath,
//     FieldValues,
//     Path,
//     RegisterOptions,
// } from 'react-hook-form';
// import { DatePickerInput } from '@workspace/ui/components/date-picker';
// import type { ComponentProps } from 'react';
// import { Input } from '@workspace/ui/components/input';
// import { DealEdoCommentName } from '../type/deal-edo-comment.type';
// import { useDealEdoComment } from '../lib/hooks/deal-edo-comment.hook';
// import { Label } from '@workspace/ui/components/label';



// export interface DealActDateFieldProps<T extends FieldValues>
//     extends Omit<
//         ComponentProps<typeof DatePickerInput>,
//         | 'locale'
//         | 'label'
//         | 'placeholder'
//         | 'initialValue'
//         | 'onDateChange'
//         | 'value'
//         | 'onChange'
//         | 'onBlur'
//         | 'name'
//     > {
//     /** Control из react-hook-form */
//     control: Control<T>;
//     /** Имя поля в форме */
//     name: Path<T>;
//     /** Правила валидации */
//     rules?: Omit<
//         RegisterOptions<T, FieldPath<T>>,
//         'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
//     >;
//     /** Если true, не использует внутренний хук для управления состоянием */
//     useHookFormOnly?: boolean;
// }

// /**
//  * Компонент поля даты акта с интеграцией react-hook-form через Controller
//  */
// export function DealEdoCommentInput<T extends FieldValues>({
//     control,
//     name,
//     rules,
//     className,
//     errors,
//     ...rest
// }: DealActDateFieldProps<T>) {
//     const { comment, update } = useDealEdoComment();

//     return (
//         <>
//             <div className="flex flex-row gap-2 items-center">
//                 <Label>{DealEdoCommentName}</Label>
//                 {errors.comment && (
//                     <Label className="text-red-500">
//                         {errors.comment.message}
//                     </Label>
//                 )}
//             </div>
//             <Input
//                 {...register('phone', {
//                     required: 'Телефон обязателен',
//                     pattern: {
//                         value: /^(\+7|8)?[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/,
//                         message: 'Некорректный номер',
//                     },
//                     onBlur: e => {
//                         updateField(
//                             BxDealDataKeys.exchange_doc_phone,
//                             e.target.value,
//                         );
//                         // updateFieldWithAPI(
//                         //     BxDealDataKeys.exchange_doc_phone,
//                         //     e.target.value,
//                         // )
//                     },
//                 })}
//                 className={errors.phone ? 'border-red-500' : ''}
//             />
//         </>
//     );
// }
