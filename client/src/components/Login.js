import { TextField, Button, Box } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import UserContext from "../context/UserContext";
import axios from "axios";

function Login() {
	//State to store the username and password entered. Also includes error state, which will be conditionally rendered below
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [errors, setErrors] = useState("");

	//Obtaining the the user context
	const userContext = useContext(UserContext);

	//Using the useHistory hook to push the user to the landing page onClick
	const history = useHistory();

	//Function that handles the login of the user
	async function handleSubmit() {
		try {
			//If there is no usernamne, set the error state
			if (username === "") {
				setErrors("The username field is empty.");
			} else {
				const data = { username: username, password: password };

				//Making a request to the DB with the user information, which will send back the user, userID and JWT created for that user
				const response = await axios.post("/users/login", data);

				//Extracting the token, id of the user in the database, and display name from the response
				const JWT = response.data.token;
				const user = response.data.username;
				const userId = response.data.id;

				//Setting the user context with the user and ID of the user
				userContext.setUserInfo({ username: user, id: userId });

				//Setting the JWT in local storage with the proper header
				localStorage.setItem("auth-token", JWT);

				//Resetting state variables
				setUsername("");
				setPassword("");
				setErrors("");

				//Sending the user to the landing page
				history.push("/landing");
			}
		} catch (error) {
			setErrors(error.response.data.error);
		}
	}

	return (
		<div>
			<h1 style={{ paddingTop: "30px" }}>Login</h1>
			{/* Username field */}
			<Box display="block" padding="10px 0px">
				<TextField
					label="Username"
					variant="outlined"
					value={username}
					onChange={(e) => {
						setUsername(e.target.value);
					}}
					style={{ width: "90%" }}
				/>
			</Box>
			{/* Password field */}
			<Box display="block" padding="10px 0px">
				<TextField
					label="Password"
					type="password"
					variant="outlined"
					value={password}
					onChange={(e) => {
						setPassword(e.target.value);
					}}
					style={{ width: "90%" }}
				/>
			</Box>

			{/* Conditional alert component that appears if an error occurs when hitting the login API endpoint */}
			{errors && (
				<Alert
					variant="filled"
					severity="error"
					style={{ margin: "20px 32px 0px 32px" }}
				>
					{errors}
				</Alert>
			)}
			{/* Submit button */}
			<Button
				variant="contained"
				color="primary"
				onClick={handleSubmit}
				style={{ margin: "30px 0px", width: "90%" }}
			>
				Login
			</Button>
		</div>
	);
}

export default Login;
