import "./App.css";
import { useState, useEffect } from "react";
import { BrowserRouter, Route, Redirect } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import Home from "./components/Home";
import Landing from "./components/Landing";
import ProductDetail from "./components/ProductDetail";
import UserContext from "./context/UserContext";
import axios from "axios";
import Navbar from "./components/Navbar";
import Cart from "./components/Cart";

//Enable a Stripe promise when the application loads
const promise = loadStripe(
	"pk_test_51I74y5IYjiqZ0vSEmcW98BbPIlWpxwY9yRHFQ6TwGKQH6qBoV3vjqWR6qKrhZhg2hirjbe0rcdpMgLxaJ7XJuRro006P1GAkEJ"
);

function App() {
	//User context storing the username and id
	const [userInfo, setUserInfo] = useState({
		username: "",
		id: "",
	});

	//User Context that will help determine which pages to render
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	//User context to display the amount of items in the cart.
	const [cartItems, setCartItems] = useState(0);

	/*Using the useEffect hook for when the component mounts. If the user leaves the page and does not logout,
  the JWT is still stored in local storage. This hook will check for that, and set the necessary state.
  */

	useEffect(() => {
		async function isAuthenticated() {
			try {
				//Retrieve token from local storage
				const token = localStorage.getItem("auth-token");

				//If the token exists...
				if (token) {
					//Verify token in the backend
					const verifyToken = await axios.post("/users/verifyJWT", null, {
						headers: { "auth-token": token },
					});

					if (verifyToken.data.status) {
						//Set the isAuthenticated status to true
						setIsAuthenticated(true);

						//Find the user and set the correct header with the token
						const user = await axios.get("/users/getUserInfo", {
							headers: { "auth-token": token },
						});

						//Set the user context to the info returned from the database
						setUserInfo({
							username: user.data.data[0].username,
							id: user.data.data[0]._id,
						});
					}
				}
			} catch (error) {
				console.log(error.message);
			}
		}

		isAuthenticated();
	}, []);

	/*Here, we do a conditional render based on whether the user is authenticated. If the user has logged in previosuly and already
  has a JWT in local storage, we redirect the user to "/landing" and display the landing page, loading user info when the component
  mounts. If the user doesn't have a valid JWT, we display the login page as well as the landing page.
  */
	if (isAuthenticated) {
		return (
			<BrowserRouter>
				<div className="App">
					{/* Wrapping the landing page component in the user context */}
					<UserContext.Provider
						value={{
							userInfo,
							setUserInfo,
							isAuthenticated,
							setIsAuthenticated,
							cartItems,
							setCartItems,
						}}
					>
						<Navbar />
						<Redirect to="/landing" />
						<Route path="/landing" exact component={Landing} />
						<Route path="/landing/:id" exact component={ProductDetail} />
						<Elements stripe={promise}>
							<Route path="/cart" exact component={Cart} />
						</Elements>
					</UserContext.Provider>
				</div>
			</BrowserRouter>
		);
	} else {
		return (
			<BrowserRouter>
				<div className="App">
					{/* Wrapping the home and landing page components in the user context */}
					<UserContext.Provider
						value={{
							userInfo,
							setUserInfo,
							isAuthenticated,
							setIsAuthenticated,
							cartItems,
							setCartItems,
						}}
					>
						<Navbar />
						<Redirect to="/" />
						<Route path="/" exact component={Home} />
						<Route path="/landing" exact component={Landing} />
						<Route path="/landing/:id" exact component={ProductDetail} />
						<Elements stripe={promise}>
							<Route path="/cart" exact component={Cart} />
						</Elements>
					</UserContext.Provider>
				</div>
			</BrowserRouter>
		);
	}
}

export default App;
