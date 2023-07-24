import { parseStreamResult, readStreamToEnd } from './Stream';

const baseUrl = "https://chat.openai.com/backend-api";

const prompt = "Give me the answers to the following questions,\n";
const endPrompt = "\nIgnore questions that don't fit the context. I want very short answers it's important."

export async function getToken() {
    let tokenResponse = await fetch('https://chat.openai.com/api/auth/session');

    if (tokenResponse.status === 403)
        throw "CLOUDFLARE";
    let jsonToken = await tokenResponse.json();
    if (jsonToken.accessToken)
        return jsonToken.accessToken;
    throw "UNAUTHORIZED"
}


export async function fetchModels(token) {
    let modelsResponse = await localFetch({
        method: "GET",
        path: `${baseUrl}/models`,
        headers: getRequestHeader(token)
    });
    return modelsResponse.models;
}


async function localFetch(informations, type = "json") {

    let data = informations.body ? JSON.stringify(convertToSnakeCase(informations.body)) : null;
    console.log(data)
    let response = await fetch(informations.path, {
        method: informations.method,
        headers: informations.headers,
        body: data
    })

    if (response.status === 403) {
        throw "CLOUDFLARE";
    }
    if (response.ok) {
        if (type === "json") {
            return response.json();
        } else if (type === "stream") {
            return response.body;
        }
    }


}

//TODO : GET conversation ID 
export async function fetchResponse(token, models, message = "Bonjour") {
    let modelName = getModelName(models);
    let response = await localFetch({
        method: "POST",
        path: `${baseUrl}/conversation`,
        headers: getRequestHeader(token),
        return_origin_response: !0,
        body: {
            model: modelName,
            action: "next",
            messages: [
                {
                    role: "user",
                    content: {
                        content_type: "text",
                        parts: [ prompt + message + endPrompt]
                    }
                }
            ],
            conversation_id: "57182791-6aca-43c2-9d16-2e993810372b",
            parent_message_id: "0c5f1234-2654-4301-b504-8dd014dcaabe"
        }
    }, "stream")

    let result = await readStreamToEnd(response);
    
    console.log("Value received")
    let jsonResult = result.split(/\r?\n\r?\n/);
    let completedResult = {}

    for(let value of jsonResult){
        let val = value.replace(/^data: /, "");
        try {
            val = parseStreamResult(val);
        } catch (error) {
            console.log("ERROR", error);
            console.log("VALUE", val)
        }
        if (!val.finished) {
            completedResult = val;
        }
    }

    return completedResult;
}



function getRequestHeader(t) {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${t}`
    }
}

function getModelName(models) {
    return models[0].slug;
}
function convertToSnakeCase(obj) {
    const snakeCaseObj = {};

    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            const snakeCaseKey = key.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);
            const value = obj[key];
            if (typeof value === 'object' && !Array.isArray(value)) {
                snakeCaseObj[snakeCaseKey] = convertToSnakeCase(value);
            } else {
                snakeCaseObj[snakeCaseKey] = value;
            }
        }
    }

    return snakeCaseObj;
}
