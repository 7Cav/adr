const cacheManager = require("../controllers/cacheManager");

module.exports = async (req, res) => {
  const cachedIndividual = cacheManager.getCachedIndividual();

  if (cachedIndividual) {
    res.send(cachedIndividual);
  } else {
    res.status(503).send("Cache is empty");
  }
};
