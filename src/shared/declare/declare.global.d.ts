export declare global {
    export interface Window {
        gtag?: (
            event: string,
            action: string,
            params: Record<string, unknown>,
        ) => void;
    }
}