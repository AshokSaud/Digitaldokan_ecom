import { Request } from 'express'
import multer from 'multer'

const storage = multer.diskStorage({
    destination : function(req:Request,file:Express.Multer.File,cb:any){
        cb(null,'./src/uploads') //cb(error huda k,success huda k)
    },
    filename: function(req:Request,file:Express.Multer.File,cb:any){
        cb(null,Date.now()+"-"+file.originalname)
    }
})

export {multer,storage}