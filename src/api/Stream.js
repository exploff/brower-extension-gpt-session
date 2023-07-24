
export function parseStreamResult(text) {
    if (!text || text === "[DONE]"){
        return { finished: true , data: ""};
    }

    return {finished: false, data: JSON.parse(text)};
}

export async function readStreamToEnd(stream) {
    const reader = stream.getReader();
    let result = '';

    while (true) {
        const { done, value } = await reader.read();

        if (done) {
            break;
        }

        const chunk = new TextDecoder().decode(value);
        result += chunk;
        
    }
    return result;
}