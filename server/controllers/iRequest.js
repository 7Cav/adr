const cacheManager = require("../controllers/cacheManager");

module.exports = async (req, res, userName) => {
  let cachedIndividual = await cacheManager.updateCachedIndividual(userName);

  //return cachedIndividual;

  // if (cachedIndividual) {
  res.send(cachedIndividual);
  // } else {
  //   res.send(null);
  // }
};
