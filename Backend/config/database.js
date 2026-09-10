import mongoose from "mongoose"


const connectDB = async ()=>{

    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to Database Successfully");

}

export default connectDB;