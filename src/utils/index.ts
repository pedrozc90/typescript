export const toInt = (value: string | undefined): number | undefined => {
    const parsed = Number.parseInt(value ?? "", 10);
    if (Number.isNaN(parsed)) return;
    return parsed;
};
