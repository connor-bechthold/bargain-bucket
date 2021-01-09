const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Schema for a product
const productSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	image: {
		type: String,
		required: true,
	},
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
