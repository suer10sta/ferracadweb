module.exports = (req, res, next) => {
    req.realIp =
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress;
    next();
};