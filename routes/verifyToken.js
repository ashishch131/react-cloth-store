const jwt = require("jsonwebtoken");

const verify = (req, res, next) => {
    const authHeaders = req.headers.token;
    if (authHeaders) {
        const token = authHeaders.split(" ")[1];
        jwt.verify(token, process.env.JWT_SEC, (err, user) => {
            if (err) res.status(403).json("Token is not valid");
            req.user = user;
            next();
        });
    } else {
        res.status(401).json("you are not authenticated!")
    }
}

module.exports = verify;