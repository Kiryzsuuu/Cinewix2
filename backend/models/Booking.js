const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: true
    },
    showtime: {
        date: {
            type: Date,
            required: true
        },
        time: {
            type: String,
            required: true
        },
        studio: {
            type: String,
            required: true
        }
    },
    seats: [{
        seatNumber: String,
        price: Number
    }],
    totalPrice: {
        type: Number,
        required: true
    },
    bookingCode: {
        type: String,
        unique: true,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['transfer', 'credit_card', 'e-wallet', 'cash'],
        default: 'transfer'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', bookingSchema);
