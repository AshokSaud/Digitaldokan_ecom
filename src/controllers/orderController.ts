import { Request,Response } from "express";
import Order from "../database/model/orderModel";
import OrderDetail from "../database/model/orderDetail";
import { PaymentMethod } from "../globals/types";
import Payment from "../database/model/paymentModel";


interface IProduct{
    productId : string,
    productQty : string
}

interface OrderRequest extends Request{
    user? :{
        id: string
    }
}


class OrderController{
    async createOrder(req:OrderRequest, res:Response){
        const userId = req.user?.id  //userMilldeware dekhi taneko userId
        const{phoneNumber,AddressLine,totalAmount,paymentMethod} = req.body
        const products:IProduct[]=req.body.products
        if(!phoneNumber|| !AddressLine || !totalAmount || products.length == 0){
            res.status(404).json({
                message:"please provide phoneNumber,AddressLine,totalAmount,products"
            })
            return
        }
        //for order
        const orderData = await Order.create({
            phoneNumber,
            AddressLine,
            totalAmount,
            userId
        })
        //for orderDetails
        console.log(orderData,"OrderData!!")
        console.log(products)
        products.forEach(async function(product){
            await OrderDetail.create({
                quantity : product.productQty,  //not a product of database
                productId : product.productId,
                orderId : orderData.id
            })
        })
        //for payment
        if(paymentMethod == PaymentMethod.COD){
            await Payment.create({
                orderId : orderData.id,
                paymentMethod : paymentMethod
            })
        }else if (paymentMethod == PaymentMethod.Khalti){
            
        }else{

        }
        res.status(200).json({
            message: "Order created successfully"
        })
    }

}

export default new OrderController