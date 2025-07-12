'use client'
import { useAppSelector } from "@/modules/app";
import { getParticipantName, useParticipant } from "@/modules/entities";
import { useAlfaProducts } from "@/modules/entities/product/hook/useAlfaProducts";
import { useEffect, useState } from "react";
import { getParticipantPpkProblems } from "../lib/utils/participant-ppk-problem.util";
import { IParticipant } from "@alfa/entities";

export const useParticipantPpk = () => {
    const { loading: isParticipantLoading } = useParticipant()
    const { loading: isProductsLoading } = useAlfaProducts()
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        setIsLoading(isParticipantLoading || isProductsLoading)
    }, [isParticipantLoading, isProductsLoading])
    const ppkDistribution = useAppSelector(state => state.participantProduct.ppkDistribution)
    const topicStats = ppkDistribution.topicStats
    const participantToProducts = ppkDistribution.participantToProducts
    const productToParticipants = ppkDistribution.productToParticipants
    const unassignedParticipants = ppkDistribution.unassignedParticipants
    const participantsPpkTopicsStats = ppkDistribution.participantsPpkTopicsStats
    const isProductPpk = (productId: number) => {
        return productToParticipants[productId]
    }


    const isParticipantPpk = (participantId: number) => {

        let isPpk = false
        if (participantsPpkTopicsStats[participantId] && participantsPpkTopicsStats[participantId].length > 0) {
            isPpk = true
        }
        return isPpk
    }
    const getParticipantPpkTopicsStats = (participantId: number) => {
        return participantsPpkTopicsStats[participantId]
    }
    const getParticipantProblems = (participantId: number) => {
        return getParticipantPpkProblems(participantsPpkTopicsStats, participantId)
    }
    const getParticipantsProblems = (participants: IParticipant[]) => {
        
        const participantsProblems = participants.map(participant => {
            const { problems } = getParticipantProblems(participant.id)
            return {
                [participant.id]: {
                    name: getParticipantName(participant),
                    problems
                }
            }
        })
        let hasProblems = false
        participantsProblems.forEach(problem => {
            for (const key in problem) {
                const typeKey = Number(key) as number
                if (problem[typeKey]?.problems && problem[typeKey]?.problems.length > 0) {
                    hasProblems = true
                }
            }
        })
        return {
            participantsProblems,
            hasProblems
        }
    }
    return {
        topicStats,
        participantToProducts,
        productToParticipants,
        unassignedParticipants,
        participantsPpkTopicsStats,
        isLoading,
        isProductPpk,
        isParticipantPpk,
        getParticipantPpkTopicsStats,
        getParticipantProblems,
        getParticipantsProblems
    }
}





