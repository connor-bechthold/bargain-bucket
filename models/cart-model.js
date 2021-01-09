const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Schema for a cart
const cartSchema = new Schema({
	username: {
		type: String,
		required: true,
	},
	productId: {
		type: String,
		required: true,
	},
	quantity: {
		type: Number,
		required: true,
	},

	image: {
		type: String,
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
