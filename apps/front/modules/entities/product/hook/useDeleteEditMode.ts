import { useState } from "react";
import { IAlfaProduct } from "../model/ProductSlice";

export const useDeleteEditMode = () => {
    const [onDelete, setOnDelete] = useState<number | null>(null)
    const [onEdit, setOnEdit] = useState<IAlfaProduct | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [deletingProduct, setDeletingProduct] = useState<IAlfaProduct | null>(null)
    // const [deleteModal, setDeleteModal] = useState<{
    //   isOpen: boolean;
    //   product: IAlfaProduct | null;
    // }>({
    //   isOpen: false,
    //   product: null
    // });
  
    const handleDeleteClick = (product: IAlfaProduct) => {
      
      setIsDeleting(true);
      setDeletingProduct(product);
    };
  
    const handleDeleteConfirm = () => {
   
        setIsDeleting(false);
        setDeletingProduct(null);
      
    };
  
    const handleDeleteCancel = () => {
      setIsDeleting(false);
      setDeletingProduct(null);
    };                      

    return {
        onDelete,
        onEdit,
        isDeleting,
        deletingProduct,
        handleDeleteClick,
        handleDeleteConfirm,
        handleDeleteCancel
    }
}