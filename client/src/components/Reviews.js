import { Rating } from "@material-ui/lab";
import { TextField, Button, Grid, Paper, Box } from "@material-ui/core";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import UserContext from "../context/UserContext";
import ReviewContext from "../context/ReviewContext";

function Reviews(props) {
	//Setting state for the reviews
	const [description, setDescription] = useState("");
	const [stars, setStars] = useState(null);
	const [reviews, setReviews] = useState([]);
	const [update, setUpdate] = useState(false);

	//Retrieve the userContext to store name associated with comments
	const userContext = useContext(UserContext);

	//Retrieve the reviewContext
	const reviewContext = useContext(ReviewContext);

	useEffect(() => {
		let mounted = true;
		async function getReviews() {
			try {
				//Retrieving the already existing reviews from the database for the particular product
				const reviews = await axios.get(`/reviews/${props.productId}`, {
					headers: { "auth-token": localStorage.getItem("auth-token") },
				});

				//Setting the reviews to state
				if (mounted) {
					setReviews(reviews.data.data);
				}

				//Getting the number of reviews for a given product. This will display beside the ratings section
				const numberOfReviews = reviews.data.data.length;

				//Setting number of reviews to review context
				reviewContext.setNumOfReviews(numberOfReviews);

				//Getting the total number of stars in each review, dividing it below by the number of reviews to get an average
				let totalStars = 0;
				for (let i = 0; i < numberOfReviews; ++i) {
					totalStars += reviews.data.data[i].stars;
				}

				//Case if there aren't any reviews
				if (totalStars === 0) {
					if (mounted) {
						reviewContext.setAverageStars(0);
					}
				} else {
					//Rounding the average to 2 decimal places
					const average =
						Math.round((totalStars / numberOfReviews) * 100) / 100;

					if (mounted) {
						reviewContext.setAverageStars(average);
					}
				}
			} catch (error) {
				console.log(error.message);
			}
		}
		getReviews();
		return () => {
			mounted = false;
		};
	}, [update]);

	//Function to handle the submission of a review
	async function handleSubmit() {
		try {
			//Getting a date string
			const options = {
				weekday: "long",
				year: "numeric",
				month: "long",
				day: "numeric",
			};
			const today = new Date();
			const date = today.toLocaleDateString("en-US", options);

			//Setting the request data
			const data = {
				description,
				stars,
				date,
				productId: props.productId,
				username: userContext.userInfo.username,
			};

			//Adding a review to the database
			await axios.post("/reviews/add", data, {
				headers: { "auth-token": localStorage.getItem("auth-token") },
			});

			//Resetting state values
			setDescription("");
			setStars(0);

			//This changes the update state, which will trigger the useEffect hook and re-render the reviews.
			setUpdate(!update);
		} catch (error) {
			console.log(error.message);
		}
	}

	//Handles a post delete
	async function handleDelete(e) {
		try {
			//Retrieving the review ID from the button that was clicked
			const id = e.currentTarget.getAttribute("reviewid");

			//Deleting the review from the database
			await axios.delete(`/reviews/${id}`, {
				headers: { "auth-token": localStorage.getItem("auth-token") },
			});

			//To make sure the reviews re-render, we call the update state
			setUpdate(!update);
		} catch (error) {
			console.log(error.message);
		}
	}

	return (
		<div style={{ paddingTop: "20px" }}>
			{/* Section for creating a reviews*/}

			<h1>Reviews</h1>
			<h2>Add a review</h2>
			<p>Describe your experience with the product:</p>
			<TextField
				label="Review"
				multiline
				rowsMax={10}
				rows={5}
				variant="outlined"
				value={description}
				onChange={(e) => {
					setDescription(e.target.value);
				}}
				style={{ width: "50%" }}
			/>
			<br />
			<p>Rate the product:</p>
			<Rating
				size="large"
				name="half-rating"
				value={stars}
				onChange={(e) => {
					setStars(e.target.value);
				}}
				defaultValue={0}
				precision={0.5}
			/>

			{/* Submit button */}
			<Box display="block" paddingTop="15px">
				<Button variant="contained" color="secondary" onClick={handleSubmit}>
					Submit
				</Button>
			</Box>

			<h1 style={{ paddingTop: "40px" }}>User Reviews</h1>
			{/* Section for displaying the reviews*/}
			<Grid
				direction="column-reverse"
				container
				alignItems="center"
				spacing={5}
				style={{ width: "100%" }}
			>
				{/* Mapping the review state, displaying each review seperately*/}
				{reviews.map((review) => {
					return (
						<Grid item lg={12} key={review._id} style={{ width: "90%" }}>
							<Paper elevation={5}>
								<div
									style={{
										wordWrap: "break-word",
										padding: "10px",
										textAlign: "left",
									}}
								>
									<p style={{ fontWeight: "bold" }}>{`@${review.username}`}</p>
									<p>{`"${review.description}"`}</p>
									<Rating readOnly value={review.stars} precision={0.5} />
									<p
										style={{ fontStyle: "italic" }}
									>{`Posted on ${review.date}`}</p>

									{/* Delete button that only renders if the post username is equal to the username of the 
                                    user that's signed in. the post id is stored in an attribute, and retrieved in the handleDelete f
                                    unction*/}

									{review.username === userContext.userInfo.username && (
										<Button
											variant="contained"
											color="secondary"
											onClick={handleDelete}
											reviewid={review._id}
										>
											Delete Review
										</Button>
									)}
								</div>
							</Paper>
						</Grid>
					);
				})}
			</Grid>
			{reviews.length === 0 && (
				<p style={{ padding: "20px 0px" }}>
					There are no reviews. Be the first person to post a review!
				</p>
			)}
		</div>
	);
}

export default Reviews;
