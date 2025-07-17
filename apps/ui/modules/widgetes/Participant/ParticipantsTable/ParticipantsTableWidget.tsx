import { ParticipantsTable } from "./ParticipantsTable"
import { Badge } from "@workspace/ui/components/badge"
import { Eye } from "lucide-react"
import Link from "next/link"
import { useParticipantsInfo } from "../ParticipantInfoCard/hook/useParticipantsInfo"
import { Tooltip } from "@/modules/shared"
import { ParticipantsProblems } from "../ParticipantReport/ParticipantsProblems"

export const ParticipantsTableWidget = () => {

    const { hasProblems, participantsProblems, problemsCount } = useParticipantsInfo()
    
    return <div>
        <div className="flex flex-row justify-between items-center gap-2 py-2">
            <div className="flex flex-row gap-2 px-2">
                <h3 className="text-lg font-bold">Участники</h3>
            </div>
            <div className="flex flex-row gap-2">
                {hasProblems ? <Tooltip content={
                    <div className="p-0 m-0 flex flex-col gap-2 w-[1000px] h-[400px] bg-background overflow-y-auto">
                        <ParticipantsProblems />
                    </div>
                }>
                    <Badge
                        variant={hasProblems ? "destructive" : "default"}
                    >


                        {hasProblems ? "Проблемы " + problemsCount : "+"}


                    </Badge>
                </Tooltip>
                    : <Badge
                        variant={"secondary"}
                    >
                        ОК
                    </Badge>}
                <Link href="/participants">
                    <Badge
                        className="bg-red-600 text-white cursor-pointer"
                        variant={"outline"}
                    >
                        <Eye className="w-4 h-4" color="black" />
                        <p className="text-sm text-black">Подробнее</p>
                    </Badge>
                </Link>
            </div>
        </div>
        <ParticipantsTable />
    </div>
}