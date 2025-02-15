import express, { json } from 'express';
import { connect } from 'mongoose';
import { config } from 'dotenv';
import cors from 'cors';
import userRoutes from './Routes/userRoutes.js';


config();
const app = express();


app.use(cors({
    origin: ['https://cinematrack.vercel.app', 'http://localhost:5173'],
    credentials: true
}));

app.use(json());


app.get('/', (req, res) => {
    res.json({ message: 'Backend is running' });
});

app.use('/api/users', userRoutes);

// Update Vercel configuration
if (process.env.VERCEL) {
    app.use('*', (req, res) => {
        res.json({ message: 'Backend is running' });
    });
}

const PORT = process.env.PORT || 5000;

// Update MongoDB connection
try {
    await connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
} catch (err) {
    console.error('MongoDB connection error:', err);
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Export for Vercel
export default app;