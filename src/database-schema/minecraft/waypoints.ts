import mongoose from 'mongoose'

// Schema is the structure of the database
const schema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
    },
    // Not technically the object id of the world, but roleId functions as it
    roleId: {
        type: String,
        required: true,
    },
    waypointName: {
        type: String,
        required: true
    },
    coordinateX: {
        type: Number,
        required: true
    },
    coordinateY: {
        type: Number,
        required: true
    },
    coordinateZ: {
        type: Number,
        required: true
    }
})

export default mongoose.model('waypoints', schema)
