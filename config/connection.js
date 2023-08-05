const mongoose = require("mongoose");

require("dotenv").config();

const connectionToDb = mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const initializeGridBucket = async () => {
    const db = mongoose.connections[0].db;

    const gridBucket = new mongoose.mongo.GridFSBucket(db, {
        bucketName: "griduploads",
    });

    return gridBucket;
};

module.exports = {
    initializeGridBucket,
    connectionToDb
};