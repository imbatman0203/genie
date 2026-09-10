import Chat from "../model/chatSchema.js"
import Message from "../model/messageSchema.js"
import mongoose from "mongoose"
import {generateAIResponse} from "../service/openRouterService.js"
import {buildMessagesForAI} from "../utils/chatContext.js"
import {
  addUserTokenUsage
} from "../utils/userUsage.js";
import { addChatTokenUsage } from "../utils/tokenUsage.js";
import { updateSummaryIfNeeded } from "../service/summaryService.js";
import { redisClient } from "../config/redis.js"

// getMessage, sendMessage

export const getMessage = async (req,res)=>{
    try{
        const {chatId} = req.params;

        const chat = await Chat.findOne({
            _id: chatId,
            userId: req.user._id
        });

        if(!chat){
            return res.status(404).json({
                message: "Chat Not found"
            })
        }

        const messages = await Message.find({
            chatId: chatId
        }).sort({createdAt: 1});

        res.status(200).json({
            message: "Your all messages are here.",
            msg: messages
        })
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            message: "Internal Server error"
        })
    }
}


export const sendMessage = async (req, res) => {

  try {
    const { chatId } = req.params;
    const { content, model } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({
        message: "Message content is required",
      });
    }

    //redis

    let chat;

    if (chatId) {
      chat = await Chat.findOne({
        _id: chatId,
        userId: req.user._id,
      });

      if (!chat) {
        return res.status(404).json({
          message: "Chat not found",
        });
      }
    } else {
      const selectedModel = model || process.env.DEFAULT_AI_MODEL;

      if (!selectedModel) {
        return res.status(400).json({
          message: "Model is required for new chat",
        });
      }

      chat = await Chat.create({
        userId: req.user._id,
        model: selectedModel,
        topic: content.trim().slice(0, 40),
      });
    }

    const oldMessages = await Message.find({
      chatId: chat._id,
    })
      .sort({ createdAt: 1 })
      .skip(chat.summarizedTillMessageNumber);

    const messagesForAI = buildMessagesForAI({
      chat,
      oldMessages,
      currentMessage: content.trim(),
    });

    const { aiReply, usage } = await generateAIResponse({
      model: chat.model,
      messages: messagesForAI,
    });

    const userMessage = await Message.create({
      chatId: chat._id,
      role: "user",
      content: content.trim(),
      userId: req.user._id
    });

    const assistantMessage = await Message.create({
      chatId: chat._id,
      role: "assistant",
      content: aiReply,
       userId: req.user._id,
       usage,
    });

    chat.messageCount += 2;

    if (chat.topic === "New Chat") {
      chat.topic = content.trim().slice(0, 40);
    }


    await addChatTokenUsage(chat, usage);
    await addUserTokenUsage(req.user, usage.totalTokens);

    // redis
    const tokenUsed = await redisClient.incrBy(
      req.tokenUsageKey,
      usage.totalTokens
  );
  
  if (tokenUsed === usage.totalTokens) {
      await redisClient.expire(
          req.tokenUsageKey,
          Number(process.env.TOKEN_WINDOW_SECONDS)
      );
  }

  updateSummaryIfNeeded(chat._id).catch((err) => {
    console.log("Summary update failed:", err.message);
  });

  return res.status(201).json({
    message: "Message sent successfully",
    chatId: chat._id,
    reply: aiReply,
    usage,
    tokenUsed,
    tokenLimit: Number(process.env.TOKEN_LIMIT),
    userMessage,
    assistantMessage
});

  } catch (err) {
    console.log("sendMessage error:", err.message);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};


