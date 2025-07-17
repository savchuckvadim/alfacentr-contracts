import { useAppDispatch } from "@/modules/app/lib/hooks/redux";
import { documentGenerate } from "../model/DocumentThunk";

export const useDocument = () => {
    const dispatch = useAppDispatch()

    const generateDocument = () => {
        dispatch(documentGenerate())
    }

    return {
        generateDocument
    }
}

export default useDocument