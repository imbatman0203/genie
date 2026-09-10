import express from "express"
import dotenv from "dotenv/config"
import connectDB from "./config/database.js"
import {connectRedis} from "./config/redis.js"
import userRouter from "./routes/userRouter.js"
import messageRouter from "./routes/messageRouter.js"
import cookieParser from "cookie-parser"
import chatRouter from "./routes/chatRouter.js"
import cors from "cors"
import modelsRouter from "./routes/modelsRouter.js"


const app = express();
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
  }));
app.use(express.json());
app.use(cookieParser());
app.use("/models", modelsRouter);


app.use("/user",userRouter);
app.use("/msg",messageRouter);
app.use("/chat",chatRouter);


const PORT = process.env.PORT||3000;

const startServer = async ()=>{

    try{
        await connectDB();
        await connectRedis();

        app.listen(PORT,()=>{
            console.log(`Server has started listening at port ${process.env.PORT}`);
        })
    }
    catch(err){
        console.log(err);
    }
}

startServer();