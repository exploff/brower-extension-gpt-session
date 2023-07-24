export { };

declare global {
    interface Window {
        chrome: any;
    }
}

export interface ResponseConversation {
    data: {
        message: {
            content: {
                parts: [""]
            }
        }
    }
}