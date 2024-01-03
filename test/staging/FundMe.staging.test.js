const { network, getNamedAccounts, ethers } = require("hardhat");
const { developmentChain } = require("../../helper-hardhat-config");
const { assert } = require("chai");
developmentChain.includes(network.name) //developmentChain includes hardhat and local host
  ? describe.skip
  : describe("FundMe", async function () {
      let fundMe; //we use the let key word instead of const so they can be reassigned
      let deployer;
      const sendValue = ethers.utils.parseEther("0.1"); //we are getting .1 eth TT
      //we have to get the deployer's eth account and the smart contract object
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer; //this is how we get the smart contract deployer account
        fundMe = await ethers.getContract("FundMe", deployer); //we get the instance of the smart contract object using the deployer's address
      });

      it("allows people to fund and withdraw", async function () {
        //step 1: fund the smart contract with fake ether
        const fundTxResponse = await fundMe.fund({ value: sendValue }); //this funds the smart contract with the fake eth and returns a response object that contains informationa about the transaction
        await fundTxResponse.wait(1); //this line waits for the transaction to be mained ensuring that the state of the blockchain is updated

        //step 2: withdraw funds from the smart contract
        const withdrawTxResponse = await fundMe.withdraw(); //initiates a transaction to withdraw funds from the smart contract
        await withdrawTxResponse.wait(1); //this waits for the withdrawal transaction to be mined

        //step 3: check the ending balance of the smart contract
        const endingFundMeBalance = await fundMe.provider.getBalance(
          //retrieves the ending balance of the smart contract by querying the blockchain
          fundMe.address
        );

        //step 4: log information for debugging
        console.log(
          endingFundMeBalance.toString() +
            "should equal 0, running asser equal..."
        );
        //step 5: assert that the ending balance is equal to 0
        assert.equal(endingFundMeBalance.toString(), "0"); //this line performs an assertion to check if the dning balcance is equal to 0
      });
    });
