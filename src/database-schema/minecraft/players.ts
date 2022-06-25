import mongoose from 'mongoose'

// Schema is the structure of the database

// Tracks which players have which world roles
const schema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
    },
    roleId: {
        type: String,
        required: true
    },
    playerId: {
        type: String,
        required: true
    }
})

export default mongoose.model('players', schema)
