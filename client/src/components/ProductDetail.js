import axios from "axios";
import { Button, Grid } from "@material-ui/core";
import { Alert, Rating } from "@material-ui/lab";
import { useEffect, useState, useContext } from "react";
import Reviews from "./Reviews";
import UserContext from "../context/UserContext";
import ReviewContext from "../context/ReviewContext";

function ProductDetail({ match }) {
	//We pass the match variable so we can access the product id passed into the link parameter

	//Retrieve the userContext to store name in cart database
	const userContext = useContext(UserContext);

	//Setting state to store the product
	const [product, setProduct] = useState({});

	//Ensuring add to cart button isn't spammed
	const [success, setSuccess] = useState("");

	//Review context for average stars
	const [averageStars, setAverageStars] = useState(0);

	//Review context for number of reviews
	const [numOfReviews, setNumOfReviews] = useState(0);

	/*Using the useEffect hook to set state everytime that the match variable changes (component mounts). 
    Again, the mounted variable is used to ensure the state isn't being set when the component is unmounted.
    */
	useEffect(() => {
		let mounted = true;
		async function getProduct() {
			try {
				//Takes user to top of page when link is clicked
				window.scrollTo(0, 0);

				//Retrieving the product with the match variable
				const product = await axios.get(`/products/${match.params.id}`, {
					headers: { "auth-token": localStorage.getItem("auth-token") },
				});
				//Setting the product within state
				if (mounted) {
					setProduct(product.data.data);
				}
			} catch (error) {
				console.log(error.message);
			}
		}
		getProduct();
		return () => {
			mounted = false;
		};
	}, [match]);

	//Function that adds the product to the cart
	async function addToCart(e) {
		try {
			//Disable button for a few seconds after it is clicked
			setSuccess("yes");
			setTimeout(() => {
				setSuccess("");
			}, 3000);

			//Retrieving the product ID from the button that was clicked
			const productId = e.currentTarget.getAttribute("productid");

			//Checking if the cart already contains the product
			const check = await axios.post(
				"/cart/check",
				{ username: userContext.userInfo.username, productId },
				{
					headers: { "auth-token": localStorage.getItem("auth-token") },
				}
			);

			/*Check returns an array of matches. So, if it returns an array with length of 0, we know to add a new 
            document to the database. Else, we update the quantity value associated with the document that will be 
            searched for below
            */

			if (check.data.data.length === 0) {
				//Get the data from the product ID
				const product = await axios.get(`/products/${productId}`, {
					headers: { "auth-token": localStorage.getItem("auth-token") },
				});

				//Destructure the product
				const image = product.data.data.image;
				const name = product.data.data.name;
				const price = product.data.data.price;

				//Add the item to the cart database
				await axios.post(
					"/cart/add",
					{
						username: userContext.userInfo.username,
						productId,
						image,
						name,
						price,
						quantity: 1,
					},
					{
						headers: { "auth-token": localStorage.getItem("auth-token") },
					}
				);

				//Hit the cart item context to re-render the nav counter
				userContext.setCartItems();
			} else {
				//Finds the document in the database, incrementing the "quantity" key
				await axios.post(
					"/cart/increment",
					{ username: userContext.userInfo.username, productId },
					{
						headers: { "auth-token": localStorage.getItem("auth-token") },
					}
				);

				//Hit the cart item context to re-render the nav counter
				userContext.setCartItems();
			}
		} catch (error) {
			console.log(error.message);
		}
	}

	return (
		<div>
			<Grid
				container
				xs={12}
				spacing={10}
				justify="space-evenly"
				style={{ margin: "0 auto" }}
				direction="row"
			>
				{/* Printing product information */}
				<Grid item xs={6}>
					<img src={product.image} alt="product" style={{ width: "600px" }} />
				</Grid>
				<Grid item xs={6}>
					<h1>{product.name}</h1>

					{/* Section for displaying an average of the reviews*/}

					<Rating size="large" readOnly value={averageStars} precision={0.25} />
					<p style={{ fontWeight: "bold" }}>{`${averageStars} stars`}</p>

					{/* Conditional rendering to switch from "review" to "reviews" */}

					{numOfReviews === 1 && (
						<p
							style={{ fontWeight: "bold" }}
						>{`Based on ${numOfReviews} review`}</p>
					)}
					{numOfReviews !== 1 && (
						<p
							style={{ fontWeight: "bold" }}
						>{`Based on ${numOfReviews} reviews`}</p>
					)}

					<p style={{ textAlign: "left" }}>{product.description}</p>
					<h2>{`$${product.price}`}</h2>

					{/* Button to add an item to the cart*/}
					<Button
						variant="contained"
						color="secondary"
						onClick={addToCart}
						productid={match.params.id}
						disabled={success.length > 0}
					>
						Add To Cart
					</Button>
					{/* Conditional rendeer to show a success message */}

					{success && (
						<Alert
							variant="filled"
							severity="success"
							style={{ marginTop: "20px" }}
						>
							Item has been added to the cart!
						</Alert>
					)}
				</Grid>
			</Grid>

			{/* Reviews component, passing in the product id as props. This is so we can display 
            comments unique to that product. We also pass in the review context so the reviews component
            can update the average stars and number of reviews*/}
			<ReviewContext.Provider
				value={{ averageStars, setAverageStars, numOfReviews, setNumOfReviews }}
			>
				<Reviews productId={`${match.params.id}`} />
			</ReviewContext.Provider>
		</div>
	);
}

export default ProductDetail;
