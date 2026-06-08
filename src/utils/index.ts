export const toInt = (value: string | undefined): number | undefined => {
    const parsed = Number.parseInt(value ?? "", 10);
    if (Number.isNaN(parsed)) return;
    return parsed;
};

export const toBigInt = (id: string | number | null | undefined): bigint | undefined => {
    try {
        if (typeof id === "number" || typeof id === "string") {
            const value = BigInt(id);
            if (value <= 0n) return undefined;
            return value;
        }
    } catch {
        // ignore
    }
    return undefined;
};
