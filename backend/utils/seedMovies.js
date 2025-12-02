require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('../models/Movie');

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
        cast: ["Tom Cruise", "Miles Teller", "Jennifer Connelly", "Jon Hamm", "Glen Powell", "Ed Harris", "Val Kilmer"],
        language: "English",
        ageRating: "13+",
        isActive: true
    },
    {
        title: "Guardians of the Galaxy Vol. 3",
        description: "Peter Quill dan kru menghadapi misi untuk melindungi salah satu anggota mereka, yang jika gagal, bisa mengakhiri Guardians selamanya.",
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
    },
    {
        title: "Barbie",
        description: "Barbie dan Ken memiliki hari terbaik setiap hari. Namun, ketika mereka berkesempatan pergi ke dunia nyata, mereka segera menemukan kesenangan dan bahaya hidup di luar Barbie Land.",
        genre: ["Comedy", "Adventure", "Fantasy"],
        duration: 114,
        rating: 7.8,
        posterUrl: "https://m.media-amazon.com/images/M/MV5BNjU3N2QxNzYtMjk1NC00MTc4LTk1NTQtMmUxNTljM2I0NDA5XkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_SX300.jpg",
        trailerUrl: "https://www.youtube.com/watch?v=pBk4NYhWNMM",
        releaseDate: new Date("2023-07-21"),
        director: "Greta Gerwig",
        cast: ["Margot Robbie", "Ryan Gosling", "Will Ferrell"],
        language: "English",
        ageRating: "13+",
        isActive: true
    },
    {
        title: "Spider-Man: Across the Spider-Verse",
        description: "Miles Morales melanjutkan petualangan Spider-Man di seluruh multiverse bersama Gwen Stacy dan tim Spider-People baru untuk menghadapi penjahat yang lebih kuat dari sebelumnya.",
        genre: ["Animation", "Action", "Adventure"],
        duration: 140,
        rating: 8.9,
        posterUrl: "https://m.media-amazon.com/images/M/MV5BMzI0NmVkMjEtYmY4MS00ZDMxLTlkZmEtMzU4MDQxYTMzMjU2XkEyXkFqcGdeQXVyMzQ0MzA0NTM@._V1_SX300.jpg",
        trailerUrl: "https://www.youtube.com/watch?v=cqGjhVJWtEg",
        releaseDate: new Date("2023-06-02"),
        director: "Joaquim Dos Santos",
        cast: ["Shameik Moore", "Hailee Steinfeld", "Brian Tyree Henry"],
        language: "English",
        ageRating: "13+",
        isActive: true
    },
    {
        title: "John Wick: Chapter 4",
        description: "John Wick menemukan jalan untuk mengalahkan The High Table. Tapi sebelum dia bisa meraih kebebasan, Wick harus berhadapan dengan musuh baru dengan aliansi kuat di seluruh dunia dan kekuatan yang mengubah teman lama menjadi musuh.",
        genre: ["Action", "Crime", "Thriller"],
        duration: 169,
        rating: 8.2,
        posterUrl: "https://m.media-amazon.com/images/M/MV5BMDExZGMyOTMtMDgyYi00NGIwLWJhMTEtOTdkZGFjNmZiMTEwXkEyXkFqcGdeQXVyMjM4NTM5NDY@._V1_SX300.jpg",
        trailerUrl: "https://www.youtube.com/watch?v=qEVUtrk8_B4",
        releaseDate: new Date("2023-03-24"),
        director: "Chad Stahelski",
        cast: ["Keanu Reeves", "Donnie Yen", "Bill Skarsgård"],
        language: "English",
        ageRating: "17+",
        isActive: true
    },
    {
        title: "Fast X",
        description: "Dom Toretto dan keluarganya menjadi sasaran putra penguasa narkoba Hernan Reyes yang pendendam.",
        genre: ["Action", "Crime", "Thriller"],
        duration: 141,
        rating: 5.8,
        posterUrl: "https://m.media-amazon.com/images/M/MV5BNzVlYjM2ZjEtZGRjNy00YzZiLWFiODctNDYzYmM2Y2Y0YTE1XkEyXkFqcGdeQXVyMjkwOTAyMDU@._V1_SX300.jpg",
        trailerUrl: "https://www.youtube.com/watch?v=32RAq6JzY-w",
        releaseDate: new Date("2023-05-19"),
        director: "Louis Leterrier",
        cast: ["Vin Diesel", "Jason Statham", "Michelle Rodriguez"],
        language: "English",
        ageRating: "13+",
        isActive: true
    },
    {
        title: "Indiana Jones and the Dial of Destiny",
        description: "Arkeolog legendary Indiana Jones kembali untuk petualangan terakhir yang epik.",
        genre: ["Action", "Adventure"],
        duration: 154,
        rating: 6.8,
        posterUrl: "https://m.media-amazon.com/images/M/MV5BZjIxNTVmNjMtYjc4OS00ZjE0LWE3ZjMtNzgzYjM4N2NlYTk0XkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_SX300.jpg",
        trailerUrl: "https://www.youtube.com/watch?v=ZMysDTCp_mc",
        releaseDate: new Date("2023-06-30"),
        director: "James Mangold",
        cast: ["Harrison Ford", "Phoebe Waller-Bridge", "Antonio Banderas"],
        language: "English",
        ageRating: "13+",
        isActive: true
    },
    {
        title: "The Little Mermaid",
        description: "Putri duyung muda yang bersemangat membuat kesepakatan dengan penyihir laut untuk hidup di darat dan memenangkan hati seorang pangeran.",
        genre: ["Adventure", "Family", "Fantasy"],
        duration: 135,
        rating: 7.2,
        posterUrl: "https://m.media-amazon.com/images/M/MV5BYTUzMDQyYjMtZGFhNi00MzI0LWE3NTAtYWNiNzVjMjBmMWYzXkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_SX300.jpg",
        trailerUrl: "https://www.youtube.com/watch?v=kpGo2_d3oYE",
        releaseDate: new Date("2023-05-26"),
        director: "Rob Marshall",
        cast: ["Halle Bailey", "Jonah Hauer-King", "Melissa McCarthy"],
        language: "English",
        ageRating: "SU",
        isActive: true
    },
    {
        title: "Transformers: Rise of the Beasts",
        description: "Pertarungan di Bumi tidak lagi hanya antara Autobots dan Decepticons... Maximals, Predacons, dan Terrorcons bergabung dalam perang yang akan menentukan nasib umat manusia.",
        genre: ["Action", "Adventure", "Sci-Fi"],
        duration: 127,
        rating: 6.2,
        posterUrl: "https://m.media-amazon.com/images/M/MV5BZTI3ZTM0NGYtNGRkOC00MTc2LTk2YzYtNzc0NmY3YmY0ZTdlXkEyXkFqcGdeQXVyMTEyMjM2NDc2._V1_SX300.jpg",
        trailerUrl: "https://www.youtube.com/watch?v=WWonhxaDQUw",
        releaseDate: new Date("2023-06-09"),
        director: "Steven Caple Jr.",
        cast: ["Anthony Ramos", "Dominique Fishback", "Luna Lauren Velez"],
        language: "English",
        ageRating: "13+",
        isActive: true
    }
];

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

const seedMovies = async () => {
    try {
        await connectDB();
        
        // Clear existing movies
        await Movie.deleteMany({});
        console.log('Existing movies cleared');
        
        // Insert new movies
        await Movie.insertMany(movies);
        console.log('Movies seeded successfully!');
        
        process.exit(0);
    } catch (error) {
        console.error('Error seeding movies:', error);
        process.exit(1);
    }
};

seedMovies();
