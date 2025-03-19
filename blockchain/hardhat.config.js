require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: "sepolia",
  networks: {
    hardhat: {},
    sepolia: {
      url: "https://rpc.ankr.com/eth_sepolia/c25053aa70864fd72cc657005f49b55e1993ae1ce2bf8d9c75ecff310307adad",
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    },
  },
};
