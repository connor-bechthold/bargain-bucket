const router = require("express").Router();
const Cart = require("../models/cart-model");
const auth = require("../authentication");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

//Route to add an item to the cart
router.post("/add", auth, async (req, res) => {
	try {
		//Getting params
		const username = req.body.username;
		const productId = req.body.productId;
		const quantity = req.body.quantity;
		const image = req.body.image;
		const price = req.body.price;
		const name = req.body.name;

		//Adding item to database
		const item = await Cart.create({
			username,
			productId,
			quantity,
			image,
			price,
			name,
		});

		res.json({
			success: true,
			data: item,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

/*Route to get items in cart with specific username and product ID. This will check whether a new document needs to be added, 
or the quantity field should increase by 1
*/
router.post("/check", auth, async (req, res) => {
	try {
		//Getting params
		const productId = req.body.productId;
		const username = req.body.username;

		//Finding the product in the cart
		const item = await Cart.find({ username, productId });

		res.json({
			success: true,
			data: item,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

//Route to get all items in the cart associated with the user
router.post("/display", auth, async (req, res) => {
	try {
		//Getting username
		const username = req.body.username;

		//Find items in the cart
		const items = await Cart.find({ username });
		res.json({
			success: true,
			data: items,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

//Route to increment the quantity field of an item in the cart
router.post("/increment", auth, async (req, res) => {
	try {
		//Getting params
		const productId = req.body.productId;
		const username = req.body.username;

		//find item in the cart
		const item = await Cart.findOneAndUpdate(
			{ username, productId },
			{ $inc: { quantity: 1 } }
		);

		res.json({
			success: true,
			data: item,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

//Route to update the quantity on the cart page using the select menu
router.post("/update-quantity", auth, async (req, res) => {
	try {
		//Getting params
		const productId = req.body.productId;
		const username = req.body.username;
		const quantity = req.body.quantity;

		//Updating the quantity
		const item = await Cart.findOneAndUpdate(
			{ username, productId },
			{ quantity }
		);

		res.json({
			success: true,
			data: item,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

//Route to remove an item from the cart
router.delete("/delete", auth, async (req, res) => {
	try {
		//Getting params
		const productId = req.body.productId;
		const username = req.body.username;

		//Deleting the item
		const item = await Cart.deleteOne({ username, productId });

		res.json({
			success: true,
			data: item,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

//Route to remove all items from the cart
router.delete("/deleteAll", auth, async (req, res) => {
	try {
		const username = req.body.username;

		const items = await Cart.deleteMany({ username });

		res.json({
			success: true,
			data: items,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

//Route for payment
router.post("/pay", auth, async (req, res) => {
	try {
		//Getting params
		const username = req.body.username;

		//Get items in the cart associated with the user
		const items = await Cart.find({ username });

		/*Get the total price. This must be done again in the backend to ensure a user is unable to change 
        this calculation of the total priceby inspecting the front end.
        */

		//Getting total price by using the reduce method
		const totalPrice =
			Math.round(
				items.reduce((total, product) => {
					return total + product.price * product.quantity;
				}, 0) * 100
			) / 100;

		//Create a Stripe payment
		const paymentIntent = await stripe.paymentIntents.create({
			amount: totalPrice * 100,
			currency: "cad",
		});

		//Sending the client secret back to the user
		res.send({
			clientSecret: paymentIntent.client_secret,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

module.exports = router;
