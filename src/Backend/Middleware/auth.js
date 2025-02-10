import jwt from 'jsonwebtoken';
import User from '../Models/user.js';

export const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "User no longer exists." });
        }

        req.user = user;
        next();
    } catch (err) {
        console.log("Token verification failed:", err.message);
        res.status(401).json({ message: "Invalid or expired token" });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token required" });
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const accessToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        res.status(401).json({ message: "Invalid refresh token" });
    }
};