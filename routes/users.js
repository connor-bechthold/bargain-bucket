const router = require("express").Router();
const User = require("../models/user-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../authentication");

//Route to register a user
router.post("/register", async (req, res) => {
	try {
		//Retrieving the data from the request
		const user = req.body.username;
		const password = req.body.password;

		//Encrypting the password before it gets stored within the database
		const hashedPassword = await bcrypt.hash(password, 10);

		//Connecting with the database to create a user
		const data = await User.create({
			username: user,
			password: hashedPassword,
		});

		res.json({
			success: true,
			message: `User ${user} has been created`,
			data: data,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

//Route to login a user
router.post("/login", async (req, res) => {
	try {
		//Retrieving data from the request
		const user = req.body.username;
		const password = req.body.password;

		//Verify that a user with the entered username actually exists
		const dbUser = await User.find({ username: user });

		//We then compare the password in the DB associated with that user with the password submitted
		if (!(await bcrypt.compare(password, dbUser[0].password))) {
			res.status(500).json({
				success: false,
				error: "Invalid password",
			});
		}

		//Once the user has been verified, we create a JWT for authentication.
		const JWT = jwt.sign({ id: dbUser[0]._id }, process.env.JWT_SECRET);

		//Return the name and the id of the user, as well as the JWT with their id
		res.json({
			token: JWT,
			id: dbUser[0]._id,
			username: user,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: "User with that name does not exist. ",
		});
	}
});

//Route to delete a user
router.delete("/delete", auth, async (req, res) => {
	try {
		//Find the user by the id in the JWT and delete the user
		const dbUser = await User.findByIdAndDelete(req.user);
		res.json({
			success: true,
			data: dbUser,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

/*This route is similar to the auth middleware, and will be used to determine whether a user has a valid auth token
when they enter the site.
*/
router.post("/verifyJWT", (req, res) => {
	try {
		//Retrieivng the JWT from the header
		const JWT = req.header("auth-token");

		//If there's nothing in the header, return false
		if (!JWT) {
			res.json({
				status: false,
			});
		}

		//Verifying whether the JWT is valid
		const VERIFY_JWT = jwt.verify(JWT, process.env.JWT_SECRET);

		if (!VERIFY_JWT) {
			res.json({
				status: false,
			});
		}

		res.json({
			status: true,
		});
	} catch (error) {
		res.status(500).json({
			status: false,
			error: error.message,
		});
	}
});

//This is also used when the site renders, getting the info of the user from the JWT
router.get("/getUserInfo", auth, async (req, res) => {
	try {
		//Find the user by the id in the JWT
		const dbUser = await User.find({ _id: req.user });

		//If the user is found, return the user data.
		res.json({
			success: true,
			data: dbUser,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

module.exports = router;
