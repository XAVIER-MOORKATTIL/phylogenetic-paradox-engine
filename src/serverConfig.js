// STEP 1: Define a configuration error.
class ServerConfigurationError extends Error {

    constructor(message) {

        super(message);

        this.name = "ServerConfigurationError";
        this.code = "INVALID_SERVER_CONFIGURATION";

    }

}


// STEP 2: Read and validate environment variables.
function getServerConfig(env = process.env) {

    const nodeEnv = env.NODE_ENV ?? "development";

    const rawPort = env.PORT ?? "3000";

    const port = Number(rawPort);

    const storageBackend =
        env.ANALYSIS_STORAGE_BACKEND ?? "file";


    // STEP 3: Validate the runtime environment.
    if (!["development", "test", "production"].includes(nodeEnv)) {

        throw new ServerConfigurationError(
            "Invalid NODE_ENV value."
        );

    }


    // STEP 4: Validate the server port.
    if (
        !/^\d+$/.test(rawPort) ||
        !Number.isInteger(port) ||
        port < 1 ||
        port > 65535
    ) {

        throw new ServerConfigurationError(
            "PORT must be an integer between 1 and 65535."
        );

    }


    // STEP 5: Validate the storage backend.
    if (!["file", "mongodb"].includes(storageBackend)) {

        throw new ServerConfigurationError(
            "Unsupported analysis storage backend."
        );

    }


    // STEP 6: Require MongoDB in production.
    if (
        nodeEnv === "production" &&
        storageBackend !== "mongodb"
    ) {

        throw new ServerConfigurationError(
            "Production requires MongoDB storage."
        );

    }


    // STEP 7: Validate MongoDB configuration.
    if (storageBackend === "mongodb") {

        if (
            !env.MONGODB_URI?.trim() ||
            !env.MONGODB_DB_NAME?.trim()
        ) {

            throw new ServerConfigurationError(
                "MongoDB configuration is missing."
            );

        }

    }


    // STEP 8: Return validated configuration.
    return {
        nodeEnv,
        port,
        storageBackend
    };

}


module.exports = {
    ServerConfigurationError,
    getServerConfig
};