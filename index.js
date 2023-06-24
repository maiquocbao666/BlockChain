const os = require('os');

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Nếu tìm thấy địa chỉ IP bên trong phạm vi địa chỉ IPv4 và đang hoạt động, trả về địa chỉ đó
      if (iface.family === 'IPv4' && !iface.internal && iface.address !== '127.0.0.1') {
        return iface.address;
      }
    }
  }
  
  // Không tìm thấy địa chỉ IP hợp lệ, trả về null
  return null;
}

const bodyParser = require("body-parser")
const express = require("express")
const request = require("request")
const Blockchain = require("./blockchain")
const PubSub = require("./publishsubscribe")

const app = express()
const blockchain = new Blockchain();
const pubsub = new PubSub({ blockchain })

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;
setTimeout(() => pubsub.broadCastChain(), 1000);

app.use(bodyParser.json());
app.get("/api/blocks", (req, res) => {
    res.json(blockchain.chain);
})

app.post("/api/mine", (req, res) => {
    const { data } = req.body;
    blockchain.addBlock({ data });
    pubsub.broadCastChain();
    res.redirect("/api/blocks");
})

const synChains = () => {
    request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const rootChain = JSON.parse(body);
            console.log("Replace chain on sync with", rootChain);
            blockchain.replaceChain(rootChain);
        }
    })
}

let PEER_PORT;

if (process.env.GENERATE_PEER_PORT === 'true') {
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}
const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
    console.log(`listening to PORT: ${PORT}`); 
    synChains();
});