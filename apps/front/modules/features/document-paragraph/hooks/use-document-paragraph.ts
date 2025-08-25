import { useAppSelector } from '@/modules/app';
import {
    selectDocumentParagraph,
    selectDocumentParagraphItems,
    selectDocumentTotalSum,
} from '../model/slice/DocumentParagraphSlice';

export const useDocumentParagraph = () => {
    const paragraph = useAppSelector(selectDocumentParagraph);
    const totalSum = useAppSelector(selectDocumentTotalSum);
    const paragraphItems = useAppSelector(selectDocumentParagraphItems);
    return {
        paragraph,
        totalSum,
        paragraphItems,
    };
};
