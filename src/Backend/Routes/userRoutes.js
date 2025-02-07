import { Router } from 'express';
const router = Router();
import User from '../Models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    console.log("Auth header received:", authHeader); 

    if (!authHeader) {
        console.log("No token provided in the Authorization header");
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    console.log("Extracted token:", token); 

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Token decoded successfully:", decoded);
        req.user = decoded;
        next();
    } catch (err) {
        console.log("Token verification failed:", err.message);
        res.status(400).json({ message: "Invalid token" });
    }
};

router.post('/', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json(err);
    }
});

const saltRounds = 10;

router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        res.status(201).json("User created successfully");
    } catch (err) {
        console.error('Signup error:', err); 
        res.status(400).json(err);
    }
});


router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if (!user) {
            return res.status(401).json({message: 'Invalid email or password'});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({message: 'Invalid email or password'});
        }
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: "1h"});
        res.json({token});
    } catch (err) {
        res.status(500).json(err);
    }
});

router.post('/watchlist', verifyToken, async (req, res) => {
    try {
        const { id, contentType, title, review } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.watchlist.push({ id, contentType, title, review });
        await user.save();
        res.json({ message: 'Movie added to watchlist' });
    } catch (err) {
        res.status(500).json(err);
    }
});

router.post('/backlogs', verifyToken, async (req, res) => {
    try {
        const { id, contentType, title, review } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.backlogs.push({ id, contentType, title, review });
        await user.save();
        res.json({ message: 'Movie added to backlogs' });
    } catch (err) {
        res.status(500).json(err);
    }
});

router.delete('/backlogs/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.backlogs = user.backlogs.filter(movie => movie.id !== id);
        await user.save();
        res.json({ message: 'Movie removed from backlogs' });
    } catch (err) {
        res.status(500).json(err);
    }
});

router.delete('/watchlist/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.watchlist = user.watchlist.filter(movie => movie.id !== id);
        await user.save();
        res.json({ message: 'Movie removed from watchlist' });
    } catch (err) {
        res.status(500).json(err);
    }
});

router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json(err);
    }
});

export default router;