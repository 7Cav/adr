const cacheManager = require('../controllers/cacheManager');

module.exports = async (req, res) => {
    const cachedReserveRoster = cacheManager.getCachedReserveRoster();

    if (cachedReserveRoster) {
        res.send(cachedReserveRoster);
    } else {
        res.status(503).send("Cache is empty");
    }
};