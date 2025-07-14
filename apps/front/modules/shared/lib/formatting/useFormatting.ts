export const useFormatting = () => {
    return {
        formatCurrency: (amount: number, currency: string = '₽'): string => {
            return new Intl.NumberFormat('ru-RU').format(amount) + ' ' + currency;
        },

        formatPhone: (phone: string): string => {
            if (!phone) return '';
            // Убираем все кроме цифр
            const cleaned = phone.replace(/\D/g, '');
            // Форматируем как +7 (XXX) XXX-XX-XX
            if (cleaned.length === 11) {
                return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
            }
            return phone;
        },

        formatDate: (date: string | Date): string => {
            if (!date) return '';
            const d = new Date(date);
            return d.toLocaleDateString('ru-RU');
        },

        formatDateTime: (date: string | Date): string => {
            if (!date) return '';
            const d = new Date(date);
            return d.toLocaleString('ru-RU');
        },

        truncateText: (text: string, maxLength: number): string => {
            if (!text || text.length <= maxLength) return text;
            return text.slice(0, maxLength) + '...';
        },

        capitalizeFirst: (text: string): string => {
            if (!text) return '';
            return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        }
    };
}; 