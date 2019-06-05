const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Fundings = new Schema ({
    id : { type: Schema.Types.ObjectId },
    transactionHash: { type: String, required: true },
    outputIndex: { type: String, required: true },
    blockHeight: { type: Number, required: true },
    amount: { type: Number, required: true },
    addressId: { type: String, required: true },
    updatedAt: { type: Date, required: true },
    createdAt: { type: Date, required: true , default: Date.now},
});

module.exports = mongoose.model('Fundings', Fundings)
