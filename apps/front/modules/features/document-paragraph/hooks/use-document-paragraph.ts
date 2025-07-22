import { useAppSelector } from '@/modules/app';
import {
    selectDocumentParagraph,
    selectDocumentTotalSum,
} from '../model/slice/DocumentParagraphSlice';

export const useDocumentParagraph = () => {
    const paragraph = useAppSelector(selectDocumentParagraph);
    const totalSum = useAppSelector(selectDocumentTotalSum);
    return {
        paragraph,
        totalSum,
    };
};
