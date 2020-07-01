const mysql = require("mysql")

const databaseConnection = mysql.createConnection({
	host: "antluds-database.cmympwzm8wlp.eu-west-1.rds.amazonaws.com",
	user: "adminal",
	password: "antlud123",
	database: "antludsDatabase1"
});

databaseConnection.connect(function(err){
	if (err) throw err;
})
