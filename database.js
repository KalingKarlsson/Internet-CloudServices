const mysql = require("mysql")

const connection = mysql.createConnection({
	host: "antluds-database.cmympwzm8wlp.eu-west-1.rds.amazonaws.com",
	user: "adminal",
	password: "antlud123",
	database: "antludsDatabase1"
})

// Tables
function createUserTable(){
	const tableQuery = `CREATE TABLE IF NOT EXISTS Users (
		UserID INT AUTO_INCREMENT PRIMARY KEY, 
		Username VARCHAR(25) NOT NULL UNIQUE,
		Password VARCHAR(25) NOT NULL
		)`;

		connection.query(tableQuery, function(error, result){
			if(error){
				throw error;
            }
		})
}

function createImageTable(){
	const imagesTableQuery = `CREATE TABLE IF NOT EXISTS Images (
		ImgID INT AUTO_INCREMENT PRIMARY KEY,
		OwnerID INT NOT NULL,
		ImgName VARCHAR(25) NOT NULL,
		Photo VARCHAR(50) NOT NULL,
		Caption TEXT,
		FOREIGN KEY (OwnerID) REFERENCES Users(UserID) ON DELETE CASCADE
	)`;
	connection.query(imagesTableQuery, function(error, result){
		if (error){
			throw error;
		}
	})
}

function createLikerTable(){
	const likerTableQuery = `CREATE TABLE IF NOT EXISTS Liker (
		LikerID INT NOT NULL,
		ImgID INT NOT NULL,
		FOREIGN KEY (ImgID) REFERENCES Images(ImgID) ON DELETE CASCADE,
		FOREIGN KEY (LikerID) REFERENCES Users(UserID) ON DELETE CASCADE
	)`;

	connection.query(likerTableQuery, function(error, result){
		if(error){
			throw error;
		}
	});
}

//User info
exports.createUser = function(newUser, callback ){
	const query = "INSERT INTO Users (Username, Password) VALUES (?,?)"
	const values = [newUser.username, newUser.password]
	connection.query(query, values, function(error, user){
		callback(error, user)
	})
}
exports.getUserWithID = function(id, callback){
	const query = "SELECT * FROM Users WHERE UserID = ?"
	connection.query(query, id, function(error, user){
		callback(error, user)
	})
}
exports.getUserWithUsername = function(username, callback){
	const query = "SELECT * FROM Users WHERE Username = ?"
	connection.query(query, username, function(error, user){
		callback(error, user)
	})
}
exports.changeUserPassword = function(user, callback){
	const query = "UPDATE Users SET Password = ? WHERE UserID = ?"
	const values = [user.password, user.userID]
	connection.query(query, values, function(error, user){
		callback(error, user)
	})
}
exports.deleteUser = function(id, callback){
	const query = "DELETE FROM Users WHERE UserID = ?"
	connection.query(query, id, function(error, deletion){
		callback(error, deletion)
	})
}

//Images
exports.createImage = function(newImage, callback){
	const query = "INSERT INTO Images (OwnerID, ImgName, Caption) VALUES (?,?,?)"
	const values = [ newImage.ownerID, newImage.imgName, newImage.caption]
	connection.query(query, values, function(error, image){
		callback(error, image)
	})
}
exports.getImageWithId = function(id, callback){
	const query = "SELECT * FROM Images WHERE ImgID = ?"
	connection.query(query,id, function(error, image){
		callback(error, image)
	})
}
exports.changeImage = function(image, callback){
	const query = "UPDATE Images SET  imgName = ?, Caption = ? WHERE ImgID = ?"
	const values = [ image.imgName, image.caption, image.imgID]
	connection.query(query, values, function(error, alteredImg){
		callback(error, alteredImg)
	})
}
exports.deleteImage = function(ID, callback){
	const query = "DELETE FROM Images WHERE ImgID = ?"
	connection.query(query, ID, function(error, deletion){
		callback(error, deletion)
	})
}
exports.getUsersImages = function(id, callback){
	const query = "SELECT * FROM Images WHERE OwnerID = ?"
	connection.query(query,id,function(error, data){
		callback(error, data)
	})
}
exports.getOwnerIdFromImage = function(id, callback){
	const query = "SELECT * FROM Images WHERE ImgID = ?"
	connection.query(query, id, function(error, image){
		callback(error, image[0].OwnerID)
	})
}

exports.connectFileToImage = function(fileName, imgID, callback){
	const query = "UPDATE Images SET Photo = ? WHERE ImgID = ?"
	const values = [fileName,imgID]
	connection.query(query, values, function(error, resp){
		callback(error, resp)
	})
}

//Likes
exports.addLike = function(newLike, callback ){
	const query = "INSERT INTO Liker (ImgID, LikerID) VALUES (( SELECT ImgID FROM Images WHERE ImgID = ? ),?)"
	const values = [newLike.imgID, newLike.likerID]
	connection.query(query, values, function(error, like){
		callback(error, like)
	})
}

exports.getLike = function(id, callback ){
	const query = "SELECT * FROM Liker WHERE LikerID = ?"
	connection.query(query, id, function(error, like){
		callback(error, like)
	})
}

exports.deleteLike = function(ID, callback){
	const query = "DELETE FROM Liker WHERE LikerID = ?"
	connection.query(query, ID, function(error, deletion){
		callback(error, deletion)
	})
}

exports.getOwnerIdFromLike = function(LikeID, callback){
	const query = "SELECT * FROM Liker WHERE LikerID = ?"
	connection.query(query, LikeID, function(error, like){
		console.log(like[0].LikerID)
		callback(error, like[0].LikeID)
	})
}

exports.connectLikerToImages = function(likeID, imgID, callback){
	const firstQuery = "UPDATE Images SET LikerID = ? WHERE LikerID = ?"
	connection.query(firstQuery, likeID,function(error, deletion){
		if(!error){
			const query = "UPDATE Images SET LikerID = ? WHERE ImgID = ?"
			const values = [likeID, imgID]
			connection.query(query, values,function(error, change){
			callback(error, change)
			})
		}
		else{
			callback(error, deletion)	
		}
	})
	
}

//Admin api
exports.changeDB = function(query, callback){
	connection.query(query, function(error, resp){
		callback(error, resp)
	})
}

//Return all users in database
exports.getAllUsers = function(callback){
	connection.query("SELECT * FROM Users", function(error, users){
		callback(error,users)
	})
}

//Return all Images in database
exports.getAllImages = function(callback){
	connection.query("SELECT * FROM Images", function(error, images){
		callback(error,images)
	})
}


/*
var sql = "INSERT INTO Users (UserID, Username, Password) VALUES ?";
var values = [
  ['1','John', 'Highway71'],
  ['2','Peter', 'Lowstreet4'],
  ['3','Amy', 'Applest652'],
  ['4','Hannah', 'Mountain21'],
  ['5','Michael', 'Valley345'],
  ['6','Sandy', 'Oceanblvd2'],
  ['7','Betty', 'GreenGrass1'],
  ['8','Richard', 'Skyst331'],
  ['9','Susan', 'Oneway98'],
  ['10','Vicky', 'YellowGarden2'],
  ['11','Ben', 'ParkLane38'],
  ['12','William', 'Centralst954'],
  ['13','Chuck', 'MainRoad989'],
  ['14','Viola', 'Sideway1633']
];
connection.query(sql, [values], function (err, result) {
  if (err) throw err;
  console.log("Number of records inserted: " + result.affectedRows);
});
*/


createUserTable();
createImageTable();
createLikerTable();
