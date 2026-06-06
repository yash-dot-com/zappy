import OpenAI from "openai"
import readline from "readline"
import dotenv from "dotenv"
import read_folder_content from "./utils/read_folder_content.js"
import get_current_working_directory from "./utils/get_current_working_directory.js"
import get_auth_files_content from "./utils/get_auth_files_content.js"
import fs from "fs/promises"
import path from "path"
import z from "zod"
import type z4 from "zod/v4"
import {zodToJsonSchema} from "zod-to-json-schema"

dotenv.config()

const apiKey: string = process.env.GROQ_API!
if(!apiKey){
    throw new Error("set api key")
}

const client = new OpenAI({
  apiKey,
  baseURL: "https://api.groq.com/openai/v1"
})

const important_things : any = [];

const get_important_memory = () =>{
    if(!important_things.length) return "no memory saved"
    return {important_things}
}

const set_important_memory = (memory :string) => {
    important_things.push(memory)
    return "memory saved successfully"
}

const delete_important_memory = (memory: string) => {
    important_things.filter((mem:string) => mem !== memory)
    return "deleted memory successfully"
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const emailSchema = z.object({
    name: z.string().describe("name recepient"),
    content: z.string().describe("content of email"),
    senderEmail : z.string().describe("sender's email"),
    recieverEmail: z.string().describe("receiver email")
})

type emailType = z.infer<typeof emailSchema>
const jsonSchema = zodToJsonSchema(emailSchema, "emailSchema");

const AVAILABLE_TOOLS = `
    available tools 
    read_folder_content : used to read folder contents. 
`

const SYSTEM_PROMPT: string = `You are an AI agent that communicates exclusively through structured JSON. 

Current Date and Time: \\\${getCurrentTimeInTimeZone("Asia/Kolkata")}

Rules:
1. Output ONLY a valid JSON object. Do not include markdown code blocks (such as \\\`\\\`\\\`json), conversational filler, or explanations.
2. Choose exactly one destination: "user" (for direct communication) or "system" (for executing tools). Never mix fields between the two formats.
3. If an invalid or unknown tool is requested, or if parameters are missing, routing must fallback to the "user" format to explain the issue.
4. you can store important details, facts and decision using special memory functions, make sure to analyze the conversation and put or update specific important 
    parts that seems important for user in a very summarized but understandable way for you, to make critical decisions or enhance user experience. 

Available Tools:
* get_auth_endpoint (No arguments required)
* read_folder_content (No arguments required)
* get_current_working_directory (No argument required)
* get_auth_files_content : (No arguments required) - returns the content of files required for testing auth endpoints. 
* get_important_memory : (No arguments required) - get all important facts that you've stored
* set_important_memory : object with 2 keys => {about: string, memory:string} - summarized version of memory
* delete_important_memory : (memory: string) - to update, get memory, and then invoke delete function.
* read_file - takes single argument "filepath" : a string : read and return content of a file,requires path of the file as input
* get_path - takes single arg "filename" : a string) : returns the path of the file using its name.
* get_project_structure : (No argument required) - get all the information about files, you can use this recursively to investigate folders inside folders.
* 

JSON Output Formats:

[Case 1: Interacting with the User]
{
  "to": "user",
  "message": "<Your message or response text goes here>"
}

[Case 2: Interacting with the System \\/ Calling a Tool]
{
  "to": "system",
  "function_call": {
    "function": "<Exact function name with correct casing>",
    "arguments": []
  }
}`;

const read_file = async (filepath:string) => {
    const content = await fs.readFile(filepath,"utf-8")
    return content
}

const get_path = async (filename: string) => {
    const filepath = path.resolve(filename)
    return filepath
}

const get_project_structure = async() => {
    const content = await fs.readdir("./", {withFileTypes:true})
    return JSON.stringify(content)
}

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
    "read_folder_content":read_folder_content,
    "get_current_working_directory":get_current_working_directory,
    "get_auth_files_content":get_auth_files_content,
    "get_important_memory": get_important_memory,
    "set_important_memory": set_important_memory,
    "delete_important_memory":delete_important_memory,
    "read_file":read_file,
    "get_path":get_path,
    "get_project_structure":get_project_structure,
    // "read_file_content":,
    // "write_to_file",
    // "execute_command",
} as any 

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

        console.log(fn, args)

        // call the function 
        const functionResponse = await function_map[fn](...args)

        await process_llm_response(await send_to_llm(`function response : `+ functionResponse))
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
