endpoint : POST /users
description : create a single user  
requires-auth : false
session-type : JWT cookie 
requires-payload : true
query-params : nil
route-params : nil
expected-response-type : single objects in JSON format 
expected-response-structure : 
[
  {
    "username" : "yash",
    "tag" : "@ya$h",
    "email" : "y@gmail.com",
    "followers" : 29,
    "following" : 432,
  },
  ...
]
