const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Schema for a review
const reviewSchema = new Schema({
	description: {
		type: String,
		required: true,
	},
	stars: {
		type: Number,
		required: true,
	},
	date: {
		type: String,
		required: true,
	},

	productId: {
		type: String,
		required: true,
	},

	username: {
		type: String,
		required: true,
	},
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
