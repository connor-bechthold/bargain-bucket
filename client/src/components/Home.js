import Login from "./Login";
import Register from "./Register";

import { Grid, Paper } from "@material-ui/core";

function Home() {
	return (
		<div>
			{/* Simply displays the register and login page */}
			<Grid
				container
				xs={12}
				justify="space-evenly"
				alignItems="center"
				spacing={10}
				style={{ margin: "0 auto" }}
			>
				<Grid item xs={6} style={{ height: "100%" }}>
					<Paper elevation={5}>
						<Register />
					</Paper>
				</Grid>
				<Grid item xs={6} style={{ height: "100%" }}>
					<Paper elevation={5}>
						<Login />
					</Paper>
				</Grid>
			</Grid>
		</div>
	);
}

export default Home;
