export const useStatistics = () => {
    return {
        calculateTotalSum: (items: any[], priceField: string, quantityField: string) => 
            items.reduce((sum, item) => sum + ((item[priceField] || 0) * (item[quantityField] || 0)), 0),
        
        calculateCounts: (items: any[], filterFn: (item: any) => boolean) => 
            items.filter(filterFn).length,
        
        calculatePercentage: (part: number, total: number) => 
            total > 0 ? Math.round((part / total) * 100) : 0,
        
        calculateAverages: (items: any[], field: string) => {
            if (items.length === 0) return 0;
            const sum = items.reduce((acc, item) => acc + (item[field] || 0), 0);
            return Math.round(sum / items.length);
        }
    };
}; 