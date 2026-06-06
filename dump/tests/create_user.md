method : POST
endpoint : /users
description : create a single user 
requires-auth : true
session-type : JWT cookie 
requires-payload : true
query-params : nil / [title, ]
route-params : nil []
headers : {
  "header-one" : "value",
  "header-two" : "value",
}
expected-response-type : single objects in JSON format 
expected-response-structure : 
[
  {
    "username" : "string",
    "tag" : "string",
    "email" : "string",
    "followers" : "number",
    "following" : "number",
  },
  ...
]
