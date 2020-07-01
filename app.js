const express = require('express')
const app = express()

const AWS = require('aws-sdk')
const jwt = require("jsonwebtoken")
const bodyparser = require("body-parser")

const db = require("./database")

const multer = require("multer")
const fileStorage = multer.memoryStorage()
const upload = multer({storage: fileStorage})

app.use(bodyparser.urlencoded({extended: false}))
app.use(bodyparser.json())

const credentials = new AWS.Credentials({
    accessKeyID: 'AKIAJD7EZCOE2DQJTNWQ',
    secretAccessKey:'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'
})
const s3 = new AWS.S3({
    credentials: credentials,
    region: 'eu-west-1b'
})

const jwtSecret = "cloudServicesIsFun"

app.post("/login", function(request, response){
    const grant_type = request.body.grant_type
    const username = request.body.username
    const password = request.body.password

    if(grant_type != "password"){
        response.status(400).json({error: "unsupported_grant_type"})
        return
    }

    db.getUserWithUsername(username, function(error, users){
        if(error){
            response.status(500).end()
        }else{

            if(users.length == 0){
                response.status(404).json({error: "No user found"})
				return
            }

            const user = users[0]
            if(password == user.Password){
                //Login successfull.
                const userToken = jwt.sign({
                    userID: user.UserID
                }, jwtSecret)

                response.status(200).json("JWT: "+ userToken)
            }
            else{
                response.status(400).json({error: "invalid_grant"})
            }

        }
    })

})

var port = process.env.PORT || 8080
server.listen(port)