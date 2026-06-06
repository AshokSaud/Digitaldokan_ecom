import express,{ Router } from "express";
import productController from "../controllers/productController";
import userMiddleware, { Role } from "../Middleware/userMiddleware";
import errorHandler from "../services/errorHandler";
import {multer,storage} from '../Middleware/multer'
const upload = multer({storage : storage})
const router:Router = express.Router()


router.route("/").post(userMiddleware.isUserLoggedIn,userMiddleware.accessTo(Role.Admin),upload.single("productImage"),errorHandler(productController.createProduct))
router.route("/").get(errorHandler(productController.getAllProducts)) //yo (productImage) vanney name jo hami ley yeta deko xam,exactly yei name ma file send garnu parxa,yesko name j rakhda ni vayo but tei name ma file send garnu paryo
router.route("/:id").get(errorHandler(productController.getSingleProduct))
router.route("/:id").delete(userMiddleware.isUserLoggedIn,userMiddleware.accessTo(Role.Admin),errorHandler(productController.deleteProduct))
router.route("/:id").patch(userMiddleware.isUserLoggedIn,userMiddleware.accessTo(Role.Admin),upload.single("productImage"),errorHandler(productController.updateProduct))



export default router