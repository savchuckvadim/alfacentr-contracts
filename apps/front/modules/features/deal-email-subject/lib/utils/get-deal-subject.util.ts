export const getDealSubject = (prefix: string, counter: number): string => {
    const subject = `Документы на согласование Договор №${prefix}-${counter} от ООО "Альфацентр"`
    return subject;
};
