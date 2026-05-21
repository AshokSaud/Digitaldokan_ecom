import dotenv from "dotenv";
dotenv.config();

import app from "./src/app";
import "./src/database/connection";



app.listen(process.env.PORT, () => {
  console.log("Server is running on port 4000");
});