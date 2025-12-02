const express = require('express');
const router = express.Router();
const {
    getAllMovies,
    getMovieById,
    createMovie,
    updateMovie,
    deleteMovie,
    searchMovies,
    addMovieReview
} = require('../controllers/movieController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/', getAllMovies);
router.get('/search', searchMovies);
router.get('/:id', getMovieById);
router.post('/', authMiddleware, adminMiddleware, createMovie);
router.put('/:id', authMiddleware, adminMiddleware, updateMovie);
router.delete('/:id', authMiddleware, adminMiddleware, deleteMovie);
router.post('/:id/reviews', authMiddleware, addMovieReview);

module.exports = router;
