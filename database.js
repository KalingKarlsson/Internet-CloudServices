const mysql = require("mysql");
const express = require('express')
const app = express()


const databaseConnection = mysql.createConnection({
  host: "antluds-database.cmympwzm8wlp.eu-west-1.rds.amazonaws.com",
  user: "adminal",
  password: "antlud123",
  database: "antludsDatabase1",
});

// Tables
databaseConnection.connect(function (err) {
  if (err) {
    throw err;
  } else {
    console.log("connected to DB was successful");
  }
});

function createUserTable() {
  const tableQuery = `CREATE TABLE IF NOT EXISTS Users (
		UserID INT AUTO_INCREMENT PRIMARY KEY, 
		Username VARCHAR(25) NOT NULL UNIQUE,
		Password VARCHAR(25) NOT NULL
		)`;

  databaseConnection.query(tableQuery, function (error, result) {
    if (error) {
      throw error;
    }
  });
}

function createImageTable() {
  const imagesTableQuery = `CREATE TABLE IF NOT EXISTS Images (
		ImgID INT AUTO_INCREMENT PRIMARY KEY,
		OwnerID INT NOT NULL,
		ImgName VARCHAR(25) NOT NULL,
		Caption TEXT,
		FOREIGN KEY (OwnerID) REFERENCES Users(UserID) ON DELETE CASCADE	
	)`;

  databaseConnection.query(imagesTableQuery, function (error, result) {
    if (error) {
      throw error;
    }
  });
}

function createLikerTable() {
  const likerTableQuery = `CREATE TABLE IF NOT EXISTS Liker (
		LikerID INT NOT NULL,
		ImgID INT NOT NULL,
        FOREIGN KEY (ImgID) REFERENCES Images(ImgID) ON DELETE CASCADE,
        FOREIGN KEY (LikerID) REFERENCES Users(UserID) ON DELETE CASCADE
	)`;

  databaseConnection.query(likerTableQuery, function (error, result) {
    if (error) {
      throw error;
    }
  });
}
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

app.post('/submit',function(req,res)
{
  
  const users = users.find(users => users.userID == id)
  var mysql = "INSERT INTO accounts ? '"+req.body.username+ VALUES;

connection.query(mysql, [values], function (err, result) {
if (err) throw err;
console.log("Number of records inserted: " + result.affectedRows);
});
})

createUserTable();
createImageTable();
createLikerTable();
