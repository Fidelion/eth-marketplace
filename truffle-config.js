const HDWalletProvider = require("@truffle/hdwallet-provider");
const keys = require("./keys.json");

module.exports = {
  contracts_build_directory: "./public/contracts",
  networks: {
    development: {
     host: "127.0.0.1",     // Localhost (default: none)
     port: 7545,            // Standard Ethereum port (default: none)
     network_id: "*",       // Any network (default: none)
    },
    ropsten: {
      provider: () =>
        new HDWalletProvider({
          mnemonic: {
            phrase: keys.MNEMONIC
          },
          providerOrUrl: `https://ropsten.infura.io/v3/${keys.INFURA_PROJECT_ID}`,
          addressAtIndex: 0
        }),
      network_id: 3,
      gas: 5500000, //Gas limit, how much gas are we willing to spend
      gasPrice: 20000000000, //How much are we willing to spend for the unit of gas
      confirmations: 2, //number of blocks to wait before deployment
      timeoutBlocks: 200 //number of blocks before deployment times out
    }
  },


  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.4",    // Fetch exact version from solc-bin (default: truffle's version)
    }
  },
};


// transaction hash:    0xf7984017748778701e4cd499170244441ff93861ddcb4fad3e54ec50bfa98509
//    > Blocks: 0            Seconds: 5
//    > contract address:    0x5Ba1f205c43dB5202f91d52E6B6131248f59182B