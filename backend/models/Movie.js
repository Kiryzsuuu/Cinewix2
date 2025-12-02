const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true,
        trim: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    genre: {
        type: [String],
        required: true
    },
    duration: {
        type: Number,
        required: true // in minutes
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 10
    },
    posterUrl: {
        type: String
    },
    trailerUrl: {
        type: String
    },
    releaseDate: {
        type: Date,
        required: true
    },
    director: {
        type: String
    },
    cast: {
        type: [String]
    },
    language: {
        type: String,
        default: 'Indonesian'
    },
    ageRating: {
        type: String,
        enum: ['SU', '13+', '17+', '21+'],
        default: 'SU'
    },
    reviews: {
        type: [reviewSchema],
        default: []
    },
    averageUserRating: {
        type: Number,
        default: 0
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

movieSchema.methods.recalculateUserRatings = function recalculateUserRatings() {
    if (!this.reviews || this.reviews.length === 0) {
        this.averageUserRating = 0;
        this.reviewCount = 0;
        return;
    }

    const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.reviewCount = this.reviews.length;
    this.averageUserRating = Math.round((total / this.reviewCount) * 10) / 10;
};

module.exports = mongoose.model('Movie', movieSchema);
