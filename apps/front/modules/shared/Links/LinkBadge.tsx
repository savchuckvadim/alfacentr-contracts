"use client"
import { Badge } from "@workspace/ui/components/badge"
import Link from "next/link"
import { Eye } from "lucide-react"
import { Tooltip } from "../Tooltip"


export const LinkBadge = ({ href, text, name }: { href: string, text: string, name: string }) => {
    return <Tooltip content={text}>
        <Link href={href}>
            <Badge
                className="bg-primary text-primary-foreground cursor-pointer hover:bg-primary-foreground hover:text-primary"
                variant={"outline"}
            >

                <Eye className="w-4 h-4 " />
                <p className="text-sm ">{name}</p>

            </Badge>
        </Link>
    </Tooltip>
}
