import { Schema, model } from 'mongoose';

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address'] 
    },
    password: { type: String, required: true, minlength: 6 }
}, { timestamps: true });

export default model('User', userSchema);