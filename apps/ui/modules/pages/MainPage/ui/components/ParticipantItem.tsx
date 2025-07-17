import { SimpleCard, Tooltip } from "@/modules/shared"
import { ParticipantsProblems } from "@/modules/widgetes"
import { useParticipantsInfo } from "@/modules/widgetes/Participant/ParticipantInfoCard/hook/useParticipantsInfo"
import { ParticipantsTable } from "@/modules/widgetes/Participant/ParticipantsTable/ParticipantsTable"
import { ParticipantsTableWidget } from "@/modules/widgetes/Participant/ParticipantsTable/ParticipantsTableWidget"
import { Badge } from "@workspace/ui/components/badge"
import { Eye } from "lucide-react"
import Link from "next/link"

export const ParticipantItem = () => {
    const { hasProblems, participantsProblems } = useParticipantsInfo()
    return (<SimpleCard title="Участники" children={ <ParticipantsTableWidget/>
        // <div>
        //     <div className="flex flex-row justify-end items-center gap-2 py-2">

        //         <div className="flex flex-row gap-2">
        //             {hasProblems ? <Tooltip content={
        //                 <div className="p-0 m-0 flex flex-col gap-2 w-[1000px] h-[400px] bg-background overflow-y-auto">
        //                     <ParticipantsProblems />
        //                 </div>
        //             }>
        //                 <Badge
        //                     variant={hasProblems ? "destructive" : "default"}
        //                 >


        //                     {hasProblems ? "Проблемы " + participantsProblems.length : "+"}


        //                 </Badge>
        //             </Tooltip>
        //             : <Badge
        //                 variant={"secondary"}
        //             >
        //                ОК
        //             </Badge>}
        //             <Link href="/participants">
        //                 <Badge
        //                     className="bg-zinc-100 text-white cursor-pointer"
        //                     variant={"outline"}
        //                 >
        //                     <Eye className="w-4 h-4" color="black" />
        //                     <p className="text-sm text-black">Подробнее</p>
        //                 </Badge>
        //             </Link>
        //         </div>
        //     </div>
        //     <ParticipantsTable />
        // </div>
    } />
    )
}