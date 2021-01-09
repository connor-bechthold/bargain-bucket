import UserContext from "../context/UserContext";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Paper, Grid } from "@material-ui/core";
import axios from "axios";

function Landing() {
	//Accessing the userContext
	const userContext = useContext(UserContext);

	//Creating state to store the array of products in the database
	const [productsArray, setProductsArray] = useState([]);

	/*Using the useEffect hook for when the landing component mounts. This gets all products stored in the database,
    and assings them to state.  */
	useEffect(() => {
		let mounted = true;
		async function getProducts() {
			try {
				//Get all products from the database
				const products = await axios.get("/products/", {
					headers: { "auth-token": localStorage.getItem("auth-token") },
				});

				//Storing the array in state
				if (mounted) {
					setProductsArray(products.data.data);
				}
			} catch (error) {
				console.log(error.message);
			}
		}
		getProducts();
		return () => {
			mounted = false;
		};
	}, []);

	return (
		<div>
			{/* Displying the user from the user context*/}
			<h2
				style={{
					marginBottom: "-30px",
					width: "100%",
					backgroundColor: "#f50057",
					color: "white",
					marginTop: "0px",
					padding: "3px 0px",
				}}
			>{`Welcome, ${userContext.userInfo.username}`}</h2>

			{/* Maps the productsArray state*/}
			<Grid
				xs={12}
				container
				justify="space-evenly"
				spacing={10}
				style={{ margin: "0 auto", height: "100%" }}
				alignItems="stretch"
			>
				{productsArray.map((product) => {
					return (
						<Grid item xs={4} key={product._id}>
							<Paper elevation={5} style={{ backgroundColor: "#3f50b5" }}>
								<div>
									<h1
										style={{
											padding: "10px 0",
											color: "white",
										}}
									>
										{product.name}
									</h1>
									<img
										src={product.image}
										alt="product"
										style={{
											width: "100%",
											objectFit: "cover",
											backgroundColor: "red",
											marginTop: "-22px",
											padding: "0",
											height: "300px",
										}}
									/>
									<h2
										style={{ color: "white", marginTop: " 10px" }}
									>{`$${product.price} CAD`}</h2>

									{/* Provides a link to a section with more details, also passing in the product id as a part of the 
                                    link. Each different component rendered here will have acccess to this product id, and will be able to 
                                    retrieve that singular item from the database.
                                     */}
									<Link
										to={`/landing/${product._id}`}
										style={{ textDecoration: "none" }}
									>
										<Button
											variant="contained"
											color="secondary"
											style={{ width: "100%", marginTop: "-5px" }}
										>
											View Product
										</Button>
									</Link>
								</div>
							</Paper>
						</Grid>
					);
				})}
			</Grid>
		</div>
	);
}

export default Landing;
