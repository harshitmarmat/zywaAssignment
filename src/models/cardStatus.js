const mongoose = require('mongoose');

const DeliveryAttemptSchema = new mongoose.Schema({
    attempt_number: {type : Number},
    status: { type: String, enum: ['DELIVERED', 'EXCEPTION', 'REJECTED'] },
    timestamp: {type:Date},
    comment: {type:String},
});

const CardStatusSchema = new mongoose.Schema({
    card_id: {type :String},
    phone_number: {type : String},
    pickup_timestamp: {type : Date},
    delivery_attempts: {type:[DeliveryAttemptSchema]}, 
    current_status: { type: String, enum: ['PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'RETURNED'] },
    returned: { type: Boolean, default: false }, 
});

const CardStatus = mongoose.model('CardStatus', CardStatusSchema);


module.exports = CardStatus