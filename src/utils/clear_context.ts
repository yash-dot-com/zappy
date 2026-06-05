export default async function clear_context(messages,SYSTEM_PROMPT: string){
    messages.length = 0
    messages.push({
        "role":"system",
        "content":SYSTEM_PROMPT
    })
    return "context cleared successfully!"
}