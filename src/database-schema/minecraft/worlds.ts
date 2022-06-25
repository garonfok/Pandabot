import mongoose from 'mongoose'

// Schema is the structure of the database

// Tracks Minecraft worlds and their corresponding Discord roles
const schema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
    },
    roleId: {
        type: String,
        required: true
    },
    worldName: {
        type: String,
        unique: true,
        required: true
    },
    seed: {
        type: String,
        required: false
    }
})

export default mongoose.model('worlds', schema)
