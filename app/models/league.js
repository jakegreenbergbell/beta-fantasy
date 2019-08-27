var mongoose = require('mongoose');
var bcrypt   = require('bcrypt');

// define the schema for our user model
var leagueSchema = mongoose.Schema ({
        name : String,
        password: String,
        members: {type:Array, default: []},
        memberAmount : Number,
        groupFull : {type:Boolean, default:false}
});


module.exports = mongoose.model('League', leagueSchema);
