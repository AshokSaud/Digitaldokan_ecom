import express from 'express'
import './database/connection'
import userRoute from './routes/userRoute'
import categoryRoute from './routes/categoryRoute'
import productRoute from './routes/productRoutes'
import orderRoute from './routes/orderRoute'
import cartRoute from './routes/cartRoute'
import cors from 'cors'

const app = express()
app.use(cors({
    origin: "*"
}))

app.use(express.json());

app.use(express.static("./src/uploads"))

app.use("/api/auth",userRoute)
app.use("/api/category",categoryRoute)
app.use("/api/product",productRoute)
app.use("/api/order",orderRoute)
app.use("/api/cart",cartRoute)


export default app;