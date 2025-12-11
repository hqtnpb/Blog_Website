const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  console.log("🔐 Auth header:", authHeader ? "Present" : "Missing");

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log("❌ No token found");
    return res.status(401).json({ error: "No access token" });
  }

  jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
    if (err) {
      console.log("❌ Token verification failed:", err.message);
      return res.status(403).json({ error: "Token is not valid" });
    }

    console.log("✅ Token verified for user:", user.id);
    req.user = user;
    next();
  });
};

module.exports = verifyJWT;
