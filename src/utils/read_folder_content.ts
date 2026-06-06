import process from "process"
import fs from "fs/promises"

export default async function read_folder_content(){
    const tests_folder_path = process.cwd()
    const folder_content = await fs.readdir(tests_folder_path+"/tests") 
    return folder_content
}