import { Sequelize } from "sequelize-typescript";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}


const sequelize = new Sequelize(process.env.DATABASE_URL as string,{
  models : [__dirname + '/model/*.ts']
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

sequelize.sync({force : false,alter:false}).then(()=>{
    console.log("synced !!")
})




export default sequelize;

