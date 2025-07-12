import { ProductsTable } from "@/modules/entities/product/ui/components/ProductsTable"
import { FilterTabs, SimpleCard } from "@/modules/shared"
import { ParticipantsTable } from "@/modules/widgetes/Participant/ParticipantsTable/ParticipantsTable"
import { PartisipantProductSimpleStatistics } from "@/modules/widgetes/Participant/PartisipantProductSimpleStatistics/PartisipantProductSimpleStatistics"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { CheckCircle, CreditCard, Package, Users } from "lucide-react"
import { useEffect, useState } from "react"

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
                <SimpleCard title="Участники" children={<ParticipantsTable />} />
                <SimpleCard title="Реквизиты" children={<ParticipantsTable />} />

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
        content: <SimpleCard title="Участники" children={<ParticipantsTable />} />

    },
    {
        value: "requisites",
        label: "Реквизиты",
        icon: <CreditCard />,
        content: <SimpleCard title="Реквизиты" children={<ParticipantsTable />} />

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
        <div>
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