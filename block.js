const hexToBinary = require("hex-to-binary");
const { GENESIS_DATA, MINE_RATE } = require("./config");
const cryptoHash = require("./crypto-hash");

class Block {
    constructor({ timestamp, prevHash, hash, data, nonce, difficulty }) {
        this.timestamp = timestamp;
        this.prevHash = prevHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty;
    }
    // khởi tạo block đầu tiên
    static genesis() {
        return new this(GENESIS_DATA);
    }
    // đào block
    static mineBlock({ prevBlock, data }) {
        let hash, timestamp;
        const prevHash = prevBlock.hash;
        let { difficulty } = prevBlock;

        let nonce = 0;
        do {
            nonce++;
            timestamp = Date.now(); //00cdef, 00
            difficulty = Block.adjustDifficulty({
                originalBlock: prevBlock,
                timestamp,
            });
            hash = cryptoHash(
                timestamp,
                prevHash,
                data,
                nonce,
                difficulty
            );
        } while (hexToBinary(hash).substring(0, difficulty) !== "0".repeat(difficulty));
        return new this({
            timestamp,
            prevHash,
            data,
            difficulty,
            nonce,
            hash,
        })
    }
    static adjustDifficulty({ originalBlock, timestamp }) {
        const { difficulty } = originalBlock;
        if (difficulty < 1) return 1;
        const difference = timestamp - originalBlock.timestamp;
        if (difference > MINE_RATE) return difficulty - 1;
        return difficulty + 1;
    }
}

const block1 = new Block(
    {
        hash: "0xabc",
        timestamp: "2/09/22",
        prevHash: "0xc12",
        data: "hello",
    }
);

//const genesisBlock = Block.genesis();
//console.log(genesisBlock);

//const result = Block.mineBlock({ prevBlock: block1, data: "block2" });
//console.log(result);

module.exports = Block;