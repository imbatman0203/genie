import Message from "../model/messageSchema.js"
import Chat from "../model/chatSchema.js"


// getRecentChat : top 20 , getSingleChat , createChat , deleteChat

export const getRecentChat = async (req,res)=>{

    try{

        const chats = await Chat.find({userId : req.user._id}).select("topic updatedAt").sort({updatedAt : -1}).limit(20);

        res.status(200).json({
            message: "Your all recent chats",
            chats
        })
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            message: "Internal Server error"
        })
    }
}

export const getSingleChat = async (req,res)=>{


    try{
        const {chatId} = req.params;
        const chat = await Chat.findOne({
            _id : chatId,
            userId : req.user._id
        });

        if(!chat){
            return res.status(404).json({
                message: "Sorry not data found"
            })
        }

        res.status(200).json({
            chatId: chat._id,
            userId: chat.userId,
            topic: chat.topic,
            usage: chat.usage
        })

    }
    catch(err){
        console.log(err);
        res.status(500).json({
            message: "Internal Server error"
        })
    }

}

export const createChat = async (req,res)=>{


    try{
        const { model } = req.body;

        if(!model){
            return res.status(400).json({
                message: "Model name is missing"
            })
        }

        // model name jo bheja vo sahi hai ya nhi

        const chats = await Chat.create({
            userId: req.user._id,
            model
        })

        res.status(201).json({
            chatId: chats._id,
            userId: req.user._id,
            model,
            topic: chats.topic,
            createdAt: chats.createdAt
        })

    }
    catch(err){
        console.log(err);
        res.status(500).json({
            message: "Internal Server error"
        })
    }
}

export const deleteChat = async (req,res)=>{
    
    try{
        const { chatId } = req.params;

        const chat = await Chat.findOne({_id:chatId , userId: req.user._id});

        if(!chat){
            return res.status(403).json({
                message: "You are not allowed to do this."
            })
        }

        await Chat.deleteOne({
            _id: chatId
        });

        await Message.deleteMany({
            chatId : chat._id
        })

        res.status(200).json({
            message: "Your chat deleted successfully"
        })
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            message: "Internal Server error"
        })
    }
}

