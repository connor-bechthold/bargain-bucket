const express = require("express");
const app = express();

//Requring cors and path
const cors = require("cors");
const path = require("path");

//Requiring mongoose
const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

require("dotenv").config();

const port = process.env.PORT || 5000;

//Connecting to the database
const dbConnection = async () => {
	try {
		const connection = await mongoose.connect(process.env.URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
		});
		console.log("Connection to database was successful");
	} catch (error) {
		console.log(`Error: ${error.message}`);
	}
};

//Setting up express and CORS, as well as choosing the files to serve
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "client/build")));

//Establishing the database connection
dbConnection();

//Establish routes
//User route for login and register purposes
const usersRouter = require("./routes/users");
app.use("/users", usersRouter);

//Product route for displaying products
const productRouter = require("./routes/products");
app.use("/products", productRouter);

//Review route for adding, deleting, and displaying reviews
const reviewRouter = require("./routes/reviews");
app.use("/reviews", reviewRouter);

//Cart route for adding, displaying, and removing items
const cartRouter = require("./routes/cart");
app.use("/cart", cartRouter);

app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

app.listen(port, () => {
	console.log(`Listening at port ${port}`);
});
