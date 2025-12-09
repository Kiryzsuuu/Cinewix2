const { Movie } = require('../models/mysql-models');
const { connectDB } = require('../config/mysql-database');
const { Op } = require('sequelize');

// Get all movies
const getAllMovies = async (req, res) => {
    try {
        // In Vercel, connection is already established in mysql-database.js
        // Only call connectDB in development
        if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
            await connectDB();
        }
        
        const movies = await Movie.findAll({
            where: { isActive: true },
            order: [['releaseDate', 'DESC']],
            attributes: { exclude: ['reviews'] }
        });
        
        res.json({
            success: true,
            count: movies.length,
            movies
        });
    } catch (error) {
        console.error('Get movies error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat mengambil data film',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Get movie by ID
const getMovieById = async (req, res) => {
    try {
        await connectDB();
        const movie = await Movie.findByPk(req.params.id);
        
        if (!movie) {
            return res.status(404).json({ 
                success: false, 
                message: 'Film tidak ditemukan' 
            });
        }

        if (movie.reviews && movie.reviews.length > 0) {
            movie.reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        res.json({
            success: true,
            movie
        });
    } catch (error) {
        console.error('Get movie error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat mengambil data film',
            error: error.message 
        });
    }
};

// Create movie (admin only)
const createMovie = async (req, res) => {
    try {
        const movie = await Movie.create(req.body);
        
        res.status(201).json({
            success: true,
            message: 'Film berhasil ditambahkan',
            movie
        });
    } catch (error) {
        console.error('Create movie error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat menambahkan film',
            error: error.message 
        });
    }
};

// Update movie (admin only)
const updateMovie = async (req, res) => {
    try {
        await connectDB();
        const movie = await Movie.findByPk(req.params.id);
        
        if (!movie) {
            return res.status(404).json({ 
                success: false, 
                message: 'Film tidak ditemukan' 
            });
        }
        
        await movie.update(req.body);

        res.json({
            success: true,
            message: 'Film berhasil diupdate',
            movie
        });
    } catch (error) {
        console.error('Update movie error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat mengupdate film',
            error: error.message 
        });
    }
};

// Delete movie (admin only)
const deleteMovie = async (req, res) => {
    try {
        await connectDB();
        const movie = await Movie.findByPk(req.params.id);
        
        if (!movie) {
            return res.status(404).json({ 
                success: false, 
                message: 'Film tidak ditemukan' 
            });
        }
        
        await movie.destroy();

        res.json({
            success: true,
            message: 'Film berhasil dihapus'
        });
    } catch (error) {
        console.error('Delete movie error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat menghapus film',
            error: error.message 
        });
    }
};

// Search movies
const searchMovies = async (req, res) => {
    try {
        const { query } = req.query;
        
        const movies = await Movie.find({
            isActive: true,
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { genre: { $regex: query, $options: 'i' } },
                { director: { $regex: query, $options: 'i' } }
            ]
        }).select('-reviews');

        res.json({
            success: true,
            count: movies.length,
            movies
        });
    } catch (error) {
        console.error('Search movies error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat mencari film',
            error: error.message 
        });
    }
};

const addMovieReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;

        const numericRating = Number(rating);
        if (!rating || Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating harus antara 1 hingga 5'
            });
        }

        if (!comment || !comment.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Komentar tidak boleh kosong'
            });
        }

        const movie = await Movie.findById(req.params.id);

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Film tidak ditemukan'
            });
        }

        const userId = req.user._id;
        const userName = [req.user.firstName, req.user.lastName].filter(Boolean).join(' ') || req.user.email;

        const existingReview = movie.reviews.find(review => review.user.toString() === userId.toString());
        const isUpdate = Boolean(existingReview);
        const trimmedComment = comment.trim();

        if (existingReview) {
            existingReview.rating = numericRating;
            existingReview.comment = trimmedComment;
            existingReview.userName = userName;
            existingReview.updatedAt = new Date();
        } else {
            movie.reviews.push({
                user: userId,
                userName,
                rating: numericRating,
                comment: trimmedComment
            });
        }

        movie.recalculateUserRatings();
        movie.markModified('reviews');

        await movie.save();

        const movieData = movie.toObject();
        if (movieData.reviews && movieData.reviews.length > 0) {
            movieData.reviews = movieData.reviews
                .slice()
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        res.json({
            success: true,
            message: isUpdate ? 'Review berhasil diperbarui' : 'Review berhasil ditambahkan',
            movie: movieData
        });
    } catch (error) {
        console.error('Add movie review error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat menyimpan review',
            error: error.message
        });
    }
};

module.exports = {
    getAllMovies,
    getMovieById,
    createMovie,
    updateMovie,
    deleteMovie,
    searchMovies,
    addMovieReview
};
