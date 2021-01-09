const router = require("express").Router();
const Review = require("../models/review-model");
const auth = require("../authentication");

//Route to add a review
router.post("/add", auth, async (req, res) => {
	try {
		//Getting data from the request
		const description = req.body.description;
		const stars = req.body.stars;
		const date = req.body.date;
		const productId = req.body.productId;
		const username = req.body.username;

		//Adding a review to the database
		const review = await Review.create({
			description,
			stars,
			date,
			productId,
			username,
		});

		res.send({
			success: true,
			data: review,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

//Route to get reviews specific to a productId
router.get("/:id", auth, async (req, res) => {
	try {
		//Get id from the paramaters
		const id = req.params.id;

		//Find product in DB
		const reviews = await Review.find({ productId: id });

		//Send back the reviews
		res.send({
			success: true,
			data: reviews,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

//Delete a review by its id
router.delete("/:id", auth, async (req, res) => {
	try {
		//Get id from the paramaters
		const id = req.params.id;

		//Find and delete the review in the DB
		const reviews = await Review.findByIdAndDelete(id);

		res.send({
			success: true,
			data: reviews,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

module.exports = router;
