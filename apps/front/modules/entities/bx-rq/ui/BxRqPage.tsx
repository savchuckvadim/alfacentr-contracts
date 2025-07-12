'use client'

import { useAppSelector } from "@/modules/app/lib/hooks/redux"
import { useEffect, useState } from "react"
import { filterFieldItems, useBxRq } from "@workspace/bx-rq"

import { RQ_TYPE, CONTRACT_LTYPE, SupplyTypesType, EvsRqItem, getClinetTypeNameByCode, isFieldsEmpty, SupplyTypeEnum, ResolvedRQType, RqItem, BX_ADDRESS_TYPE } from "@workspace/bx-rq"
import { BxRqBaseEdit } from './BxRqBaseEdit'
import { BxRqAddressEdit } from './BxRqAddressEdit'
import { BxRqBankEdit } from './BxRqBankEdit'
import { Edit2, Save, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@workspace/ui/components/tabs"
import { useDeal } from "../../deal"
import { useClientType } from "@/modules/features/client-type/hook/useClientType"

interface BxRqPageProps {
  currentClientType?: RQ_TYPE;
  contractType?: CONTRACT_LTYPE;
  supplyType?: SupplyTypesType;
  onSave?: () => void;
  onCancel?: () => void;
}

export const BxRqPage = ({ 
//   currentClientType = RQ_TYPE.FIZ,
//   contractType = CONTRACT_LTYPE.SERVICE,
//   supplyType = SupplyTypeEnum.INTERNET,
  onSave,
  onCancel
}: BxRqPageProps) => {
    const { rqs, isLoading, isFetched, fetchBXRQ, current, saveBase, saveAddress, saveBank, copyAddress } = useBxRq()
    const domain = useAppSelector(state => state.app.domain);
    const companyId = useAppSelector(state => state.app.bitrix.company?.ID);
    // const [selectedRq, setSelectedRq] = useState<EvsRqItem | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const {clientType} = useClientType()
  
    useEffect(() => {
        if (!isFetched && !isLoading && companyId) {
            fetchBXRQ(domain, companyId);
        }
    }, [isFetched, isLoading, companyId, fetchBXRQ, domain]);

    // useEffect(() => {
    //     if (rqs && currentClientType && rqs[currentClientType as ResolvedRQType]) {
    //         setSelectedRq(rqs[currentClientType as ResolvedRQType].default);
    //     }
    // }, [rqs, currentClientType]);

    const handleSaveBase = async (fields: RqItem[]) => {
        setIsSaving(true);
        try {
            await saveBase(fields);
        } catch (error) {
            console.error('Ошибка сохранения основных полей:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveAddress = async (typeId: BX_ADDRESS_TYPE, fields: RqItem[]) => {
        setIsSaving(true);
        try {
            await saveAddress(typeId, fields);
        } catch (error) {
            console.error('Ошибка сохранения адреса:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveBank = async (bankId: number, fields: RqItem[]) => {
        setIsSaving(true);
        try {
            await saveBank(bankId, fields);
        } catch (error) {
            console.error('Ошибка сохранения банковских реквизитов:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCopyAddress = async (fromTypeId: BX_ADDRESS_TYPE, toTypeId: BX_ADDRESS_TYPE) => {
        setIsSaving(true);
        try {
            await copyAddress(fromTypeId, toTypeId);
        } catch (error) {
            console.error('Ошибка копирования адреса:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        onCancel?.();
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center p-6">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-muted-foreground">Загрузка реквизитов...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!isFetched || !rqs ) {
        return (
            <Card>
                <CardContent className="p-6">
                    <p className="text-muted-foreground">Реквизиты не загружены</p>
                </CardContent>
            </Card>
        );
    }
 
    const defRq = rqs[clientType as ResolvedRQType]?.default;
    const currentRqs = current.items;
    const currentRq = current.item ;

    if (!currentRq) {
        return (
            <Card>
                <CardContent className="p-6">
                    <p className="text-muted-foreground">Реквизиты не найдены</p>
                </CardContent>
            </Card>
        );
    }

    const fields = filterFieldItems(
        currentRq.fields,
        clientType || RQ_TYPE.ORGANIZATION as RQ_TYPE,
                // contractType,
                // supplyType,
    );

    const isEmpty = fields ? isFieldsEmpty(fields) : false;

    const handleRqSelect = (rqId: string) => {
        const selected = currentRqs.find((rq: EvsRqItem) => rq.bx_id.toString() === rqId);
        if (selected) {
            
            // setSelectedRq(selected);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Реквизиты</h1>
                <div className="flex gap-2">
                    {onCancel && (
                        <Button variant="outline" onClick={handleCancel}>
                            <X className="h-4 w-4 mr-2" />
                            Отмена
                        </Button>
                    )}
                    {onSave && (
                        <Button onClick={onSave}>
                            <Save className="h-4 w-4 mr-2" />
                            Сохранить
                        </Button>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span>Реквизиты</span>
                        {currentRq.bx_id !== -1 && (
                            <Badge variant="secondary">
                                {getClinetTypeNameByCode(clientType)}
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Селект реквизитов */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            {getClinetTypeNameByCode(clientType)}
                        </label>
                        <Select value={currentRq.bx_id.toString()} onValueChange={handleRqSelect}>
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите реквизиты" />
                            </SelectTrigger>
                            <SelectContent>
                                {currentRqs.map((rq: EvsRqItem) => {
                                    const displayName = (rq.fields[0]?.value as string)?.slice(0, 25) + "...";
                                    return (
                                        <SelectItem key={rq.bx_id} value={rq.bx_id.toString()}>
                                            {displayName}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    <Tabs defaultValue="base" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="base">Основные</TabsTrigger>
                            <TabsTrigger value="addresses">Адреса</TabsTrigger>
                            <TabsTrigger value="bank">Банковские</TabsTrigger>
                        </TabsList>

                        <TabsContent value="base" className="space-y-4">
                            {fields && (
                                <BxRqBaseEdit
                                    rq={currentRq}
                                    fields={fields}
                                    isEmpty={isEmpty}
                                    // currentClientType={clientType as RQ_TYPE}
                                    // contractType={contractType}
                                    // supplyType={supplyType}
                                    onSave={handleSaveBase}
                                    onCancel={handleCancel}
                                    isLoading={isSaving}
                                />
                            )}
                        </TabsContent>

                        <TabsContent value="addresses" className="space-y-4">
                            {!isEmpty && currentRq.address?.items && currentRq.address.items.length > 0 ? (
                                <BxRqAddressEdit
                                    addresses={currentRq.address.items}
                                    // currentClientType={currentClientType}
                                    onSave={handleSaveAddress}
                                    onCopy={handleCopyAddress}
                                    onCancel={handleCancel}
                                    isLoading={isSaving}
                                />
                            ) : (
                                <Card>
                                    <CardContent className="text-center p-6">
                                        <p className="text-muted-foreground">Адреса отсутствуют</p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="bank" className="space-y-4">
                            {!isEmpty && currentRq.bank ? (
                                <BxRqBankEdit
                                    bank={currentRq.bank}
                                    onSave={handleSaveBank}
                                    onCancel={handleCancel}
                                    isLoading={isSaving}
                                />
                            ) : (
                                <Card>
                                    <CardContent className="text-center p-6">
                                        <p className="text-muted-foreground">Банковские реквизиты отсутствуют</p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>

                    {/* Сообщение если реквизиты пустые */}
                    {isEmpty && (
                        <div className="text-center p-6">
                            <p className="text-muted-foreground">
                                Реквизиты не заполнены или не подходят для выбранного типа контракта
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
