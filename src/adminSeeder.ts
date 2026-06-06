import { envConfig } from "./config/config"
import User from "./database/model/userModel"
import bcrypt from "bcrypt"



const adminSeeder = async() => {
    const [data] = await User.findAll({
        where: {
            email: envConfig.adminEmail
        }
    })
    if (!data) {

        await User.create({
            username: envConfig.adminUsername,
            password: bcrypt.hashSync(envConfig.adminPassword as string, 10),
            email: envConfig.adminEmail,
            role: "admin"
        })

    }else {
        console.log("Admin already exists/seeded")
    }

}
export default adminSeeder