import express, { json } from 'express';
import { connect } from 'mongoose';
import { config } from 'dotenv';
import cors from 'cors';
import userRoutes from './Routes/userRoutes.js';
import User from './Models/user.js';

config();
const app = express();

app.use(cors());
app.use(json());

app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

connect(`${process.env.MONGO_URL}`)
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.log(err));