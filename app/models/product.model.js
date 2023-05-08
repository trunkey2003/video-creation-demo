const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const product = new Schema({
    name: {type: String, required: true, minlength: 3, maxlength: 50},
    price: {type: Number, required: true},
    description: {type: String, required: true, minlength: 3, maxlength: 500},
    image: {type: String, required: true, default: "https://trunkey2003.github.io/general-img/no-image.jpg"},
    category: {type: String, required: true, default: 'other'},
    quantity: {type: Number, required: true, default: 0},
},
{
    timestamps: true
});

module.exports = mongoose.model('product', product);