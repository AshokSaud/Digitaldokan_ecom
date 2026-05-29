import { Sequelize } from "sequelize-typescript";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}


const sequelize = new Sequelize(process.env.DATABASE_URL as string,{
  models : [__dirname + '/model/*.ts'],
  logging: false // terminal ma query execution hernu xa vaney true garney
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

sequelize.sync({force : false, alter:false}).then(()=>{ //force:false --> Won't drop & recreate tables, alter:false-->Won't modify existing columns
    console.log("synced !!")
})




export default sequelize;

