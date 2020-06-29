const http = require('http')
const fs = require('fs')
const express = require('express')
const { response } = require('express')
const app = express()

app.get('/hello',function(request, response){
    response.send("Hello")
})


/*
const server = http.createServer(function(req, res){

    if(req.method == "GET"){
        "/home.html"
        const filename = req.url.substr(1)
        fs.readFile("pages/"+filename, "utf8", function(err, content){
            if(err){
                res.statusCode = 404
                res.setHeader("Conntent-type", "text/plain")
                res.end("<h1>not error</h1><p>...</p>")
            }else{
                res.statusCode = 200
                res.setHeader("Conntent-type", "text/plain")
                res.end(content)
            }
        })
    }
    else{
        res.statusCode = 404
        res.setHeader("Conntent-type", "text/plain")
        res.end("<h1>BAD</h1><p>Hej</p>")
    }
})*/

var port = process.env.PORT || 8080
server.listen(port)