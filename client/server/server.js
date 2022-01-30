const middleware = require("./routes");
const express = require("express");
const app = express()
const cors = require("cors");
const port = 4000;

app.use(cors({
  origin: '*',
}));
app.use("/roster", middleware);
app.get("/", (req, res) => {
res.send("Ay Lmao!");
});

app.listen(port, () => {
    console.log(`Roster Server listening on ${port}`)
})

  
