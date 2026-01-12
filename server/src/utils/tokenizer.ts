let encoding: any;

export const countTokens = async (text: string): Promise<number> => {
    if (!text) return 0;
    try {
        if (!encoding) {
            const { getEncoding } = await import("js-tiktoken");
            encoding = getEncoding("cl100k_base");
        }
        return encoding.encode(text).length;
    } catch (e) {
        console.warn("Token counting failed, using fallback", e);
        // Fallback: 1 token ~= 4 chars
        return Math.ceil(text.length / 4);
    }
};
