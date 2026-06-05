// to find out auth.md and auth.json file from tests folder and establish cookies.txt for upcoming post requests
import fs from "fs/promises"

export async function read_auth_file(){
    try{
        const auth_md_content = await fs.readFile("./tests/auth.md","utf-8");
        const auth_json_content = await fs.readFile("./tests/auth.json","utf-8")

        return {
            md: auth_md_content,
            json: auth_json_content
        }

    }catch(error: any){
        if(error.code === "ENOENT"){
            console.log(error.message)
            return `file not found : ${error.path}`
        }

        if(error.code === "EACCES"){
            console.log(error.message)
            return `permission to read denied : ${error.path}`
        }

        console.log(error.message)
        return `unexpected error : ${error.message} `
    }
}

