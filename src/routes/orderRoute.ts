import express,{ Router } from "express";
import orderController from "../controllers/orderController";
import userMiddleware from "../Middleware/userMiddleware";
import errorHandler from "../services/errorHandler";

const router:Router = express.Router()


router.route("/").post(userMiddleware.isUserLoggedIn,errorHandler(orderController.createOrder))


export default router