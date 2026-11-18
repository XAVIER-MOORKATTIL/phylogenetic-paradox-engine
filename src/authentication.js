const crypto = require("node:crypto");

const {
    rateLimit
} = require("express-rate-limit");


function configureAuthentication(app, env = process.env) {

    // STEP 1: Require authentication in production.
    const isProduction = env.NODE_ENV === "production";

    const authRequired =
        isProduction || env.APP_AUTH_REQUIRED === "true";

    if (!authRequired) {
        return;
    }


    // STEP 2: Validate credentials.
    const username = env.APP_AUTH_USERNAME;
    const password = env.APP_AUTH_PASSWORD;

    if (
        !username ||
        !/^[A-Za-z0-9_-]+$/.test(username) ||
        !password ||
        password.length < 24
    ) {

        throw new Error(
            "Valid application credentials are required."
        );

    }


    // STEP 3: Validate the allowed application origin.
    const publicOrigin = env.APP_PUBLIC_ORIGIN;

    let parsedOrigin;

    try {

        parsedOrigin = new URL(publicOrigin);

    } catch {

        throw new Error(
            "A valid APP_PUBLIC_ORIGIN is required."
        );

    }

    if (
        parsedOrigin.origin !== publicOrigin ||
        !["http:", "https:"].includes(parsedOrigin.protocol) ||
        (isProduction && parsedOrigin.protocol !== "https:")
    ) {

        throw new Error(
            "Invalid application origin."
        );

    }


    // STEP 4: Generate a fixed-length credential digest.
    const expectedDigest = crypto
        .createHash("sha256")
        .update(`${username}:${password}`)
        .digest();


    function hasValidCredentials(req) {

        const authorization =
            req.get("authorization") || "";

        const match = authorization.match(
            /^Basic ([A-Za-z0-9+/]+={0,2})$/i
        );

        if (!match) {
            return false;
        }

        const suppliedDigest = crypto
            .createHash("sha256")
            .update(Buffer.from(match[1], "base64"))
            .digest();

        return crypto.timingSafeEqual(
            expectedDigest,
            suppliedDigest
        );

    }


    function isHealthRequest(req) {

        return (
            req.path === "/api/health" &&
            ["GET", "HEAD"].includes(req.method)
        );

    }


    // STEP 5: Limit unsuccessful authentication attempts.
    app.use(rateLimit({

        windowMs: 15 * 60 * 1000,

        limit: 10,

        standardHeaders: "draft-8",

        legacyHeaders: false,

        requestPropertyName: "authRateLimit",

        skip: req =>
            isHealthRequest(req) ||
            hasValidCredentials(req),

        message: {
            success: false,
            error: "Too many authentication attempts."
        }

    }));


    // STEP 6: Protect the application.
    app.use((req, res, next) => {

        if (isHealthRequest(req)) {
            return next();
        }

        res.setHeader("Cache-Control", "no-store");

        if (!hasValidCredentials(req)) {

            res.setHeader(
                "WWW-Authenticate",
                'Basic realm="Phylogenetic Paradox Engine", charset="UTF-8"'
            );

            return res.status(401).json({
                success: false,
                error: "Authentication required."
            });

        }


        // STEP 7: Protect state-changing requests.
        if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {

            const origin = req.get("origin");

            const fetchSite =
                req.get("sec-fetch-site");

            if (
                (origin && origin !== publicOrigin) ||
                (fetchSite && fetchSite !== "same-origin") ||
                (!origin && fetchSite !== "same-origin")
            ) {

                return res.status(403).json({
                    success: false,
                    error: "Cross-origin request rejected."
                });

            }

        }

        next();

    });

}


module.exports = {
    configureAuthentication
};