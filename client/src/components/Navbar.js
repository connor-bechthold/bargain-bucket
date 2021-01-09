import { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import UserContext from "../context/UserContext";
import {
	AppBar,
	Toolbar,
	Button,
	Grid,
	Badge,
	IconButton,
} from "@material-ui/core";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import axios from "axios";

function Navbar() {
	//Import context to utilize conditional rendering on the navbar
	const userContext = useContext(UserContext);

	//Re-renders the icon and updates the number of items in cart everytime the userContext is updated from somewhere
	useEffect(() => {
		let mounted = true;
		//This function is called initially to fetch cart items from the database for that user
		async function setCounter() {
			try {
				//Getting items from cart associated with that user
				const cartItems = await axios.post(
					"/cart/display",
					{ username: userContext.userInfo.username },
					{
						headers: { "auth-token": localStorage.getItem("auth-token") },
					}
				);

				//Looping through the array and adding the value to a counter
				let counter = 0;
				cartItems.data.data.forEach((product) => {
					counter += product.quantity;
				});

				//Setting the cart items to the context (this updates the number beside the cart)
				if (mounted) {
					userContext.setCartItems(counter);
				}
			} catch (error) {
				console.log(error.message);
			}
		}
		setCounter();
		return () => {
			mounted = false;
		};
	}, [userContext]);

	//Function to handle the logout of a user
	function handleLogout() {
		try {
			//Resetting the user info
			userContext.setUserInfo({ username: "", id: "" });

			//Changing authenticated to false
			userContext.setIsAuthenticated(false);

			//Deleting the JWT from local storage;
			localStorage.removeItem("auth-token");
		} catch (error) {
			console.log(error.message);
		}
	}
	return (
		<div>
			<AppBar position="static">
				<Toolbar>
					<Grid xs={12} container alignItems="center" justify="space-around">
						{/* These conditonal renderings check the user context username. If the user is authenticated, the username 
                        context will exist and not be an empty string, so certain things will be rendered */}

						{/* Links to the login page if the user isn't logged in*/}

						{userContext.userInfo.username === "" && (
							<Link
								to="/"
								style={{
									textDecoration: "none",
									color: "white",
									width: "100%",
									textAlign: "left",
								}}
							>
								<Grid>
									<h1>Expensive Things For Cheap Prices</h1>
								</Grid>
							</Link>
						)}

						{/* Links to the landing page if the user isn't logged in*/}

						{userContext.userInfo.username !== "" && (
							<Link
								to="/landing"
								style={{ textDecoration: "none", color: "white" }}
							>
								<Grid item>
									<h1>Expensive Things For Cheap Prices</h1>
								</Grid>
							</Link>
						)}

						{/* This shows the cart and counter on the navbar, wrapped by a link to the "/cart" componenet. 
                        As you can see, the badgeContent attribute displays the number of items in the cart, which is automatically
                        set to whatever value is stored in the user context*/}

						{userContext.userInfo.username !== "" && (
							<Grid container justify="space-around" style={{ width: "20%" }}>
								{/* Shopping cart button*/}

								<Link
									to="/cart"
									style={{ textDecoration: "none", color: "white" }}
								>
									<Grid item>
										<IconButton aria-label="show 4 new mails" color="inherit">
											<Badge
												badgeContent={userContext.cartItems}
												color="secondary"
											>
												<ShoppingCartIcon fontSize="large" />
											</Badge>
										</IconButton>
									</Grid>
								</Link>

								{/*  Logout Button, which links back to the home page */}

								<Grid item style={{ margin: "auto 0" }}>
									<Link to="/" style={{ textDecoration: "none" }}>
										<Button
											variant="contained"
											color="secondary"
											onClick={handleLogout}
										>
											Logout
										</Button>
									</Link>
								</Grid>
							</Grid>
						)}
					</Grid>
				</Toolbar>
			</AppBar>
		</div>
	);
}

export default Navbar;
