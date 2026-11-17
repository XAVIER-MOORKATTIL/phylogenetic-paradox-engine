const {
    openMongoConnection
} = require("../src/mongoConnection");

async function checkDatabase() {

    const {
        client,
        database
    } = await openMongoConnection();

    try {

        console.log("MongoDB connection successful.");
        console.log("Database:", database.databaseName);

    } finally {

        await client.close();

    }

}

checkDatabase().catch(error => {

    console.error(
        "MongoDB connection failed:",
        error.name
    );

    process.exitCode = 1;

});