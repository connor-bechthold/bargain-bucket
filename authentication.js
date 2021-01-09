const jwt = require("jsonwebtoken");

//Authentication middleware for each route
const authentication = (req, res, next) => {
	try {
		//Grabbing the token from the header of the request
		const JWT = req.header("auth-token");

		//Verifying that a token actually exists
		if (!JWT) {
			res.status(401).json({
				success: false,
				error: "No authentication token was found",
			});
		}

		//If a token exists, check that the token is actually valid
		const VERIFY_JWT = jwt.verify(JWT, process.env.JWT_SECRET);

		if (!VERIFY_JWT) {
			res.status(401).json({
				success: false,
				error: "Invalid authentication token",
			});
		}

		//We then create a parameter in the request that holds the id of the user retrieved from the JWT
		req.user = VERIFY_JWT.id;

		next();
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
};

module.exports = authentication;
