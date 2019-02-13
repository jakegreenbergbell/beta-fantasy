var mongoose = require('mongoose');
var bcrypt   = require('bcrypt');

// define the schema for our user model
var dataSchema = mongoose.Schema ({

        username : String,  //email used for login
        tier1 : Array,
        tier2 : Array,
        tier3 : Array,
        groups : Array
});

var Data = mongoose.model('Data', dataSchema);

module.exports = Data;
