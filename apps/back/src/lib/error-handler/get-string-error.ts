export function getStringError(error: any): string {
    const extractWhereFromStack = (stack?: string) => {
        if (!stack) return '';
        const stackLines = stack.split('\n').map((l) => l.trim());
        const target = stackLines.find(
            (l) => l.includes('/src/') || l.includes('src\\'),
        );
        if (!target) return stackLines[0] || '';
        // Typical formats:
        // at fn (C:\...\file.ts:12:34)
        // at C:\...\file.ts:12:34
        const match = target.match(/\((.*):(\d+):(\d+)\)/) ?? target.match(/(.*):(\d+):(\d+)/);
        if (match) {
            const filepath = match[1];
            const line = match[2];
            const col = match[3];
            return `${filepath}:${line}:${col}`;
        }
        return target;
    };
    if (error instanceof Error) {
        const name = error.name || 'Error';
        const message = error.message || String(error);
        const stack = typeof error.stack === 'string' ? error.stack : '';
        const where = extractWhereFromStack(stack);
        // const stackShort = stack ? (stack.length > 1200 ? stack.slice(0, 1200) + '…' : stack) : '';
        return [
            `name: ${name}`,
            `message: ${message}`,
            where ? `where: ${where}` : '',
            // stackShort ? `stack:\n${stackShort}` : '',
        ].filter(Boolean).join('\n');
    }
    if (typeof error === 'string') return error;
    if (Array.isArray(error)) {
        return error.join(', ');
    }
    if (typeof error === 'object') {
        try {
            return JSON.stringify(error);
        } catch {
            return String(error);
        }
    }
    return 'Неизвестная ошибка';
}
