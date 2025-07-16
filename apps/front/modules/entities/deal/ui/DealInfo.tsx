'use client'
import { useApp } from "@/modules/app"
import { useAppSelector } from "@/modules/app/lib/hooks/redux"

export const DealInfo = () => {
    const {isClient} = useApp()
    if (!isClient) {
        return null
    }
    const { dealData } = useAppSelector(state => state.deal)
    console.log(dealData)
    
    return <div>
        {
            dealData?.map((field) => {
                let value = field.value
                if (field.type === 'enumeration' && 'list' in field && field.list && field.list.length > 0) {
                    value = field.list.find(item => item.bitrixId === field.value)?.name || 'Не установлено'
                }
                return <div key={field.bitrixId}>

                    <p><span className="font-bold">{field.name}:</span> {value}</p>
                </div>
            })
        }
    </div>
}