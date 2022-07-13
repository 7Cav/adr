const middleware = require("./routes");
const express = require("express");
const apicache = require("apicache");
const app = express()
const cors = require("cors");
const port = 4000;

// cache
let cache = apicache.middleware
app.use(cache('5 minutes'))

app.use(cors({
  origin: '*',
}));
app.use("/roster", middleware);
app.get("/", (req, res) => {
res.send("returned");
});

app.listen(port, () => {
    console.log(`Roster Server listening on ${port}`)
})

  
