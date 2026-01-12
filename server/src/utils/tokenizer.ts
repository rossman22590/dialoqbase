import { getEncoding } from "js-tiktoken";

const encoding = getEncoding("cl100k_base");

export const countTokens = (text: string): number => {
    if (!text) return 0;
    try {
        return encoding.encode(text).length;
    } catch (e) {
        console.warn("Token counting failed, using fallback", e);
        // Fallback: 1 token ~= 4 chars
        return Math.ceil(text.length / 4);
    }
};
