import dotenv from "dotenv";
dotenv.config();

import app from "./src/app";
import "./src/database/connection";
import adminSeeder from "./src/adminSeeder";
import categoryController from "./src/controllers/categoryController";


app.listen(process.env.PORT, () => {
  console.log("Server is running on port 4000");
  categoryController.seedCategory()
  adminSeeder()
});