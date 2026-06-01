import jwt from "jsonwebtoken"

const generateToken = (userId: string) => {

    const token = jwt.sign({ userId: userId }, process.env.JWT_SECRET_KEY as string, {
        expiresIn: process.env.JWT_EXPIRES_IN as any
    })
    return token

}
export default generateToken

