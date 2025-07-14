import { ProductsTable } from "@/modules/entities/product/ui/components/ProductsTable"
import { FilterTabs, SimpleCard } from "@/modules/shared"
import { ParticipantItem } from "./ParticipantItem"
import { ParticipantsTable } from "@/modules/widgetes/Participant/ParticipantsTable/ParticipantsTable"
import { PartisipantProductSimpleStatistics } from "@/modules/widgetes/Participant/PartisipantProductSimpleStatistics/PartisipantProductSimpleStatistics"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { CheckCircle, CreditCard, Package, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { ParticipantsTableWidget } from "@/modules/widgetes/Participant/ParticipantsTable/ParticipantsTableWidget"

export const MainPageContent = () => {
    const [filter, setFilter] = useState<string>("main")
    const [title, setTitle] = useState<string>("Основные данные")
    const tabs = [{
        value: "main",
        label: "Основные данные",
        icon: <Package />,
        content:
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6">
                <SimpleCard title="Товары" children={<ProductsTable />} />
                <ParticipantsTableWidget/>
                <SimpleCard  children={<ParticipantsTableWidget/>  } />

            </div>

    },
    {
        value: "products",
        label: "Товары",
        icon: <Package />,
        content: <ProductsTable />


    },
    {
        value: "participants",
        label: "Участники",
        icon: <Users />,
        content: <ParticipantsTableWidget/> 

    },
    {
        value: "requisites",
        label: "Реквизиты",
        icon: <CreditCard />,
        content: <SimpleCard children={<ParticipantsTable />} />

    },
    {
        value: "contract",
        label: "Что будет в договоре",
        icon: <CheckCircle />,
        content: <ProductsTable />
    },
    ]
    useEffect(() => {
        setTitle(tabs.find(tab => tab.value === filter)?.label || "Основные данные")
    }, [filter])
    return (
        <div className="bg-background p-5 rounded-2xl">
            <h3 className="text-2xl mb-2 font-bold">{title}</h3>
            {filter !== "main" ? (
                <div className="space-y-6 my-3">
                    <PartisipantProductSimpleStatistics />
                </div>
            )
                : (
                    <div className="space-y-6 my-3 h-17">
                        Main statistics
                    </div>
                )}
            <FilterTabs tabs={tabs}
                defaultValue={filter}
                onTabChange={setFilter}
                className="w-full space-y-6"
            />
        </div>
    )
}