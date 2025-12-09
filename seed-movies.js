require('dotenv').config();
const { Movie } = require('./backend/models/mysql-models');
const { connectDB } = require('./backend/config/mysql-database');

async function seedMovies() {
    try {
        await connectDB();
        console.log('Connected to database');

        // Check existing movies
        const count = await Movie.count();
        if (count > 0) {
            console.log(`Database already has ${count} movies`);
            return;
        }

        // Movies data
        const movies = [
            {
                title: "Top Gun: Maverick",
                synopsis: "Setelah lebih dari 30 tahun menjadi salah satu pilot terbaik Angkatan Laut, Maverick melatih sekelompok lulusan Top Gun untuk menjalankan misi khusus yang berbahaya.",
                genre: "Laga, Drama, Militer",
                duration: 131,
                rating: 8.7,
                posterUrl: "https://m.media-amazon.com/images/M/MV5BZWYzOGEwNTgtNWU3NS00ZTQ0LWJkODUtMmVhMjIwMjA1ZmQwXkEyXkFqcGdeQXVyMjkwOTAyMDU@._V1_SX300.jpg",
                releaseDate: "2022-05-27",
                director: "Joseph Kosinski",
                cast: ["Tom Cruise", "Miles Teller", "Jennifer Connelly"],
                price: 50000,
                showTimes: ["10:00", "13:00", "16:00", "19:00", "21:00"],
                availableSeats: 100,
                isActive: true
            },
            {
                title: "Guardians of the Galaxy Vol. 3",
                synopsis: "Peter Quill dan kru menghadapi misi untuk melindungi salah satu anggota mereka. Petualangan epik yang menguji persahabatan dan keberanian mereka.",
                genre: "Action, Adventure, Sci-Fi",
                duration: 150,
                rating: 8.5,
                posterUrl: "https://m.media-amazon.com/images/M/MV5BMDgxOTdjMzYtZGQxMS00ZTAzLWI4Y2UtMTQzN2VlYjYyZWRiXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_SX300.jpg",
                releaseDate: "2023-05-05",
                director: "James Gunn",
                cast: ["Chris Pratt", "Zoe Saldana", "Dave Bautista"],
                price: 55000,
                showTimes: ["11:00", "14:00", "17:00", "20:00"],
                availableSeats: 100,
                isActive: true
            },
            {
                title: "Oppenheimer",
                synopsis: "Kisah tentang J. Robert Oppenheimer dan perannya dalam pengembangan bom atom selama Perang Dunia II.",
                genre: "Biography, Drama, History",
                duration: 180,
                rating: 9.0,
                posterUrl: "https://m.media-amazon.com/images/M/MV5BMDBmYTZjNjUtN2M1MS00MTQ2LTk2ODgtNzc2M2QyZGE5NTVjXkEyXkFqcGdeQXVyNzAwMjU2MTY@._V1_SX300.jpg",
                releaseDate: "2023-07-21",
                director: "Christopher Nolan",
                cast: ["Cillian Murphy", "Emily Blunt", "Matt Damon"],
                price: 60000,
                showTimes: ["12:00", "15:30", "19:00"],
                availableSeats: 100,
                isActive: true
            }
        ];

        // Insert one by one to see which one fails
        for (const movieData of movies) {
            console.log(`\nInserting: ${movieData.title}`);
            console.log('Data:', JSON.stringify(movieData, null, 2));
            
            const movie = await Movie.create(movieData);
            console.log(`✅ Created: ${movie.title}`);
        }

        console.log('\n✅ All movies seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        console.error('Error details:', error.message);
        process.exit(1);
    }
}

seedMovies();
