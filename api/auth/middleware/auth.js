const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }


    const token = authHeader.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ success: false, message: 'Invalid token.' });
    }
};

module.exports = auth;
