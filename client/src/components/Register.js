import { TextField, Button, Box } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { useState } from "react";
import axios from "axios";

function Register() {
	//State variables to hold the values of the register fields.
	//Also stores error and success state, which will be conditonally rendered below
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [errors, setErrors] = useState();
	const [success, setSuccess] = useState("");

	async function handleSubmit() {
		try {
			//Checking if the username field is empty
			if (username === "") {
				setErrors("The username field is empty.");
			}
			//Setting username requirements with regex
			else if (!/^[a-z0-9_-]{3,16}$/gim.test(username)) {
				setErrors(
					"New username does not match requirements. Username must be between 3 and 16 characters, only consisting of letters, numbers, underscores, or dashes."
				);
			}
			//Setting password requirements with regex
			else if (
				!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{5,}$/gim.test(password)
			) {
				setErrors(
					"Password must be at least 5 characters, containing at least one uppercase letter, lowercase letter, and number."
				);
			}

			//Checking if both passwords match
			else if (password !== confirmPassword) {
				setErrors("Passwords do not match");
			} else {
				//Setting the body of the request to the state variables
				const body = { username: username, password: password };

				//Making request to add the user
				await axios.post("users/register", body);

				//Setting state varibales back to empty strings to clear input fields
				setUsername("");
				setPassword("");
				setConfirmPassword("");

				//Setting error state back to an empty string and showing a success message
				setErrors("");
				setSuccess("User has been successfully registered. Please log in.");
				setTimeout(() => {
					setSuccess("");
				}, 5000);
			}
		} catch (error) {
			//The database will throw back this error if a user with that name already exists
			setErrors("Username already exists.");
		}
	}

	return (
		<div>
			<h1 style={{ paddingTop: "30px" }}>Register</h1>
			{/* Username field */}
			<Box display="block" padding="10px 0px">
				<p
					style={{
						width: "90%",
						textAlign: "left",
						margin: "0 auto",
						paddingBottom: "20px",
					}}
				>
					Username must be between 3 and 16 characters, only consisting of
					letters, numbers, underscores, or dashes.
				</p>
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
				<p
					style={{
						width: "90%",
						textAlign: "left",
						margin: "0 auto",
						paddingBottom: "20px",
					}}
				>
					Password must be at least 5 characters, containing at least one
					uppercase letter, lowercase letter, and number.
				</p>
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
			{/* Confirm password field */}
			<Box display="block" padding="10px 0px">
				<TextField
					label="Confirm Password"
					type="password"
					variant="outlined"
					value={confirmPassword}
					onChange={(e) => {
						setConfirmPassword(e.target.value);
					}}
					style={{ width: "90%" }}
				/>
			</Box>
			{/* Conditional component that renders when an error occurs when hitting the register API endpoint */}
			{errors && success === "" && (
				<Alert
					variant="filled"
					severity="error"
					style={{ margin: "20px 32px 0px 32px" }}
				>
					{errors}
				</Alert>
			)}

			{/* Conditional component that notifies a user that they have successfully registered an acccount */}
			{success && (
				<Alert
					variant="filled"
					severity="success"
					style={{ margin: "20px 32px 0px 32px" }}
				>
					{success}
				</Alert>
			)}

			{/* Submit button*/}
			<Button
				variant="contained"
				color="primary"
				onClick={handleSubmit}
				style={{ margin: "30px 0px", width: "90%" }}
			>
				Register
			</Button>
		</div>
	);
}

export default Register;
