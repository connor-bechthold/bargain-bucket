import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useEffect, useState, useContext } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Button,
	CircularProgress,
	Select,
	MenuItem,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from "@material-ui/core";

import UserContext from "../context/UserContext";
import axios from "axios";

function Cart() {
	//Retrieve the userContext to search the cart database
	const userContext = useContext(UserContext);

	//State to call when something needs to be re-rendered
	const [update, setUpdate] = useState(false);

	//Displays if the cart is empty
	const [empty, setEmpty] = useState("");

	//Sets the items in the cart
	const [cart, setCart] = useState([]);

	//Displays the total price of the items in the cart
	const [totalPrice, setTotalPrice] = useState(0);

	//State to toggle the payment method popup
	const [open, setOpen] = useState(false);

	//Various state and hooks needed for stripe
	const [succeeded, setSucceeded] = useState(false);
	const [error, setError] = useState(null);
	const [processing, setProcessing] = useState("");
	const [disabled, setDisabled] = useState(true);
	const stripe = useStripe();
	const elements = useElements();

	useEffect(() => {
		let mounted = true;
		async function displayCart() {
			try {
				//Getting all items from the cart with that specific username
				const cartItems = await axios.post(
					"/cart/display",
					{ username: userContext.userInfo.username },
					{
						headers: { "auth-token": localStorage.getItem("auth-token") },
					}
				);

				//Checking if the cart is empty
				if (cartItems.data.data.length === 0) {
					if (mounted) {
						setEmpty("There are no items in the cart.");
					}
				} else {
					//Setting the empty string to its original value
					if (mounted) {
						setEmpty("");
					}

					//Setting state with the items in the cart
					if (mounted) {
						setCart(cartItems.data.data);
					}

					//Now, we must loop through the array and set the total price
					const totalPrice = cartItems.data.data.reduce((total, product) => {
						return total + product.price * product.quantity;
					}, 0);

					//Store it in state to two decinal places
					if (mounted) {
						setTotalPrice(Math.round(totalPrice * 100) / 100);
					}
				}
			} catch (error) {
				console.log(error.message);
			}
		}
		displayCart();

		return () => {
			mounted = false;
		};
	}, [update, userContext]);

	//Updates the quantity in the cart
	async function quantityChange(e) {
		try {
			//Retrieve the product id from attricutes
			const productId = e.target.name;

			//Retrieve username from context
			const username = userContext.userInfo.username;

			//Retreive new quantity
			const quantity = e.target.value;

			//Updating the cart quantity
			await axios.post(
				"/cart/update-quantity",
				{ productId, username, quantity },
				{
					headers: { "auth-token": localStorage.getItem("auth-token") },
				}
			);

			//Re-render the page by calling the update state
			setUpdate(!update);

			//Set the cart quantity to a random value to trigger the cart items update
			userContext.setCartItems();
		} catch (error) {
			console.log(error.message);
		}
	}

	//Removes an item from the cart
	async function removeFromCart(e) {
		try {
			//Get productId
			const productId = e.currentTarget.getAttribute("productid");

			//Get the username
			const username = userContext.userInfo.username;

			//Make delete request
			await axios.delete("/cart/delete", {
				headers: { "auth-token": localStorage.getItem("auth-token") },
				data: { productId, username },
			});

			//Re-render the cart page
			setUpdate(!update);

			//Re-render the cart icon number
			userContext.setCartItems();
		} catch (error) {
			console.log(error.message);
		}
	}

	//Function to toggle the dialog box open
	function toggleOpen() {
		setOpen(true);
	}

	//Function to toggle the dialog box closed. Also sets the email state to an empty string
	async function toggleClose() {
		//Close the dialog
		setOpen(false);
		setError("");
		setSucceeded("");
	}

	//This is just some styling for the card element
	const cardStyle = {
		style: {
			base: {
				color: "#32325d",
				fontFamily: "Roboto, sans-serif",
				fontSmoothing: "antialiased",
				fontSize: "16px",
				"::placeholder": {
					color: "#32325d",
				},
			},
			invalid: {
				color: "#fa755a",
				iconColor: "#fa755a",
			},
		},
	};

	//Stripe function
	const handleChange = async (event) => {
		// Listen for changes in the CardElement
		// and display any errors as the customer types their card details
		setDisabled(event.empty);
		setError(event.error ? event.error.message : "");
	};

	//Function to submit a payment
	async function submitPayment() {
		try {
			setProcessing(true);

			//Get the username
			const username = userContext.userInfo.username;

			//Submit the payment, returning a client secret
			const payment = await axios.post(
				"/cart/pay",
				{ username },
				{
					headers: { "auth-token": localStorage.getItem("auth-token") },
				}
			);

			//Setting the payload
			const payload = await stripe.confirmCardPayment(
				payment.data.clientSecret,
				{
					payment_method: {
						card: elements.getElement(CardElement),
						billing_details: {
							name: username,
						},
					},
				}
			);

			//Handle some errors
			if (payload.error) {
				setError(`Payment failed ${payload.error.message}`);
				setProcessing(false);
			} else {
				setError(null);
				setProcessing(false);
				setSucceeded(true);
			}

			//After we submit the payment and it goes through, we should clear the cart
			await axios.delete("/cart/deleteAll", {
				headers: { "auth-token": localStorage.getItem("auth-token") },
				data: { username },
			});

			//Re-render the page by calling the update state
			setUpdate(!update);

			//Re-render the cart icon number
			userContext.setCartItems();
		} catch (error) {
			console.log(error.message);
		}
	}
	return (
		<div>
			<h1>Cart</h1>
			{/* If the empty string is not empty, there are no items in the cart, and we display the empty message*/}

			{empty !== "" && <p>{empty}</p>}

			{/* Mapping through the cart, returning important info about each item. 
            If the empty string is empty, there are items in the cart, and we display them*. We utilize the table */}

			{empty === "" && (
				<TableContainer>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>Item</TableCell>
								<TableCell align="right">Image</TableCell>
								<TableCell align="right">Quantity</TableCell>
								<TableCell align="right">Price</TableCell>
								<TableCell align="right">Remove Item</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{cart.map((product) => {
								return (
									<TableRow>
										{/* Product name*/}
										<TableCell>{product.name}</TableCell>

										{/* Product image*/}
										<TableCell align="right">
											<img
												src={product.image}
												style={{ width: "150px" }}
												alt="product"
											></img>
										</TableCell>

										{/* Quantity slider. Everytime the value is changed, the component is re-rendered
                                    using the quantityChnage method, and given the default value of the quantity when the 
                                    component is initially rendered*/}

										<TableCell align="right">
											<Select
												value={product.quantity}
												onChange={quantityChange}
												variant="outlined"
												name={product.productId}
											>
												<MenuItem value={1}>1</MenuItem>
												<MenuItem value={2}>2</MenuItem>
												<MenuItem value={3}>3</MenuItem>
												<MenuItem value={4}>4</MenuItem>
												<MenuItem value={5}>5</MenuItem>
												<MenuItem value={6}>6</MenuItem>
												<MenuItem value={7}>7</MenuItem>
												<MenuItem value={8}>8</MenuItem>
												<MenuItem value={9}>9</MenuItem>
												<MenuItem value={10}>10</MenuItem>
											</Select>
										</TableCell>

										{/* Item price. This multiplies the price by the quantity in the cart.*/}
										<TableCell align="right">
											{`$${(
												Math.round(product.price * product.quantity * 100) / 100
											).toLocaleString("en", {
												useGrouping: false,
												minimumFractionDigits: 2,
											})}`}
										</TableCell>

										{/* Remove product button. This stores the id in */}
										<TableCell align="right">
											<Button
												variant="contained"
												color="secondary"
												onClick={removeFromCart}
												productid={product.productId}
											>
												Remove Item
											</Button>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</TableContainer>
			)}

			{/* If the empty string is empty, there are items in the cart so we display the total price*/}

			{empty === "" && (
				<h1>{`Total Price: $${totalPrice.toLocaleString("en", {
					useGrouping: false,
					minimumFractionDigits: 2,
				})}`}</h1>
			)}

			{/* Button to make a payment, and trigger the payment dialog */}

			{empty === "" && (
				<Button
					variant="contained"
					color="secondary"
					onClick={toggleOpen}
					style={{
						width: "50%",
						height: "70px",
						fontSize: "20px",
						marginBottom: "50px",
					}}
				>
					Make Payment
				</Button>
			)}

			{/* Payment dialog */}
			<Dialog open={open} onClose={toggleClose}>
				<DialogTitle>Make a payment</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Enter your credit card details below to make a payment. This will
						not actually accept any valid credit card, so to test the
						application, use card number "4242 4242 4242 4242", any future date,
						any CVC, and any ZIP/Postal code.
					</DialogContentText>
					<CardElement
						id="card-element"
						options={cardStyle}
						onChange={handleChange}
					/>
					{/* Show any error that happens when processing the payment */}
					{error && (
						<div className="card-error" role="alert" style={{ colour: "red" }}>
							{error}
						</div>
					)}
					{/* Show a success message upon completion */}
					<p
						className={succeeded ? "result-message" : "result-message hidden"}
						style={{ color: "#4BB543" }}
					>
						Payment succeeded. Thank you for your purchase!
					</p>

					{/* Displaying the total payment due */}

					<p
						style={{ fontWeight: "bold" }}
					>{`Total Payment: $${totalPrice.toLocaleString("en", {
						useGrouping: false,
						minimumFractionDigits: 2,
					})}`}</p>
				</DialogContent>
				<DialogActions>
					{/* Button to close the dialog box*/}

					<Button onClick={toggleClose}>Cancel</Button>

					{/* Button to submit the payment*/}

					<Button
						onClick={submitPayment}
						disabled={processing || disabled || succeeded}
						id="submit"
					>
						{/* Conditional element that will displaying a spinner while the payment is processing*/}

						<span id="button-text">
							{processing ? <CircularProgress size={20} /> : "Submit Payment"}
						</span>
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}

export default Cart;
