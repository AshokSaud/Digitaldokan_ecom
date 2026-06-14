import { Sequelize } from "sequelize-typescript";
import Category from "./model/categoryModel";
import Product from "./model/productModel";
import Order from "./model/orderModel";
import User from "./model/userModel";
import OrderDetail from "./model/orderDetail";
import Payment from "./model/paymentModel";
import Cart from "./model/cartModel";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}


const sequelize = new Sequelize(process.env.DATABASE_URL as string,{
  models : [__dirname + '/model/*.ts'],
  // logging: false // terminal ma query execution hernu xa vaney true garney
});


try{
  sequelize.authenticate()
  .then(()=>{
    console.log("Database connected successfully.");
  })
 .catch((error)=>{
    console.error("Unable to connect to the database:", error);
  });
} catch(error){
  console.error("Database connection error:", error);
}

sequelize.sync({force : false, alter: false}).then(()=>{ //force:false --> Won't drop & recreate tables...force true garyo vaney database ko sabai data janxa so migrate garna alter->true garney, alter:false-->Won't modify existing columns
    console.log("synced !!")
})
// relationships haru mainly connection.ts ma define garne garincha

//relationship between category and product
Product.belongsTo(Category,{foreignKey:'categoryId'}) //product table ma categoryId aayera basxa
Category.hasOne(Product,{foreignKey:'categoryId'})

//relationship between user & order,  Product & orderDetail,Payment & order,order & orderDetail,
Order.belongsTo(User,{foreignKey:'userId'})
User.hasMany(Order,{foreignKey:'userId'})

OrderDetail.belongsTo(Product,{foreignKey:'productId'})
Product.hasOne(OrderDetail,{foreignKey:'productId'})

Payment.belongsTo(Order,{foreignKey:'orderId'})
Order.hasOne(Payment,{foreignKey:'orderId'})

OrderDetail.belongsTo(Order,{foreignKey:'orderId'})
Order.hasOne(OrderDetail,{foreignKey:'orderId'})

//cart relationship-> userId & Cart, productId & cart
Cart.belongsTo(User,{foreignKey:'userId'})
User.hasOne(Cart,{foreignKey:'userId'})

Cart.belongsTo(Product,{foreignKey:'productId'})
Product.hasMany(Cart,{foreignKey:'productId'})

export default sequelize;

