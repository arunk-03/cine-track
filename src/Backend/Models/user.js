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
            runtime: { 
                type: Number, 
                default: 0,
                get: v => Math.round(v || 0),
                set: v => {
                    if (typeof v === 'string') {
                        
                        const parsed = parseInt(v.replace(/\D/g, ''));
                        return isNaN(parsed) ? 0 : parsed;
                    }
                    return v || 0;
                }
            },
            addedAt: { type: Date, default: Date.now }
        },
    ],
    backlogs: [{
        id: String,
        title: String,
        poster: String,
        runtime: { 
            type: Number, 
            default: 0,
            get: v => Math.round(v || 0),
            set: v => {
                if (typeof v === 'string') {
                    const parsed = parseInt(v.replace(/\D/g, ''));
                    return isNaN(parsed) ? 0 : parsed;
                }
                return v || 0;
            }
        },
        addedAt: { type: Date, default: Date.now }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add a middleware to handle runtime conversion before saving
userSchema.pre('save', function(next) {
    if (this.isModified('watchlist')) {
        this.watchlist = this.watchlist.map(movie => {
            if (typeof movie.runtime === 'string') {
                movie.runtime = parseInt(movie.runtime.replace(/\D/g, '')) || 0;
            }
            return movie;
        });
    }
    if (this.isModified('backlogs')) {
        this.backlogs = this.backlogs.map(movie => {
            if (typeof movie.runtime === 'string') {
                movie.runtime = parseInt(movie.runtime.replace(/\D/g, '')) || 0;
            }
            return movie;
        });
    }
    next();
});

export default model("User", userSchema);