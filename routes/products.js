const router = require("express").Router();
const Product = require("../models/product-model");
const auth = require("../authentication");

//Route to retrieve all products in the database
router.get("/", auth, async (req, res) => {
	try {
		//Retrieving all products in the database
		const products = await Product.find();

		res.json({
			success: true,
			data: products,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

//Route to retrieve a product in the database by its id
router.get("/:id", auth, async (req, res) => {
	try {
		//Retrieve the product id from the params
		const id = req.params.id;

		//Retrieving the product from the database
		const product = await Product.findById(id);

		res.json({
			success: true,
			data: product,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

module.exports = router;
