import { Response, Request } from "express";
import Cart from "../database/model/cartModel";
import Product from "../database/model/productModel";
import Category from "../database/model/categoryModel";

interface AuthRequest extends Request {
    user?: {
        id: String
    }
}


class CartController {
    async addToCart(req: AuthRequest, res: Response): Promise<void> {
        const userId = req.user?.id //yo userId route dekhi aako ho
        const { productId, quantity } = req.body
        if (!productId || !quantity) {
            res.status(400).json({
                message: "Please provide productId & Quantity"
            })
            return
        }
        let UserCartHas = await Cart.findOne({
            where: {
                productId,
                userId
            }
        })

        if (UserCartHas) {
            UserCartHas.quantity += quantity//userko cart ma vako quantity + aafuley diney quantity body bata(default 1 hunxa quantity)
            await UserCartHas.save()

        } else {

            await Cart.create({
                userId,
                productId,
                quantity
            })
        }
        const cartData = await Cart.findAll({
            where:{
                userId
            },
            include:[
                {
                    model: Product,
                    include:[
                        {
                            model: Category
                        }
                    ]
                }
            ]
        })
        res.status(200).json({
            message: "Product added to the cart",
            data: cartData
        })
    }
    async getMyCartItems(req:AuthRequest,res:Response){
        const userId = req.user?.id
        const cartItems = await Cart.findAll({
            where:{
                userId
            },
            include:[
                {
                    model: Product,
                    attributes: ['id','productName','productPrice','productImageUrl']
                }
            ]
        })
        if(cartItems.length === 0){
            res.status(404).json({
                message:"No items in the cart"
            })
        }else{
            res.status(200).json({
                message: "Cart items fetched successfully",
                data : cartItems
            })
        }
    }

    async deleteMyCartItems(req:AuthRequest,res:Response){
        const userId = req.user?.id
        const{productId}=req.params
        const product = await Product.findByPk(productId)
        if(!product){
            res.status(404).json({
                message: "No product with this ID"
            })
            return
        }
        await Cart.destroy({
            where:{
                productId,
                userId
            }
        })
        res.status(200).json({
            message:"Product deleted from the Cart"
        })
    }
    async updateCartItemQuantity(req:AuthRequest,res:Response){
        const userId = req.user?.id
        const {productId} = req.params
        const{quantity}=req.body
        if(!quantity){
            res.status(400).json({
                message:"Please provide quantity"
            })
            return
        }
        const cartItem =await Cart.findOne({
            where:{
                userId,
                productId
            }
        })
        if(!cartItem){
            res.status(404).json({
                message: "No product available with this productId"
            })
        }else{
            cartItem.quantity = quantity;
            await cartItem.save()
            res.status(200).json({
                message: "cart updated!!"
            })
        }
    }
}

export default new CartController