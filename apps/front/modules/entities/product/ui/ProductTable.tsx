import { Table, TableBody, TableCell, TableHeader, TableRow } from "@workspace/ui/components/table"
import { useAlfaProducts } from "../hook/useAlfaProducts"

export const ProductTable = () => {

    const { items, loading, error } = useAlfaProducts()
    if (loading) {
        return <div>Загрузка продуктов...</div>
    }
    if (error) {
        return <div>Ошибка: {error}</div>
    }
    return (
        <div>
            <h1>Product Table</h1>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableCell>Название</TableCell>
                        <TableCell>Цена</TableCell>
                        <TableCell>Количество</TableCell>
                        {items[0]?.fields.map(filed =>
                            <TableCell key={filed.bitrixId}>{filed.name}</TableCell>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map(row => {

                        return <TableRow key={row.id} className="hover:bg-gray-100">
                            <TableCell>{row.productName}</TableCell>
                            <TableCell>{row.price}</TableCell>
                            <TableCell>{row.quantity}</TableCell>
                            {row.fields.map(filed =>
                                <TableCell key={filed.bitrixId}>{filed.name}</TableCell>
                            )}
                        </TableRow>


                    })}
                </TableBody>

            </Table>

        </div >
    )
}   