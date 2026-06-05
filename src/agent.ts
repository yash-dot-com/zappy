import {Groq} from "groq-sdk"
import readline from "readline"
import dotenv from "dotenv"
dotenv.config()

const apiKey: string = process.env.GROQ_API!
if(!apiKey){
    throw new Error("set groq api key")
}

const client = new Groq({
    apiKey,
})

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const SYSTEM_PROMPT: string = `
you strictly respond in the specified format in correct JSON format only.
    you are an api endpoint testing expert, you are always interacting with a system. you have the ability to do function calls, your response can either be a reply to the user, or to the system to do a function call, but you cannot reply to the user and system in the same single response or turn. you need to take multiple turns to interact with system one turn - one function call, or one turn - one message to user. 
    
    so your response should be in JSON format as specified: 
    
    {
        "to": "",
        "message": "",
        "function_call":{
            "function": "",
            "arguments": []
        }
    }

    I will explain the keys - 
    1. to - string, values could be system or user, depending on who you are replying to.
    2. message - plain text message, use this only if you are replying to the user not system
    3. function_call - use this only if you are replying to the system, it is a JSON object that determines which function to call and its arguments
    4. a. function - name of the function 
    4. b. arguments - an array of arguments for the funciton call where each array itme is the value for the argument

    Available Functions - 
    
    1. function name : check_appointment_availability
    arguments : datetime {ISO 8601 format,  UTC timezone}, name {string}, email {string}

    2. function name : schedule_appointment
    arguments : datetime {ISO 8601 format,  UTC timezone}, name {string}, email {string}

    3. function name :  delete_appointment 
    arguments : datetime {ISO 8601 format,  UTC timezone}, name {string}, email {string}

    current time and date for you is ${getCurrentTimeInTimeZone("Asia/Kolkata")}
`
const systemPrompt = {
    role : "system",
    content: SYSTEM_PROMPT,
}

// get current date and time function for LLM
function getCurrentTimeInTimeZone(timezone: string){
    return new Intl.DateTimeFormat("en-US",{
        timeZone: timezone,
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
    }).format(new Date())
}

const messages = [systemPrompt] as any 

// creating a function for LLM 
function check_appointment_availability(datetime: string){
    // logging tool use with argument 
    console.log("calling : check_appointment_availability", datetime)
    return true 
}

function schedule_appointment(datetime: string, name: string, email: string){
    console.log("calling : schedule_appointment",datetime, name, email)
    return true
}

function delete_appointment(datetime:string, name: string, email:string){
    console.log("calling : delete_appointment", datetime, name, email)
    return true
}

// mapping functions to output string from LLM 
// @ts-ignore
const function_map = {
    "check_appointment_availability" : check_appointment_availability,
    "schedule_appointment" : schedule_appointment, 
    "delete_appointment" : delete_appointment,
}

// process LLM response 
async function process_llm_response(response: any){
    // parse the json response from LLM 
    // if role : user -> return simple string output
    // if role : system -> execute the function with arguments
    const parsedJson = JSON.parse(response)

    if(parsedJson.to === "user"){
        console.log(parsedJson.message)
    }else if(parsedJson.to === "system"){
        // get function name and arguments from the parsedJson
        const fn = parsedJson.function_call.function
        const args = parsedJson.function_call.arguments

        // call the function 
        const functionResponse = function_map[fn](...args)

        await process_llm_response(await send_to_llm(`function response : `+ functionResponse ? 'true' : 'false'))
    }
}

async function send_to_llm(content: string){
    // we are trying to keep a track of conversation, 
    // push user message into array
    messages.push({
        role: "user",
        content : content,
    })

    // send array to gpt for processing
    const response = await client.chat.completions.create({
        messages,
        model:"openai/gpt-oss-120b",
        reasoning_effort: "high",
    })

    // add gpt's response to this array as well 
    messages.push(response.choices[0]?.message)

    // return the response for printing
    return response.choices[0]?.message.content
}



async function main(){

    while(true){
        const input:string = await new Promise((resolve)=>{
        rl.question("say something : ", resolve)})

        // check the response : user / system 
        const response = await send_to_llm(input)

        // if system - perform function call and feed the output to LLM 
        await process_llm_response(response)
    }
}

main()
