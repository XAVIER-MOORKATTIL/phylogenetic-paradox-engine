const helmet = require("helmet");

const {
    rateLimit
} = require("express-rate-limit");

// STEP 1: Configure application security.
function configureSecurity(
    app,
    {
        nodeEnv = process.env.NODE_ENV,
        apiLimit = 120
    } = {}
) {

    const isProduction = nodeEnv === "production";

    // STEP 2: Disable framework identification.
    app.disable("x-powered-by");

    // STEP 3: Configure HTTP security headers.
    app.use(helmet({

        contentSecurityPolicy: {
            directives: {

                "upgrade-insecure-requests":
                    isProduction ? [] : null

            }
        },

        strictTransportSecurity: isProduction
            ? { includeSubDomains: false }
            : false

    }));

    // STEP 4: Prevent caching of API responses.
    app.use("/api", (req, res, next) => {

        res.setHeader(
            "Cache-Control",
            "no-store"
        );

        next();

    });

    // STEP 5: Limit repeated API requests.
    const apiLimiter = rateLimit({

        windowMs: 60 * 1000,

        limit: apiLimit,

        standardHeaders: "draft-8",

        legacyHeaders: false,

        skip: req =>
            req.path === "/health" &&
            req.method === "GET",

        message: {
            success: false,
            error: "Too many requests. Please try again later."
        }

    });

    app.use("/api", apiLimiter);

}

// STEP 6: Export security configuration.
module.exports = {
    configureSecurity
};