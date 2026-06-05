// prints the whole stack of conversation 
export default function print_conversation(messages:any){
    if(messages.length === 0){
        return "empty array"
    }
    
    for(const message of messages){
        console.log(message)
    }
}