const cacheManager = require("../controllers/cacheManager");

module.exports = async (req, res) => {
  const cachedCombatRoster = cacheManager.getCachedCombatRoster();

  if (cachedCombatRoster) {
    res.send(cachedCombatRoster);
  } else {
    res.status(503).send("Cache is empty");
  }
};
