import dotenv from "dotenv";
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
dotenv.config();

import app from "./src/app";
import "./src/database/connection";
import adminSeeder from "./src/adminSeeder";
import categoryController from "./src/controllers/categoryController";
import { envConfig } from "./src/config/config";
import User from "./src/database/model/userModel";
import Order from "./src/database/model/orderModel";



function startServer() {
  const port = envConfig.port || 4000
  const server = app.listen(port, () => {
    categoryController.seedCategory()
    console.log(`Server has started at port [${port}]`)
    adminSeeder()
  })
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173'
    },
    transports: ['websocket'] 
  })
  let onlineUsers: { socketId: string, userId: string, role: string }[] = []
  let addToOnlineUsers = (socketId: string, userId: string, role: string) => {
    onlineUsers = onlineUsers.filter((user) => user.userId !== userId)
    onlineUsers.push({ socketId, userId, role })
  }
  io.on("connection", (socket) => {

    const  token = socket.handshake.headers.token //jwt token
    if (token) {
      console.log(token)
      jwt.verify(token as string, process.env.JWT_SECRET_KEY as string, async (err: any, result: any) => { //token verify vayo ki nai vanera func ma aayera ko hunxa,1st vayena vaney error aauxa,2nd ma vayo vaney result aauxa(err,result) 
        if (err) {
          socket.emit("error", err)
        } else {
          const userData = await User.findByPk(result.userId) // {email:"",pass:"",role:""}
          if (!userData) {
            socket.emit("error", "No user found with that token")
            return
          }
          //userId grab garnu paryo
          addToOnlineUsers(socket.id, result.userId, userData.role)
          console.log(onlineUsers)
        }
      })
    }else{
      socket.emit("error","please provide Token")
    }

    socket.on("updateOrderStatus",async (data) => {
      const { status, orderId, userId } = data
      const findUser = onlineUsers.find(user => user.userId == userId) //{socketId,userId,role}
      await Order.update(
        {
          OrderStatus : status
        },{
          where:{
            id: orderId
          }
        }
      )
      if (findUser) {
        io.to(findUser.socketId).emit("success", "order status updated successfully")
      } else {
        socket.emit("error", "User is not online!!")
      }

    })
  })

}


startServer()
