const cacheManager = require("../controllers/cacheManager");

module.exports = async (req, res, userName) => {
  let cachedIndividual = await cacheManager.updateCachedIndividual(userName);

  //return cachedIndividual;

  if (cachedIndividual) {
    res.send(cachedIndividual);
  } else {
    res.status(404).send("User Not Found"); //Generally, if we try to update the cache and it returns null, its because we cannot find the person of interest.
  }
};
