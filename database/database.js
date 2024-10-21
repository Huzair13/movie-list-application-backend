const { MongoClient } = require('mongodb');

let dbo;

const connectToDatabase = async () => {
    // const url_mongodb = process.env.MONGODB_URI;

    const url_mongodb = "mongodb+srv://Huzair13:huz2002@cluster0.bioliew.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

    try {
        const client = await MongoClient.connect(url_mongodb, { useNewUrlParser: true, useUnifiedTopology: true });
        dbo = client.db('Movies');
        console.log('Connected to the movies database');
    } catch (error) {
        console.error('Error connecting to the database:', error);
        throw error;
    }
};

const getDatabaseInstance = () => {
    if (!dbo) {
        throw new Error('Database not connected');
    }
    return dbo;
};

module.exports = { connectToDatabase, getDatabaseInstance };
