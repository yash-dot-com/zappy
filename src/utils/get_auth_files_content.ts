import fs from "fs/promises"
import get_current_working_directory from "./get_current_working_directory.js"

export default async function get_auth_files_content(){
    const cwd = await get_current_working_directory()
    console.log(cwd)

    const auth_md_content = await fs.readFile("./tests/auth.md","utf-8")
    console.log(auth_md_content)

    const auth_json_content = await fs.readFile("./tests/auth.json","utf-8")
    console.log(auth_md_content)

    return {auth_json_content, auth_md_content}
}