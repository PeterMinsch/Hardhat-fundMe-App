//3 ways to do this

// function deployFunc() {
//   console.log("hi");
// }

// module.exports.default = deployFunc();

// module.experts = async (hre) => {
//   const { getNamedAccounts, deployments } = hre;
//   //hre.getNamedAccounts and hre.deployments
// };

//deployments and getNamedAccounts are objects pulled from hre
const { networkConfig, developmentChain } = require("../helper-hardhat-config");
const { network } = require("hardhat");
const { verify } = require("../utils/verify");
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments; //this line destructures the deployments object to extract the deploy and log functions. these functions are used for deploying contracts and loggin information during the deployment process
  const { deployer } = await getNamedAccounts(); //this line uses the getNamedAccounts function to retrieve the named accounts
  const chainId = network.config.chainId; //retreives the chainId from the current network
  //if chainId is X use address y

  //const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  let ethUsdPriceFeedAddress;
  if (chainId == 31337) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }
  //if the contract doesn't exist, we deploy a minimal version of it for our local testing
  const args = [ethUsdPriceFeedAddress];
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: args, //put the price feed address in here
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log("-------------------------");
  if (
    !developmentChain.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, args);
  }
};

//when doing unit testing we want to use a mock
module.exports.tags = ["all", "fundMe"];
