### problems that needs to be fixed 
- every function should send its response in text manner to the LLM for better processing.
- sometimes LLM outputs invalid JSON format
- must include some way to check how many times did the agent call the function
- put no_of_times_called in the function 
- and max tries option for safety as well
- after creating one agent end to end properly, you can build anything from scratch lmao

### Problem & Solution
<img width="756" height="512" alt="image" src="https://github.com/user-attachments/assets/5fda2bee-5f61-47d7-b9e1-8dc9bb81c382" />

### Vision
<img width="822" height="640" alt="image" src="https://github.com/user-attachments/assets/bf933d05-9a28-49b0-b023-0c37b478bb94" />

### First Design Draft 
<img width="1859" height="597" alt="image" src="https://github.com/user-attachments/assets/6d0221f2-cb2a-4228-9694-84adf47ed49f" />

### Second Design Draft 
```
VALIDATION
  - tests/ folder exists?        → no? stop
  - tests/ has files?            → no? stop
  - unknown file formats found?  → skip them, warn user

SETUP
  - ask for baseUrl
  - GET baseUrl/health           → not 200? stop

AUTH (if auth.md + auth.json exist)
  - execute auth endpoint first
  - extract + save cookies.txt
  - if auth fails:
      → write auth_result.md
      → skip requires-auth: true endpoints
      → continue with requires-auth: false endpoints

LOOP (remaining pairs in any order)
  try:
    1. parse .md and .json
    2. if requires-auth: true + no cookie → skip, warn
    3. send to agent → get curl command
    4. sanitize curl
    5. execute curl (attach cookies.txt if requires-auth: true)
    6. check status code         → fail? write result, continue
    7. check_structure(response) → fail? write result, continue
    8. check_type(response)      → fail? write result, continue
    9. write pass to name_result.md
  catch system error:
    stop, report

FILES
  tests/
    auth.md / auth.json
    name.md / name.json
    name_result.md    ← output
    cookies.txt       ← auto-generated
```

### Second Draft Decisions
- fixed naming conventions for authentication endpoint
- any one authentication point will be execute first in order to establish cookies.txt for all the other endpoints that requires it.
- more than one auth points may exists for example (signup / login) but at the end, we only care about JWT & therefore user can register any one of many auth endpoint for initial cookie setup.
- have thought through the failures and error cases for early returns as well.

### endpoint.md file schema definition
- need to think through
  
### endpoint.json file schema example
- need to think through
  
### naming conventions
- auth.md for single / main authentication endpoint
- for other endpoints : need to think through 

### future scope
- authentication other than simple payload
- session management without JWT token cookie (something else inplace of JWT cookies)
- need to think through this after initial prototype is done implementing. 

### Progress Tracking 
started : 3rd June 2026 <br>
designing : 4th June 2026 <br> 
