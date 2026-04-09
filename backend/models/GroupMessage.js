import mongoose from "mongoose";

const groupMessageSchema = new mongoose.Schema(
    {
        group:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Group",
            required : true
        },
        sender:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        content:{
            type:String,
            required:true
        },
        type:{
            type:String,
            enum:["text" , "image" , "file" ],
            default:"text"
        },
        readBy:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }]

    },
    {timestamps:true}
);

export default mongoose.model("GroupMessage",groupMessageSchema);