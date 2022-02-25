@app
remix-aws-stack

@http
/*
  method any
  src server

@static

@tables
user
  pk *String  # email

password
  pk *String # user's email

note
  pk *String  # user's email
  sk **String # noteId
