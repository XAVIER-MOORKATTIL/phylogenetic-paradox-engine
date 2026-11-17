const { MongoClient } = require("mongodb");

// STEP 1: Open a MongoDB connection.
async function openMongoConnection() {

    const uri = process.env.MONGODB_URI;
    const databaseName = process.env.MONGODB_DB_NAME;

    // STEP 2: Validate configuration.
    if (!uri || !databaseName) {

        throw new Error(
            "MongoDB configuration is missing."
        );

    }

    // STEP 3: Create the MongoDB client.
    const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 10000
    });

    try {

        // STEP 4: Connect to MongoDB.
        await client.connect();

        const database = client.db(databaseName);

        // STEP 5: Verify connectivity.
        await database.command({
            ping: 1
        });

        return {
            client,
            database
        };

    } catch (error) {

        await client.close().catch(() => {});

        throw error;

    }

}

// STEP 6: Export the connection function.
module.exports = {
    openMongoConnection
};