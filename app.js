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
    region: 'eu-west-1'
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

    app.post("/images", function(request, response){
    
        const userID = request.body.userID
        const userLoggedIn = isUserVerified(request, userID)
        if(userLoggedIn){
    
            const image = {
                ownerID:request.body.userID,
                imgName:request.body.imgName,
                caption:request.body.caption
            }
    
            db.createImage(image, function(error, img){
                if(error){
                    response.status(400).json('To create an image you require: "userID":"YOUR ID HERE", "imgName":"NEW IMAGE NAME HERE", "Caption":"YOUR CAPTION HERE')
                }else{
                    db.getImageWithId(img.insertId, function(error, image){
                        if (error){
                            response.status(201).json("Img Created")
                        }else{
                            response.status(201).json(image)
                        }
                    })
                    
                }
            })
    
        }else{
            response.status(401).end()
        }
    })

})

const PORT = process.env.PORT || 8080
app.listen(PORT, () =>{
    console.log(`Listening on port ${PORT}`)
})