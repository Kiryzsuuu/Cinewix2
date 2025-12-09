const express = require('express');
const router = express.Router();
const { Movie } = require('../models/mysql-models');
const { connectDB } = require('../config/mysql-database');

// GET /api/seed - Seed database with initial data
router.get('/', async (req, res) => {
    try {
        await connectDB();
        // Check if movies already exist
        const existingMovies = await Movie.count();
        
        if (existingMovies > 0) {
            return res.json({
                success: true,
                message: 'Database sudah berisi data',
                moviesCount: existingMovies
            });
        }

        // Seed movies
        const movies = [
            {
                title: "Top Gun: Maverick",
                description: "Setelah lebih dari 30 tahun menjadi salah satu pilot terbaik Angkatan Laut, Maverick melatih sekelompok lulusan Top Gun untuk menjalankan misi khusus yang berbahaya.",
                genre: ["Laga", "Drama", "Militer"],
                duration: 131,
                rating: 8.7,
                posterUrl: "https://m.media-amazon.com/images/M/MV5BZWYzOGEwNTgtNWU3NS00ZTQ0LWJkODUtMmVhMjIwMjA1ZmQwXkEyXkFqcGdeQXVyMjkwOTAyMDU@._V1_SX300.jpg",
                trailerUrl: "https://www.youtube.com/watch?v=qSqVVswa420",
                releaseDate: new Date("2022-05-27"),
                director: "Joseph Kosinski",
                cast: ["Tom Cruise", "Miles Teller", "Jennifer Connelly"],
                language: "English",
                ageRating: "13+",
                isActive: true
            },
            {
                title: "Guardians of the Galaxy Vol. 3",
                description: "Peter Quill dan kru menghadapi misi untuk melindungi salah satu anggota mereka.",
                genre: ["Action", "Adventure", "Sci-Fi"],
                duration: 150,
                rating: 8.5,
                posterUrl: "https://m.media-amazon.com/images/M/MV5BMDgxOTdjMzYtZGQxMS00ZTAzLWI4Y2UtMTQzN2VlYjYyZWRiXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_SX300.jpg",
                trailerUrl: "https://www.youtube.com/watch?v=u3V5KDHRQvk",
                releaseDate: new Date("2023-05-05"),
                director: "James Gunn",
                cast: ["Chris Pratt", "Zoe Saldana", "Dave Bautista"],
                language: "English",
                ageRating: "13+",
                isActive: true
            },
            {
                title: "Oppenheimer",
                description: "Kisah tentang J. Robert Oppenheimer dan perannya dalam pengembangan bom atom.",
                genre: ["Biography", "Drama", "History"],
                duration: 180,
                rating: 9.0,
                posterUrl: "https://m.media-amazon.com/images/M/MV5BMDBmYTZjNjUtN2M1MS00MTQ2LTk2ODgtNzc2M2QyZGE5NTVjXkEyXkFqcGdeQXVyNzAwMjU2MTY@._V1_SX300.jpg",
                trailerUrl: "https://www.youtube.com/watch?v=uYPbbksJxIg",
                releaseDate: new Date("2023-07-21"),
                director: "Christopher Nolan",
                cast: ["Cillian Murphy", "Emily Blunt", "Matt Damon"],
                language: "English",
                ageRating: "17+",
                isActive: true
            }
        ];

        await Movie.bulkCreate(movies);

        res.json({
            success: true,
            message: 'Database berhasil di-seed',
            moviesCreated: movies.length
        });

    } catch (error) {
        console.error('Seed error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal seed database',
            error: error.message
        });
    }
});

module.exports = router;
