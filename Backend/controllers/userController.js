import User from "../model/userSchema.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { signupSchema,loginSchema } from "../validators/userValidators.js"
import Chat from "../model/chatSchema.js"
import Message from "../model/messageSchema.js"
import { redisClient } from "../config/redis.js"

// signup
// login
// logout
// profile

const createToken = (id,email)=>{

    if(!process.env.JWT_SECRET){
        throw new Error("JWT Secret Key is Missing");
    }

    const token = jwt.sign({id,email},process.env.JWT_SECRET,{expiresIn:"1h"});
    return token;

}

const isProd = process.env.NODE_ENV === "production";

const cookiesOption = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 60 * 60 * 1000,
};

export const signup = async (req,res)=>{
    try{

        const result = signupSchema.safeParse(req.body);

        if(!result.success){
            return res.status(400).json({
                message: result.error.issues[0].message

            })
        }

        const {name,age,email,password} = result.data;

        if(!email || !password || !name){
            return res.status(400).json({
                message: "Email , Password or name some fields are missing."
            })
        }

        const user = await User.findOne({email});

        if(user){
            return res.status(409).json({
                message: "Email ID already exist"
            })
        }



        const hashPassword = await bcrypt.hash(password,12);

        const userCreated = await User.create({
            name,
            age,
            email,
            password: hashPassword
        });

        const token = createToken(userCreated._id,email);

        res.cookie("token",token,cookiesOption);

        res.status(201).json({
            message: "User Created Successfully",
            name,
            age,
            email
        });


    }
    catch(err){
        console.log(err);
        res.status(500).json({
            message: "Internal Server error"
        })
    }
}

export const login = async (req,res)=>{

    try{

        const result = loginSchema.safeParse(req.body);

        if(!result.success){
            return res.status(400).json({
                message: result.error.issues[0].message

            })
        }

        const {email,password} = result.data;

        if(!email || !password){
            return res.status(400).json({
                message: "Email, password or some fields are missing"
            })
        }

        const existingUser = await User.findOne({email});

        if(!existingUser){
            return res.status(401).json({
                message: "Invalid Credentials"
            })
        }

        const isMatch = await bcrypt.compare(password,existingUser.password);

        if(!isMatch){
            return res.status(401).json({
                message: "Invalid Credentials"
            })
        }

        const token = createToken(existingUser._id,email);

        res.cookie("token",token,cookiesOption);

        res.status(200).json({
            message: "User logged in Successfully",
            name: existingUser.name,
            age: existingUser.age,
            email: existingUser.email,
            usage: existingUser.usage
        })
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }

}

export const logout = async (req,res)=>{
    
    try{

        if(req.token){
            const token = req.token;
            const payload = req.tokenPayload;

            const currentTime = Math.floor(Date.now() / 1000);
            const remainingTime = payload.exp - currentTime;

            if (remainingTime > 0) {
                await redisClient.set(
                    `blocklist:${token}`,
                    "blocked",
                    {
                        EX: remainingTime
                    }
                );
            }
        }

        res.clearCookie("token",{
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
        })

        res.status(200).json({
            message: "User logged Out Successfully"
        })
    }
    catch(error){
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

// export const profile = async (req,res)=>{
//     try{
//         const {email} = req.body;

//         if(!email){
//             res.status(400).json({
//                 message: "Email is missing"
//             })
//         }

//         const existingUser = User.findOne({email});

//         if(!existingUser){
//             return res.status(401).json({
//                 message: "User not found"
//             })
//         }

//         res.status(200).json({
//             name: existingUser.name,
//             age: existingUser.age,
//             usage: existingUser.usage,
//             email: existingUser.email
//         })

//     }
//     catch(err){
//         console.log(err);
//         res.status(500).json({
//             message: "Internal Server error"
//         })
//     }
// }

export const profile = async(req,res)=>{
    try{
        res.status(200).json({
            name: req.user.name,
            age: req.user.age,
            usage: req.user.usage,
            email: req.user.email
        })
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const deleteAccount = async(req,res)=>{
    try {
        const userId = req.user._id;
    
        const chats = await Chat.find({ userId }).select("_id");
    
        await Message.deleteMany({
          chatId: { $in: chats }
        });
    
        await Chat.deleteMany({
          userId
        });
    
        await User.deleteOne({
          _id: userId
        });
    
        res.clearCookie("token", {
          httpOnly: true,
          secure: isProd,
          sameSite: isProd ? "none" : "lax",
        });
    
        res.status(200).json({
          message: "Account deleted successfully"
        });
    
      } catch (err) {
        res.status(500).json({
          message: "Internal Server error"
        });
      }
}