import { Router } from 'express';
const router = Router();
import User from '../Models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { refreshToken } from '../Middleware/auth.js';

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        console.log("Auth header received:", authHeader);

        if (!authHeader) {
            console.log("No token provided in the Authorization header");
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
        console.log("Extracted token:", token);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded);

        // Check if user exists in database
        const user = await User.findById(decoded.id);
        if (!user) {
            console.log("User not found in database");
            return res.status(404).json({ message: "User not found" });
        }

        console.log("Token decoded successfully. User:", user.email);
        req.user = user;
        next();
    } catch (err) {
        console.log("Token verification failed:", err.message);
        res.status(401).json({ message: "Invalid or expired token" });
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
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        const accessToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
        );

        res.status(201).json({
            message: "User created successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            },
            accessToken,
            refreshToken
        });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ message: "Error creating user" });
    }
});


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        
        const accessToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            },
            accessToken,
            refreshToken
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: "Error during login" });
    }
});

router.get('/watchlist', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        
        const sortedWatchlist = user.watchlist.sort((a, b) => 
            new Date(b.addedAt) - new Date(a.addedAt)
        );
        
        res.json(sortedWatchlist);
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        res.status(500).json({ message: error.message });
    }
});

router.post('/watchlist', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('Request body:', req.body);
        const { movie } = req.body;
        
        if (!movie) {
            return res.status(400).json({ message: 'Movie data is required' });
        }

        const exists = user.watchlist.some(m => m.id === movie.id);
        if (exists) {
            return res.status(400).json({ message: 'Movie already in watchlist' });
        }

        // Ensure runtime is a number
        const runtime = typeof movie.runtime === 'string' ? 
            parseInt(movie.runtime.replace(/\D/g, '')) : 
            (typeof movie.runtime === 'number' ? movie.runtime : 0);

        const movieToAdd = {
            ...movie,
            runtime: runtime // Guaranteed to be a number
        };

        console.log('Movie to add:', movieToAdd);

        user.watchlist.push(movieToAdd);
        await user.save();
        
        const sortedWatchlist = user.watchlist.sort((a, b) => 
            new Date(b.addedAt) - new Date(a.addedAt)
        );

        console.log('Movie added to watchlist:', movieToAdd.title, 'Runtime:', movieToAdd.runtime);
        res.json(sortedWatchlist);
    } catch (error) {
        console.error('Detailed error:', error);
        res.status(500).json({ 
            message: error.message,
            details: error.errors ? Object.values(error.errors).map(e => e.message) : []
        });
    }
});

router.post('/backlog', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { movie } = req.body;
        if (!movie) {
            return res.status(400).json({ message: 'Movie data is required' });
        }

        console.log('Received movie data:', movie); 

        
        const exists = user.backlogs.some(m => m.id === movie.id);
        if (exists) {
            return res.status(400).json({ message: 'Movie already in backlog' });
        }

       
        if (!user.backlogs) {
            user.backlogs = []; 
        }

        user.backlogs.push({
            id: movie.id,
            title: movie.title,
            poster: movie.poster,
            addedAt: new Date()
        });

        const savedUser = await user.save();
        console.log('Updated user backlogs:', savedUser.backlogs); 
        
        
        const sortedBacklogs = savedUser.backlogs.sort((a, b) => 
            new Date(b.addedAt) - new Date(a.addedAt)
        );

        res.json(sortedBacklogs);
    } catch (error) {
        console.error('Server error:', error); // Debug log
        res.status(500).json({ message: error.message });
    }
});

router.delete('/backlog/:movieId', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const movieId = req.params.movieId;
        
        if (!user.backlogs) {
            return res.status(404).json({ message: 'Backlog not found' });
        }

        user.backlogs = user.backlogs.filter(movie => movie.id !== movieId);
        const savedUser = await user.save();
        
        res.json(savedUser.backlogs);
    } catch (error) {
        console.error('Error removing from backlog:', error);
        res.status(500).json({ message: error.message });
    }
});

router.delete('/watchlist/:movieId', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const movieId = req.params.movieId;
        
       
        user.watchlist = user.watchlist.filter(movie => movie.id !== movieId);

        await user.save();
        console.log('Movie removed from watchlist:', movieId);
        res.json(user.watchlist);
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        res.status(500).json({ message: error.message });
    }
});

router.post('/refresh-token', refreshToken);

router.get('/me', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ message: "Error fetching user data" });
    }
}); 

router.post('/logout', verifyToken, (req, res) => {
    res.json({ message: "Logged out successfully" });
});


router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json(err);
    }
});


router.patch('/watchlist/:movieId/rating', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { movieId } = req.params;
        const { rating } = req.body;

        // Find and update the movie's rating
        const movie = user.watchlist.find(m => m.id === movieId);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found in watchlist' });
        }

        movie.rating = rating;
        await user.save();
        
        // Sort watchlist by addedAt date before sending response
        const sortedWatchlist = user.watchlist.sort((a, b) => 
            new Date(b.addedAt) - new Date(a.addedAt)
        );
        
        console.log('Rating updated for movie:', movieId);
        res.json(sortedWatchlist);
    } catch (error) {
        console.error('Error updating rating:', error);
        res.status(500).json({ message: error.message });
    }
});

// Add the review update route
router.patch('/watchlist/:movieId/review', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { movieId } = req.params;
        const { review } = req.body;

        // Find and update the movie's review
        const movie = user.watchlist.find(m => m.id === movieId);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found in watchlist' });
        }

        movie.review = review;
        await user.save();
        
        // Sort watchlist by addedAt date before sending response
        const sortedWatchlist = user.watchlist.sort((a, b) => 
            new Date(b.addedAt) - new Date(a.addedAt)
        );
        
        console.log('Review updated for movie:', movieId);
        res.json(sortedWatchlist);
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ message: error.message });
    }
});

// Add this route to fetch backlog movies
router.get('/backlog', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Sort backlogs by addedAt date
        const sortedBacklogs = user.backlogs.sort((a, b) => 
            new Date(b.addedAt) - new Date(a.addedAt)
        );

        res.json(sortedBacklogs);
    } catch (error) {
        console.error('Error fetching backlog:', error);
        res.status(500).json({ message: error.message });
    }
});

router.get('/profile', verifyToken, async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      let totalWatchTime = 0;
      let totalRating = 0;
      let ratedMoviesCount = 0;
  
      for (const movie of user.watchlist) {
        // Runtime is already a number
        if (typeof movie.runtime === 'number') {
          totalWatchTime += movie.runtime;
        }
  
        if (movie.rating > 0) {
          totalRating += movie.rating;
          ratedMoviesCount++;
        }
      }
  
      const averageRating = ratedMoviesCount > 0 
        ? (totalRating / ratedMoviesCount).toFixed(1) 
        : 0;
  
      const profileData = {
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        totalWatchTime: totalWatchTime,
        moviesWatched: user.watchlist.length,
        averageRating: parseFloat(averageRating)
      };
  
      res.json(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ message: 'Error fetching profile data' });
    }
  });

export default router;