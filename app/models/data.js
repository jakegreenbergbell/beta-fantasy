var mongoose = require('mongoose');
var bcrypt   = require('bcrypt');

// define the schema for our user model
var dataSchema = mongoose.Schema ({
        username : String,
        tier1 : Array,
        tier2 : Array,
        tier3 : Array,
        tierFull1: { type: Boolean, default: false },
        tierFull2: { type: Boolean, default: false },
        tierFull3: { type: Boolean, default: false },
        groups : Array
});


module.exports = mongoose.model('Data', dataSchema);

// var Data = mongoose.model('Data', dataSchema);
// module.exports = Data;
