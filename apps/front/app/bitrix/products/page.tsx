'use client'
import { ProductPage } from "@/modules/pages/ProductPage"
import { useApp } from "@/modules/app"

export default function ProductsPage() {
    const { isClient } = useApp()
    if (!isClient) {
        return null
    }
    return <ProductPage />
}