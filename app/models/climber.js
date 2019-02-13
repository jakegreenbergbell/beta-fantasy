var mongoose = require('mongoose');
var bcrypt   = require('bcrypt');

// define the schema for our user model
var climberSchema = mongoose.Schema({
        firstname: String,
        lastname: String,
        tier : String,
        nationality: String,
        rank: Number
});

var Climber = mongoose.model('Climber', climberSchema);

module.exports = Climber;
