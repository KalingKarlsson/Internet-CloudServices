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

const jwtSecret = "cloudServicesIsFun"


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
app.get('/Users/:id', function(req, res) {

	dbConnection.getUserWithID(req.params.id, function (error, user) {
		if (error) {
			res.status(400).json(error)
		} else {
			res.status(200).json(user)
		}

	})

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


const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`)
})