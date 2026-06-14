import express,{ Router } from "express";
import cartController from "../controllers/cartController";
import userMiddleware, { Role } from "../Middleware/userMiddleware";
import errorHandler from "../services/errorHandler";

const router:Router = express.Router() 

router.route("/").post(userMiddleware.isUserLoggedIn,userMiddleware.accessTo(Role.Customer),errorHandler(cartController.addToCart))
router.route("/").get(userMiddleware.isUserLoggedIn,userMiddleware.accessTo(Role.Customer),errorHandler(cartController.getMyCartItems))
router.route("/:productId").delete(userMiddleware.isUserLoggedIn,userMiddleware.accessTo(Role.Customer),errorHandler(cartController.deleteMyCartItems))
router.route("/:productId").patch(userMiddleware.isUserLoggedIn,userMiddleware.accessTo(Role.Customer),errorHandler(cartController.updateCartItemQuantity))




export default router