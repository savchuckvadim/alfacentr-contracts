import { useReload } from "@/modules/app"

import { RefreshCcw } from "lucide-react"
import { Tooltip } from "../Tooltip"


export const ReloadApp = () => {
    const { reload, isLoading, isReloading } = useReload()



    return (
        <Tooltip content="Перезагрузить приложение">
            <div onClick={reload} className="cursor-pointer">
                {/* <Button disabled={isLoading}  variant={"outline"}> */}
                <RefreshCcw size={17} className={`${isLoading || isReloading ? "animate-spin" : ""}`} />
                {/* </Button> */}
            </div>
        </Tooltip>
    )
}
