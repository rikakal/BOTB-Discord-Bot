var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PlayersSchema = new Schema(
    {
        firstname: { type: String, required: true },
        lastname: { type: String, required: true },
        email: { type: String, required: true },
        discord: { type: String, required: true },
        discordID: {type: String, default: null },
    }
)

module.exports = mongoose.model('Players', PlayersSchema);