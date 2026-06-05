endpoint : GET /users/:id/post?title=birthday
description : get all the registered users 
requires-auth : true
requires-payload : false
query-params : nil / [title]
route-params : nil / [id]
expected-response-type : array of objects in JSON format 
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


