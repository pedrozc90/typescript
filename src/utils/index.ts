export const toInt = (value: string | undefined): number | undefined => {
    const parsed = Number.parseInt(value ?? "", 10);
    if (Number.isNaN(parsed)) return;
    return parsed;
};

export const toBigInt = (id: string | number): bigint | null => {
    try {
        const value = BigInt(id);

        if (value <= 0n) {
            return null;
        }

        return value;
    } catch {
        return null;
    }
};