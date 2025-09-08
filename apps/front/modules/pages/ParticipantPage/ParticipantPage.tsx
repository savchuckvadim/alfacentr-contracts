import { ParticipantPpkInfo } from "@/modules/widgetes";
import { useApp } from "@/modules/app";
import { useParticipant } from "@/modules/entities/participant";
import { User, XCircle } from "lucide-react";
import { useAlfaProducts } from "@/modules/entities/product/hook/useAlfaProducts";

export const ParticipantPage = ({ id }: { id: number }) => {
    const { isClient } = useApp();
    const { participant, loading, error } = useParticipant(id);
    const { loading: loadingProducts } = useAlfaProducts();
    if (!isClient) {
        return null;
    }

    if (loading || !isClient) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">
                        Загрузка участника...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <XCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
                    <p className="text-destructive">
                        Ошибка загрузки участника
                    </p>
                </div>
            </div>
        );
    }

    if (!participant) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <User className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Участник не найден</p>
                </div>
            </div>
        );
    }

    return (

        <ParticipantPpkInfo participant={participant} loading={loading} loadingProducts={loadingProducts} />

    );
};
