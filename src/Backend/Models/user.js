import { Schema, model } from "mongoose";

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    watchlist: [
        {
            id: { type: String, required: true }, 
            contentType: { type: String, enum: ["movie", "tv-show"], required: true }, 
            title: { type: String, required: true }, 
            review: { type: String, default: "" },
            poster: { type: String, default: "" },
            rating: { 
                type: Number, 
                min: 0,
                max: 5, 
                default: 0,
                validate: {
                    validator: function(v) {
                        return v === 0 || (v >= 1 && v <= 5);
                    },
                    message: props => `${props.value} is not a valid rating!`
                }
            },
            runtime: { type: Number, default: 0 },
            addedAt: { type: Date, default: Date.now }
        },
    ],
    backlogs: [{
        id: String,
        title: String,
        poster: String,
        runtime: String,
        addedAt: { type: Date, default: Date.now }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default model("User", userSchema);