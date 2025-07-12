'use client'
import { ClientTypeSelect } from "@/modules/entities/deal/ui/ClientTypeSelect"
import { ContractType } from "@/modules/features/contract-type/ui/ContractType"

export const DocumentGlobalConfig = () => {

    return (
        <div className="flex items-center justify-between p-2">
            <div className="flex items-center space-x-2">

                <div className="w-[200px]">
                    <ClientTypeSelect />
                </div>
                <div className="w-[300px]">
                    <ContractType />
                </div>

            </div>

            <div className="flex items-center space-x-2">
                <span className="text-sm ">Последнее обновление:</span>
                <span className="text-sm font-medium text-primary">
                    {new Date().toLocaleString('ru-RU')}
                </span>
            </div>
        </div>
    )
}   