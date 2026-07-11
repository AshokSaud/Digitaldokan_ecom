import { Request, Response } from "express";
import Order from "../database/model/orderModel";
import OrderDetail from "../database/model/orderDetail";
import { OrderStatus, PaymentMethod, PaymentStatus } from "../globals/types";
import Payment from "../database/model/paymentModel";
import axios from "axios";  //Khalti ko api backend bata hit garauna
import Cart from "../database/model/cartModel";
import Product from "../database/model/productModel";
import Category from "../database/model/categoryModel";


interface IProduct {
    productId: string,
    productQty: string
}

interface OrderRequest extends Request {
    user?: {
        id: string
    }
}
class OrderWithPaymentId extends Order{
    declare paymentId : string | null
}


class OrderController {
    async createOrder(req: OrderRequest, res: Response):Promise<void> {
        const userId = req.user?.id  //userMilldeware dekhi taneko userId
        const { firstName,lastName,email,phoneNumber, AddressLine, totalAmount, paymentMethod,city,state,zipCode } = req.body
        const products: IProduct[] = req.body.products
        if (!phoneNumber || !AddressLine || !totalAmount || products.length == 0 || !firstName || !lastName || !email || !city || !state || !zipCode) {
            res.status(404).json({
                message: "please provide phoneNumber,AddressLine,totalAmount,products"
            })
            return
        }
        
        let data;
        //for payment
        const paymentData = await Payment.create({
            paymentMethod: paymentMethod
        })
        //for order
        const orderData = await Order.create({
            phoneNumber,
            AddressLine,
            totalAmount,
            userId,
            firstName,
            lastName,
            email,
            city,
            state,
            zipCode,
            paymentId : paymentData.id
        })

        products.forEach(async function (product) {
            data = await OrderDetail.create({
                quantity: product.productQty,  //not a product of database
                productId: product.productId,
                orderId: orderData.id
            })
            await Cart.destroy({
                where:{
                    productId : product.productId,
                    userId : userId
                }
            })
        })
        
        if (paymentMethod == PaymentMethod.Khalti) {
            const data = {
                return_url: "http://localhost:5173",
                website_url: "http://localhost:5173",
                amount: totalAmount * 100,
                purchase_order_id: orderData.id,
                purchase_order_name: "order_" + orderData.id
            }
            const response = await axios.post("https://dev.khalti.com/api/v2/epayment/initiate/", data, {
                headers: {
                    Authorization: "Key 9928c8c6082e40faac06604f2f3ccd3a"
                }
            })
            const khaltiResponse = response.data
            paymentData.pidx = khaltiResponse.pidx
            paymentData.save()
            console.log(khaltiResponse)
            res.status(200).json({
                message: "Order created successfully",
                url : khaltiResponse.payment_url,
                pidx : paymentData.pidx,
                data
            })
        } else if(paymentMethod ==PaymentMethod.Esewa) {

        }else{
            res.status(200).json({
                message:"Order created Successfully",
                data
            })
        }
    }
    async verifyTransaction(req:OrderRequest,res:Response):Promise<void> {
        const {pidx} = req.body
        if(!pidx){
            res.status(400).json({
                message: "Please provide pidx!!"
            })
            return
        }
        const response = await axios.post("https://dev.khalti.com/api/v2/epayment/lookup/",{
            pidx : pidx
        },{
            headers:{
                Authorization: "Key 9928c8c6082e40faac06604f2f3ccd3a"
            }
        })
        const data = response.data
        if(data.status === "Completed"){
            await Payment.update({
                paymentStatus : PaymentStatus.Paid
            },{
                where:{
                    pidx: pidx
                }
            })
            res.status(200).json({
                message:"Payment verified successfully"
            })
        }else{
             res.status(200).json({
                message:"Payment not verified or cancelled"
            })
        }

    }
    async fetchMyOrders(req:OrderRequest,res:Response):Promise<void> {
        const userId = req.user?.id
        const orders = await Order.findAll({
            where:{
                userId
            },
            attributes:["id","totalAmount","OrderStatus"], //frontend ma k k dekhauney tei matra pass garney
            include:{
                model:Payment,
                attributes:["paymentMethod","paymentStatus"]
            }
        })
        if(orders.length > 0){
            res.status(200).json({
                message:"Order fetched",
                data: orders
            })
        }else{
            res.status(404).json({
                message:"No orders Found",
                data:[]
            })
        }
    }
    async fetchMyOrderDetail(req:OrderRequest,res:Response):Promise<void> {
        const orderId = req.params.id
        const userId = req.user?.id
        const orders = await OrderDetail.findAll({
            where:{
                orderId,
            },
            include:[{
                model:Order,
                include:[
                    {
                        model:Payment,
                        attributes:["paymentMethod","paymentStatus"]
                    }
                ],
                attributes:["OrderStatus","AddressLine","city","state","totalAmount","phoneNumber","firstName","lastName"]
            },{
                model: Product,
                include:[{
                    model:Category
                }],
                attributes:["productImageUrl","productName","productPrice"]
            }]
        })
        if(orders.length > 0){
            res.status(200).json({
                message:"Order fetched",
                data: orders
            })
        }else{
            res.status(404).json({
                message:"No orders Found",
                data:[]
            })
        }
    }
    async cancelMyOrder(req:OrderRequest,res:Response):Promise<void>{
        const userId = req.user?.id
        const orderId = req.params.id
        //check whether orderId belongs to userId
        const [order] = await Order.findAll({
            where:{
                userId : userId,
                id :orderId     // id vaneko column ko name model ma ko
            }
        })
        if(!order){
            res.status(400).json({
                message:"No Order in this id"
            })
            return
        }
        //check order status
        if(order.OrderStatus === OrderStatus.Ontheway || order.OrderStatus === OrderStatus.Preparation){
            res.status(403).json({
                message:"Order Cannot be Cancelled, it's ontheway or preparation mode"
            })
            return
        }
        await Order.update({
            OrderStatus : OrderStatus.Cancelled
        },{
            where:{
                id: orderId
            }
        })
        res.status(200).json({
            message:"Order Cancelled Successfully"
        })
        
    }
    //for admin dashboard
    async changeOrderStatus(req:OrderRequest,res:Response):Promise<void>{
        const orderId = req.user?.id
        const {OrderStatus} = req.body
        if(!OrderStatus || !orderId){
            res.status(404).json({
                message: "please provide OrderStatus & orderId"
            })
            return
        }
        await Order.update({
            OrderStatus : OrderStatus
        },{
            where:{
                id: orderId
            }
        })
        res.status(200).json({
            message:"OrderStatus updated successfully"
        })
    }
    async deleteOrder(req:OrderRequest,res:Response):Promise<void> {
        const orderId = req.params.id
        const order:OrderWithPaymentId = await Order.findByPk(orderId) as OrderWithPaymentId
        const paymentId = order?.paymentId
        if(!order){
            res.status(400).json({
                message: "No order in this id"
            })
            return
        }
        await OrderDetail.destroy({
            where:{
                orderId : orderId
            }
        })
        await Payment.destroy({
            where:{
                id: paymentId
            }
        })
        await Order.destroy({
            where:{
                id: orderId
            }
        })
        res.status(200).json({
            message:"Order deleted successfully"
        })
    }

}

export default new OrderController