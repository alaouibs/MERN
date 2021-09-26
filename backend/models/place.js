const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const placeSchema = new Schema({
    title: { type: String, required: true},
    description: { type: String, required: true},
    image: { type: String, require: true},
    address: { type: String, required: true},
    location: {
        lat: {type: Number, require: true},
        lng: { type: Number, required: true}
    },
    creator: { type: mongoose.Types.ObjectId, require: true, ref: 'User'}
});

module.exports = mongoose.model('Place', placeSchema);