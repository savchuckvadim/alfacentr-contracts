'use client';
import { useAppSelector } from '@/modules/app';
import { getParticipantName, useParticipant } from '@/modules/entities';
import { useAlfaProducts } from '@/modules/entities/product/hook/useAlfaProducts';
import { useEffect, useState } from 'react';
import { getParticipantPpkProblems } from '../lib/utils/participant-ppk-problem.util';
import { IParticipant } from '@alfa/entities';

export const useParticipantSeminar = () => {
    const { loading: isParticipantLoading } = useParticipant();
    const { loading: isProductsLoading } = useAlfaProducts();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(isParticipantLoading || isProductsLoading);
    }, [isParticipantLoading, isProductsLoading]);
    const seminarDistribution = useAppSelector(
        state => state.participantProduct.seminarDistribution,
    );
    const topicStats = seminarDistribution.topicStats;
    const participantToProducts = seminarDistribution.participantToProducts;
    const productToParticipants = seminarDistribution.productToParticipants;
    const unassignedParticipants = seminarDistribution.unassignedParticipants;
    const participantsPpkTopicsStats =
        seminarDistribution.participantsPpkTopicsStats;
    const isProductSeminar = (productId: number) => {
        return productToParticipants[productId];
    };

    const isParticipantSeminar = (participantId: number) => {
        let isPpk = false;
        if (
            participantsPpkTopicsStats[participantId] &&
            participantsPpkTopicsStats[participantId].length > 0
        ) {
            isPpk = true;
        }
        return isPpk;
    };
    const getParticipantPpkTopicsStats = (participantId: number) => {
        return participantsPpkTopicsStats[participantId];
    };
    const getParticipantProblems = (participantId: number) => {
        return getParticipantPpkProblems(
            participantsPpkTopicsStats,
            participantId,
        );
    };
    const getParticipantsProblems = (participants: IParticipant[]) => {
        let problemsCount = 0;
        const participantsProblems = participants.map(participant => {
            const { problems } = getParticipantProblems(participant.id);
            return {
                [participant.id]: {
                    name: getParticipantName(participant),
                    problems,
                },
            };
        });
        let hasProblems = false;
        participantsProblems.forEach(problem => {
            for (const key in problem) {
                const typeKey = Number(key) as number;
                if (
                    problem[typeKey]?.problems &&
                    problem[typeKey]?.problems.length > 0
                ) {
                    hasProblems = true;
                    problemsCount += problem[typeKey]?.problems.length;
                }
            }
        });

        return {
            participantsProblems,
            hasProblems,
            problemsCount,
        };
    };
    return {
        topicStats,
        participantToProducts,
        productToParticipants,
        unassignedParticipants,
        participantsPpkTopicsStats,
        isLoading,
        isProductSeminar,
        isParticipantSeminar,
        getParticipantPpkTopicsStats,
        getParticipantProblems,
        getParticipantsProblems,
    };
};
