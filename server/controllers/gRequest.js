const cacheManager = require("../controllers/cacheManager");

module.exports = async (req, res) => {
  const cachedGroups = cacheManager.getCachedGroups();

  if (cachedGroups) {
    res.send(cachedGroups);
  } else {
    res.status(503).send("Cache is empty");
  }
};
