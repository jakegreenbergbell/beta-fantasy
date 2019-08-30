var mongoose = require('mongoose');
var bcrypt   = require('bcrypt');

// define the schema for our user model
var leagueSchema = mongoose.Schema ({
        name : String,
        password: String,
        members: Array,
        memberAmount : {type:Number, default: 1},
        groupFull : {type:Boolean, default:false}
});


module.exports = mongoose.model('League', leagueSchema);
