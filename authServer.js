const express = require("express");
const jwt = require("jsonwebtoken");
const verifyToken = require("./middleware/auth");
const app = express();
require("dotenv").config(); //read file .env to use variables

//Database
let users = [
	{
		id: 1,
		username: "henry",
		refreshToken: null,
	},
	{
		id: 2,
		username: "jim",
		refreshToken: null,
	},
];

//Action App
app.use(express.json());

const generateToken = (payload) => {
	const { id, username } = payload;
	const accessToken = jwt.sign({ id, username }, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: "5m", // gia hạn token
	});

	const refreshToken = jwt.sign({ id, username }, process.env.REFRESH_TOKEN_SECRET, {
		expiresIn: "1h",
	});

	return { accessToken, refreshToken };
};

const updateRefreshToken = (username, refreshToken) => {
	users = users.map((user) => {
		if (user.username === username)
			return {
				...user,
				refreshToken,
			};
		return user;
	});
};
app.post("/login", function (req, res) {
	const username = req.body.username;
	const user = users.find((user) => user.username === username);

	if (!user) return res.sendStatus(401);
	const tokens = generateToken(user);
	updateRefreshToken(username, tokens.refreshToken);

	console.log(users);
	res.json(tokens);
});

app.post("/token", function (req, res) {
	const refreshToken = req.body.refreshToken;
	if (!refreshToken) return res.sendStatus(401);

	const user = users.find((user) => user.refreshToken === refreshToken);
	if (!user) return res.sendStatus(403);

	try {
		jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

		const tokens = generateToken(user);
		updateRefreshToken(user.username, tokens.refreshToken);
		res.json(tokens);
	} catch (error) {
		console.log(error);
	}
});

app.delete("/logout", verifyToken, function (req, res) {
	const user = users.find((user) => user.id === req.userId );
	if (!user) return res.sendStatus(401);
	updateRefreshToken(user.username, null);

	console.log(users);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server started on " + PORT));
