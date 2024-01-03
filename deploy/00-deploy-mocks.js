const { network } = require("hardhat"); //imports the network object from the hardhat package
const {
  //imports specefic values from our helper-hardhat-config file
  developmentChain,
  DECIMALS,
  INITIAL_ANSWER,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  //exporting an async function that takes an object as an argument. This obkect is expeceted to have propertieslike getNamedAccounts and deployments
  const { deploy, log } = deployments; //this line destructures the deployments object to extract the deploy and log functions. these functions are used for deploying contracts and loggin information during the deployment process
  const { deployer } = await getNamedAccounts(); //looks for the length of the named accounts in our hardhat.config.js
  const chainId = network.config.chainId; //get
  // log("developmentChain is ", developmentChain);
  // log("network is ", network);

  //31337 is commonly associated with the local Ethereum testnet(hardhat network)
  if (chainId == 31337) {
    log("Local network detected! Deploying mocks...");
    await deploy("MockV3Aggregator", {
      //the deploy function is part of the hardhat deployment module
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ANSWER], //to find the arguments just look into the MockV3Aggregator's constructor to see what values it takes
    });
    log("Mocks deployed");
    log("----------------------------------------------------");
  }
};

module.exports.tags = ["all", "mocks"];
