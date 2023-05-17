const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const verifyToken = require("./middleware/auth");
require("dotenv").config(); //read file .env to use variables

//Database
const users = [
	{
		id: 1,
		username: "henry",
	},
	{
		id: 2,
		username: "jim",
	},
];

const posts = [
	{
		userId: 1,
		post: "Post Henry",
	},
	{
		userId: 2,
		post: "Post Jim",
	},
];

//Action App
app.use(express.json());

app.get("/", verifyToken, function (req, res) {
	res.json(posts.filter((post) => post.userId === req.userId));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("Server started on " + PORT));
