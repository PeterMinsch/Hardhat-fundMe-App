//require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("@nomiclabs/hardhat-ethers");
const networkConfig = {
  11155111: {
    name: "sepolia",
    ethUsdPriceFeed: "0x694aa1769357215de4fac081bf1f309adc325306",
  },
};

const developmentChain = ["hardhat", "localhost"];
const DECIMALS = 8;
const INITIAL_ANSWER = 200000000000;
//we need to export this so other files can use it
module.exports = {
  networkConfig,
  developmentChain,
  DECIMALS,
  INITIAL_ANSWER,
};
