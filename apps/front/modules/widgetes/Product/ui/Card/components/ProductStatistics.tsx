import {
    getIsPpkProduct,
    getIsSeminarProduct,
    getIsUpProduct,
    getParticipantName,
    IAlfaProduct,
} from '@/modules/entities';
import {
    useParticipantPpk,
    useParticipantSeminar,
} from '@/modules/features/participant-product';
import { LinkBadge } from '@/modules/shared';
import { Badge } from '@workspace/ui/components/badge';
import { AlertTriangle, Package, TrendingUp, Users } from 'lucide-react';

export interface IProductStatisticsProps {
    product: IAlfaProduct;
}
export const ProductStatistics = ({ product }: IProductStatisticsProps) => {
    const isPpk = getIsPpkProduct(product);

    const isSeminar = getIsSeminarProduct(product);
    const isUp = getIsUpProduct(product);
    const { productToParticipants } = useParticipantPpk();

    const { productToParticipants: seminarProductToParticipants } =
        useParticipantSeminar();

    // Получаем количество назначенных участников ппк
    const assignedPpkParticipants =
        productToParticipants[product.id?.toString() || ''] || [];
    const assignedPpkCount = assignedPpkParticipants.length;

    const assignedSeminarParticipants =
        seminarProductToParticipants[product.id?.toString() || ''] || [];
    const assignedSeminarCount = assignedSeminarParticipants.length;

    // Определяем статус заполненности для ППК продуктов
    const getAvailabilityStatus = () => {
        if ((!isPpk && !isSeminar) || !product) return null;
        const assignedCount = isSeminar
            ? assignedSeminarCount
            : assignedPpkCount;
        // const { needed, available, diff } = productStats
        const diff = (product.quantity || 0) - assignedCount;

        if (diff < 0)
            return {
                status: 'deficit',
                message: `Слишком много участников: ${Math.abs(diff)} мест`,
                variant: 'destructive' as const,
            };
        if (diff > 0)
            return {
                status: 'surplus',
                message: `Слишком мало участников: ${diff} свободных мест`,
                variant: 'destructive' as const,
            };
        return {
            status: 'balanced',
            message: 'Мест достаточно',
            variant: 'default' as const,
        };
    };

    const availabilityStatus = getAvailabilityStatus();

    return (
        <>
            {(isPpk || isSeminar) && (
                <div className="space-y-3 pt-3 border-t">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                                Статистика {isPpk ? 'ППК' : 'семинар'}
                            </span>
                        </div>
                        {availabilityStatus && (
                            <Badge
                                variant={availabilityStatus.variant}
                                className="text-xs"
                            >
                                {availabilityStatus.status === 'deficit' && (
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                )}
                                {availabilityStatus.message}
                            </Badge>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-muted/50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <Users className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                    Количество товара
                                </span>
                            </div>
                            <p className="text-lg font-bold">
                                {product.quantity}
                            </p>
                        </div>

                        {/* <div className="bg-muted/50 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <Package className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">Доступно</span>
                                </div>
                                <p className="text-lg font-bold">{productStats.available}</p>
                            </div> */}

                        <div className="bg-muted/50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <Users className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                    Количество участников
                                </span>
                            </div>
                            <p className="text-lg font-bold">
                                {isSeminar
                                    ? assignedSeminarCount
                                    : assignedPpkCount}
                            </p>
                        </div>

                        <div className="bg-muted/50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <Package className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                    Участники
                                </span>
                            </div>
                            {isSeminar
                                ? assignedSeminarParticipants.map(
                                      participant => (
                                          <div
                                              key={participant.id}
                                              className="flex items-center gap-2 p-1"
                                          >
                                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                                              <span className="text-sm">
                                                  <LinkBadge
                                                      href={`/bitrix/participants/${participant.id}`}
                                                      text="К участнику"
                                                      name={
                                                          getParticipantName(
                                                              participant,
                                                          ) ||
                                                          `Участник ${participant.id}`
                                                      }
                                                  />
                                              </span>
                                          </div>
                                      ),
                                  )
                                : assignedPpkParticipants.map(participant => (
                                      <div
                                          key={participant.id}
                                          className="flex items-center gap-2 p-1"
                                      >
                                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                                          <span className="text-sm">
                                              <LinkBadge
                                                  href={`/bitrix/participants/${participant.id}`}
                                                  text="К участнику"
                                                  name={
                                                      getParticipantName(
                                                          participant,
                                                      ) ||
                                                      `Участник ${participant.id}`
                                                  }
                                              />
                                          </span>
                                      </div>
                                  ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
