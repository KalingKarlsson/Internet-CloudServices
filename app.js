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

/*
app.get('/addpost1', (req , res) => {
    let post = {UserID: 'Post one', username:'This is a post'};
    let sql = 'INSERT INTO Users SET ?';
    let query = db.query(sql,post,(err,result) => {
        if(err) throw err;
        console.log(result);
        res.send('Post 1');
    });
});
*/

const users = [{
    id: 1,
    name: "Ludwig"
},
 {
    id: 2,
    name: "Anton"
}, 
{
    id: 3,
    name: "PLG"
}]

const bodyParser = require('body-parser')
const {
    HttpRequest,
    FSx
} = require('aws-sdk')
app.use(bodyParser.json())
app.post('/users', function (request, response) {
    const newUser = request.body
    newUser.userID = users[users.length - 1].userID + 1
    users.push(newUser)
    response.setHeader("Location", "/users/" + newUser.userID)
    response.status(201).end()
})


app.get('/users', function (request, response) {
    response.status(200).json(users)
})

app.get('/delete', function (request, response) {
    response.status(200).json(users)
})

app.get('/users/:id', function (request, response) {
    const id = parseInt(request.params.userID)
    const user = users.find(users => users.userID == id)
    if (user) {
        const id = request.params.id;
        response.status(200).json(user)
    } else {
        response.status(404).end()
    }
})

app.put('/users/:id', function (request, response) {
    const id = parseInt(request.params.UserID)
    const updatedUser = request.body
    const index = users.findIndex(users => users.userID == id)
    if (index == -1) {
        response.status(404).end()
    } else {
        users[index] = updatedUser
        response.status(204).end()
    }
})

/*
var port = process.env.PORT || 8080
server.listen(port)
*/

app.get('/', function (req, res) {
    res.sendFile(__dirname  + "/home.html")
})

app.get('upload/:itemID', function (request, response) {
    console.log("FIle sent!");
})

app.listen("8080", () => {
  console.log("Server Started on port 8000");
});