const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    image: String,
    created_at: Date
});

const Image = mongoose.model('Image', ImageSchema);

module.exports = Image;