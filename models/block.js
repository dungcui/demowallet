const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Blocks = new Schema ({
    height: { type: Number, required: true },
    createdAt: { type: Date, required: true , default: Date.now},
    updatedAt: { type: Date },

});

module.exports = mongoose.model('Blocks', Blocks)
