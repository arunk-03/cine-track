import { Schema, model } from "mongoose";

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    watchlist: [
        {
            id: { type: String, required: true }, // Movie/TV show ID
            contentType: { type: String, enum: ["movie", "tv-show"], required: true }, // "movie" or "tv-show"
            title: { type: String, required: true }, // Title of the content
            review: { type: String, default: "" }, // User's review
            addedAt: { type: Date, default: Date.now }, // Timestamp
        },
    ],
    backlogs: [
        {
            id: { type: String, required: true }, // Movie/TV show ID
            contentType: { type: String, enum: ["movie", "tv-show"], required: true }, // "movie" or "tv-show"
            title: { type: String, required: true }, // Title of the content
            review: { type: String, default: "" }, // User's review
            addedAt: { type: Date, default: Date.now }, // Timestamp
        },
    ],
});

export default model("User", userSchema);