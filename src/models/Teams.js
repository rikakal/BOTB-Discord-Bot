var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var TeamsSchema = new Schema(
    {
        name: { type: String, required: true },
        acronym: { type: String, required: true },
        roleID: { type: String, default: null },
        textChannelID: { type: String, default: null },
        voiceChannelID: { type: String, default: null },
        players: [{ type: Schema.Types.ObjectId, ref:'Players' }],
    }
)

module.exports = mongoose.model('Teams', TeamsSchema);