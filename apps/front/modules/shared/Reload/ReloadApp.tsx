"use client"
import { useReload } from "@/modules/app"
import { RefreshCcw } from "lucide-react"
import { Tooltip } from "../Tooltip"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { useEffect } from "react"

export const ReloadApp = () => {
    const { reload,  isReloading } = useReload()

    const isSpinning =  isReloading
    const rotation = useMotionValue(0)
    const rotate = useTransform(rotation, (value) => `${value}deg`)

    useEffect(() => {
        if (isSpinning) {
            // Анимация с накоплением оборотов
            const animation = animate(rotation, [0, 360], {
                duration: 0.2, // Быстрая анимация
                delay: 0.1,
                ease: "linear",
                repeat: Infinity,
                repeatType: "loop"
            })
            
            return animation.stop
        } else {
            // Плавная остановка
            animate(rotation, 0, {
                duration: 0.1,
                ease: "easeOut"
            })
        }
    }, [isSpinning, rotation])

    return (
        <Tooltip content="Перезагрузить приложение">
            <div onClick={reload} className="cursor-pointer">
                <motion.div
                    style={{ rotate }}
                    className="hover:text-primary transition-colors"
                >
                    <RefreshCcw size={17} />
                </motion.div>
            </div>
        </Tooltip>
    )
}
