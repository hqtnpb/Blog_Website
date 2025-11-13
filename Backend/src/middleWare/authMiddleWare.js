const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];

    if (token === null) {
        return res.sendStatus(401).json({ error: "No access token" });
    }

    jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Token is not valid" });
        }

        req.user = user;
        next();
    });
};

module.exports = verifyJWT;
