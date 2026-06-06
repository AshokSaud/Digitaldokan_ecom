import express,{ Router } from "express";
import categoryController from "../controllers/categoryController";
import userMiddleware, { Role } from "../Middleware/userMiddleware";
import errorHandler from "../services/errorHandler";


const router:Router = express.Router() // router ko type set gareko Router ho vanera, express.Router() le router banauxa

router.route("/").get(categoryController.getCategories)
router.route("/").post(userMiddleware.isUserLoggedIn,userMiddleware.accessTo(Role.Admin),errorHandler(categoryController.addCategory))
router.route("/:id").delete(userMiddleware.isUserLoggedIn,userMiddleware.accessTo(Role.Admin),errorHandler(categoryController.deleteCategory))
router.route("/:id").patch(userMiddleware.isUserLoggedIn,userMiddleware.accessTo(Role.Admin),errorHandler(categoryController.updateCategory))
 
export default router