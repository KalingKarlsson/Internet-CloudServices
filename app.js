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
    accessKeyId: 'AKIAJS5RMGX6X77VHE5Q',
    secretAccessKey: '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'
})

const s3 = new AWS.S3({
    credentials: credentials,
    region: 'eu-west-1'
})

const jwtSecret = "cloudServicesIsFun"

// Login user
// POST /login
// Content-Type: application/x-www-form-urlencoded
// Body: grant_type=password&username=Alice&password=abc123
app.post("/login", function (request, response) {
    const grant_type = request.body.grant_type
    const username = request.body.username
    const password = request.body.password

    if (grant_type != "password") {
        response.status(400).json({ error: "unsupported_grant_type" })
        return
    }

    dbConnection.getUserWithUsername(username, function (error, users) {
        if (error) {
            response.status(500).end()
        } else {

            if (users.length == 0) {
                response.status(404).json({ error: "No user found" })
                return
            }

            const user = users[0]
            if (password == user.Password) {
                //Login successfull.
                const userToken = jwt.sign({
                    userID: user.UserID
                }, jwtSecret)

                response.status(200).json("JWT: " + userToken)
            }
            else {
                response.status(400).json({ error: "invalid_grant" })
            }
        }
    })
})

//Create new user
//skapar man samma igen så returnerar den 400 men vid näsa nya person så har den då skippat ett id nummer
//body = {" mer mera ,password": "1337lol"}
app.post("/Users", function (request, response) {
    const newUser = {
        username: request.body.username,
        password: request.body.password
    }
    dbConnection.createUser(newUser, function (error, user) {
        if (error) {
            response.status(400).end()
        } else {
            dbConnection.getUserWithID(user.insertId, function (error, createdUser) {
                if (error) {
                    response.status(201).json("User created")
                } else {
                    response.status(201).json(createdUser)
                }
            })
        }
    })
})

//get a user
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
    } else {
        res.status(401).end()
    }
})

//delete a user
app.delete('/Users/:id', function (req, res) {
    const userID = req.params.id
    const userLoggedIn = isUserVerified(req, userID)
    if (userLoggedIn) {
        dbConnection.deleteUser(req.params.id, function (error, user) {
            if (error) {
                res.status(400).end()
            } else {
                res.status(200).json("Deleted succesfully ")
            }
        })
    } else {
        res.status(401).end()
    }
})

//Change a users password
app.put("/Users/:id", function (request, response) {
    const alterUserPw = {
        userID: request.params.id,
        password: request.body.password
    }
    const userLoggedIn = isUserVerified(request, alterUserPw.userID)
    if (userLoggedIn) {
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
    } else {
        response.status(401).end()
    }
})

//Images functions
// Create image object
app.post("/images", function (request, response) {

    const userID = request.body.userID
    const userLoggedIn = isUserVerified(request, userID)
    if (userLoggedIn) {

        const images = {
            ownerID: request.body.userID,
            imgName: request.body.imgName,
            caption: request.body.caption
        }

        dbConnection.createImage(images, function (error, img) {
            if (error) {
                response.status(400).json('To create image data requires: "userID":"YOUR ID HERE", "imgName":"NEW IMG NAME HERE", "caption":"YOUR CAPTION HERE')
            } else {
                dbConnection.getImageWithId(img.insertId, function (error, image) {
                    if (error) {
                        response.status(201).json("Img Created")
                    } else {
                        response.status(201).json(image)
                    }
                })

            }
        })

    } else {
        response.status(401).end()
    }
})
//Get an image with specific ID
app.get("/images/:id", function (request, response) {
    const id = request.params.id
    let userID = null
    dbConnection.getOwnerIdFromImage(id, function (error, ownerID) {
        if (error) {
            response.status(400).end()
        } else {
            userID = ownerID

            const userLoggedIn = isUserVerified(request, userID)
            if (userLoggedIn) {
                dbConnection.getImageWithId(id, function (error, image) {
                    if (error) {
                        response.status(400).end()
                    } else {
                        response.status(200).json(image)
                    }
                })
            } else {
                response.status(401).end()
            }

        }
    })
})

//Change image data
app.put("/images/:id", function (request, response) {
    const userID = request.body.userID
    const userLoggedIn = isUserVerified(request, userID)
    if (userLoggedIn) {

        const alteredImage = {
            ownerID: userID,
            imgID: request.params.id,
            imgName: request.body.imgName,
            caption: request.body.caption,
        }

        dbConnection.changeImage(alteredImage, function (error, changedImg) {
            if (error) {
                response.status(400).json(error)
            } else {
                dbConnection.getImageWithId(alteredImage.imgID, function (error, image) {
                    if (error) {
                        response.status(200).json("Image data changed")
                    } else {
                        response.status(200).json(image)
                    }
                })
            }
        })

    } else {
        response.status(401).end()
    }

})

// get all images owned by a user
app.get("/Users/images/:userID", function (request, response) {
    const userID = request.params.userID
    const userLoggedIn = isUserVerified(request, userID)
    if (userLoggedIn) {
        dbConnection.getUsersImages(userID, function (error, data) {
            if (error) {
                response.status(500).end()
            } else if (data.length > 0) {
                response.status(200).json(data)
            } else {
                response.status(404).end()
            }
        })
    } else {
        response.status(401).end()
    }
})

//Delete an image object
app.delete("/images/:id", function (request, response) {
    dbConnection.getOwnerIdFromImage(request.params.id, function (error, ownerID) {
        if (error) {
            response.status(400).end()
        } else {
            const userLoggedIn = isUserVerified(request, ownerID)
            if (userLoggedIn) {
                dbConnection.deleteImage(request.params.id, function (error, resp) {
                    if (error) {
                        response.status(400).end()
                    } else {
                        response.status(200).json("Image deleted")
                    }
                })
            } else {
                response.status(401).end()
            }
        }
    })

})

//------------------------- Likes
//add a favorite
app.post("/favorites", function (request, response) {
    const newLike = {
        imgID: request.body.imgID,
        likerID: request.body.userID,
    }

    const userLoggedIn = isUserVerified(request, newLike.likerID)
    if (userLoggedIn) {
        dbConnection.addFavorite(newLike, function (error, like) {
            if (error) {
                response.status(400).json("Variables needed: imgID, userID that exists")
            } else {
                response.status(201).json("Favorite added")
            }
        })
    } else {
        response.status(401).end()
    }
})

//Gets all favorites from a user
app.get("/favorites/:likerID", function (request, response) {
    const likerID = request.params.likerID
    dbConnection.getFavorites(likerID, function (error, like) {
        if (error) {
            response.status(400).json(error)
        } else {
            const userLoggedIn = isUserVerified(request, likerID)
            if (userLoggedIn) {
                response.status(200).json(like)
            } else {
                response.status(401).end()
            }
        }
    })
})

//Deletes  all favorites from a user
app.delete("/favorites/:likerID", function (request, response) {

    const likeID = request.params.likerID

    const userLoggedIn = isUserVerified(request, likeID)
    if (userLoggedIn) {

        dbConnection.removeFavorites(likeID, function (error, resp) {
            if (error) {
                response.status(400).end()
            } else {
                response.status(200).json("Favorites removed")
            }
        })

    } else {
        response.status(401).end()
    }
})
//Upload file

app.post("/upload", upload.single("file"), function (request, response) {
    const userID = request.body.userID
    const imgID = request.body.imgID
    const file = request.file

    const userLoggedIn = isUserVerified(request, userID)
    if (userLoggedIn) {
        if (request.file) {
            file.originalname = userID + "_" + file.originalname
            var originalFileName = request.file.originalname
            dbConnection.connectFileToImage(originalFileName, imgID, function (error, resp) {
                if (error) {
                    response.status(400).json(error)
                } else {

                    var uploadParameters = {
                        Bucket: 'antlud-bucket-1',//specified amazon bucket
                        Key: originalFileName,//name to save file as
                        Body: request.file.buffer//file data to upload
                    };
                    s3.upload(uploadParameters, function (err) {
                        if (err) {
                            response.status(400).json(err)
                        }
                    })
                    response.status(200).json("Picture upload successful with name: " + originalFileName)
                }
            })
        }
    }
    else {
        response.status(401).json({ error: 'Unauthorized Access' })
    }
})

//works but can download other users photos
app.get("/download", (request, response) => {

    const userID = request.body.userID
    const file = request.body.fileName
    const userLoggedIn = isUserVerified(request, userID)

    if (userLoggedIn) {
        const fileToDownload = file

        const downloadParams = {
            Bucket: 'antlud-bucket-1',
            Key: fileToDownload
        }

        s3.getObject(downloadParams)
            .createReadStream()
            .on('error', function (err) {
                response.status(500).json({ error: err })
            }).pipe(response)
    } else {
        response.status(401).json({ error: 'Unauthorized Access' })
    }
})

//Verify token
// Content-Type: application/json
// Authorization: Bearer the.access.token
function isUserVerified(req, userID) {
    const header = req.header("Authorization")
    const token = header.substr("Bearer ".length)

    let data = null

    try {
        data = jwt.verify(token, jwtSecret)
    } catch (e) {
        console.log("Failed verification")
        return false // {validLogin : false, usersID: payload.userID} 
    }
    if (data.userID != userID) {
        console.log("Failed, tried to access wrong user file. ", data.userID, " - ", userID)
        return false // {validLogin : false, usersID: payload.userID}
    } else {
        //Valid authorization
        console.log("Verified")
        return true // {validLogin : true, usersID: payload.userID}
    }
}


const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})