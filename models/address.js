const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Address = new Schema ({
    id : { type: Schema.Types.ObjectId },
    address: { type: String, required: true },
    path: { type: String, required: true },
    type: { type: String, required: true },
    createdAt: { type: Date, required: true , default: Date.now},
});

module.exports = mongoose.model('Address', Address)
