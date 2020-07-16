const express = require('express')
const app = express()

const AWS = require('aws-sdk')
const jwt = require("jsonwebtoken")
const bodyparser = require("body-parser")

const dbConnection = require("./database")

const multer = require("multer")
const fileStorage = multer.memoryStorage()
const upload = multer({ storage: fileStorage })

app.use(bodyparser.urlencoded({ extended: false }))
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

// Login user
// POST /login
// Content-Type: application/x-www-form-urlencoded
// Body: grant_type=password&username=Alice&password=abc123
app.post("/login", function(request, response){
    const grant_type = request.body.grant_type
    const username = request.body.username
    const password = request.body.password

    if(grant_type != "password"){
        response.status(400).json({error: "unsupported_grant_type"})
        return
    }

    dbConnection.getUserWithUsername(username, function(error, users){
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

//Create new user
//skapar man samma igen så returnerar den 400 men vid näsa nya person så har den då skippat ett id nummer
//body = {" mer mera ,password": "1337lol"}

app.post("/Users", function(request,response){
    const newUser = { 
    username:request.body.username,
    password:request.body.password
    }
    dbConnection.createUser(newUser, function(error, user){
        if(error){
            response.status(400).end()
        }else{
            dbConnection.getUserWithID(user.insertId, function(error, createdUser){
                if(error){
                    response.status(201).json("User created")
                }else{
                    response.status(201).json(createdUser)
                }
            })
        }
    })
})

//get a user
//visar blankt om det inte finns någon på det id och säger code 304 not modified
app.get('/Users/:id', function (req, res) {
	const userID = req.params.id
	const userLoggedIn = isUserVerified(req, userID)
	if (userLoggedIn) {
		dbConnection.getUserWithID(req.params.id, function (error, user) {
			if (error) {
				res.status(400).json(error)
			} else {
				res.status(200).json(user)
			}
		})
	} else{
		res.status(401).end()
	}
})

//delete a user
app.delete('/Users/:id', function(req, res) {

	dbConnection.deleteUser(req.params.id, function (error, user) {
		if (error) {
			res.status(400).end()
		} else {
			res.status(200).json("Deleted succesfully ")
		}
	})
})

//Change a users password
//body = {"password": "1337lol"}
app.put("/Users/:id", function (request, response) {
	const alterUserPw = {
		userID: request.params.id,
		password: request.body.password
	}

	dbConnection.changeUserPassword(alterUserPw, function (error, resp) {
		if (error) {
			response.status(400).json(error)
		} else {
			dbConnection.getUserWithID(alterUserPw.userID, function (error, user) {
				if (error) {
					response.status(200).json("User changed.")

				} else {
					response.status(200).json(user);
				}
			})
		}
	})
})

//Verify token
//is kind of working i guess
// Content-Type: application/json
// Authorization: Bearer the.access.token
function isUserVerified(req, userID){
    const header = req.header("Authorization")
    const token = header.substr("Bearer ".length)
    
    let data = null

    try{
        data = jwt.verify(token, jwtSecret)
    }catch(e){
        console.log("Failed verification")
        return false // {validLogin : false, usersID: payload.userID} 
    }
    if(data.userID != req.params.id){
        console.log("Failed, tried to access wrong user file. ", data.userID , " - ", req.params.id)
        return false // {validLogin : false, usersID: payload.userID}
    }else{
        //Valid authorization
        console.log("Verified")
        return true // {validLogin : true, usersID: payload.userID}
    }
}


const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`)
})