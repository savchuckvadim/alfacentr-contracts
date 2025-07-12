import React, { useState } from 'react';
import { useDeal } from '../hook/useDeal';
import { BxDealDataKeys } from '@alfa/entities';
import { IDealFieldsData } from '../type/deal-field.type';

// Пример компонента для работы с полями сделки
export const DealFieldInput: React.FC<{
    fieldKey: BxDealDataKeys;
    field: IDealFieldsData;
    dealId: number;
}> = ({ fieldKey, field, dealId }) => {
    const { 
        dealData, 
        updateField, 
        updateFieldWithAPI, 
        isUpdating, 
        error 
    } = useDeal();
    
    const [localValue, setLocalValue] = useState(field.value || '');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue);
        
        // Обновляем значение в состоянии
        updateField(fieldKey, newValue);
    };

    const handleBlur = async () => {
        // При потере фокуса отправляем обновление на сервер
        try {
            await updateFieldWithAPI(fieldKey, localValue);
        } catch (error) {
            console.error('Ошибка обновления поля:', error);
        }
    };

    return (
        <div>
            <label>{field.name}</label>
            <input
                type="text"
                value={localValue}
                onChange={handleInputChange}
                onBlur={handleBlur}
                disabled={isUpdating}
            />
            {isUpdating && <span>Обновление...</span>}
            {error && <span style={{ color: 'red' }}>{error}</span>}
        </div>
    );
};

// Пример инициализации данных сделки
export const DealInitializer: React.FC<{ dealId: number }> = ({ dealId }) => {
    const { setDeal, setDealId } = useDeal();

    React.useEffect(() => {
        // Устанавливаем ID сделки
        setDealId(dealId);
        
        // Здесь можно загрузить данные сделки и установить их
        // setDeal(dealData);
    }, [dealId, setDeal, setDealId]);

    return null;
}; 