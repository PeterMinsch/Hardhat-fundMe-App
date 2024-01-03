const { deployments, getNamedAccounts } = require("hardhat");
//deployments is an object that provides functions for deploying contracts
const { assert, expect } = require("chai");
const { developmentChain } = require("../../helper-hardhat-config");

//describe is a function provided by the Mocha testing framework and is used to group related tests
!developmentChain.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      let fundMe;
      let deployer;
      let mockV3Aggregator;
      const sendValue = ethers.utils.parseEther("1"); //this is basically 1000000000000000000 which is 1 eth
      beforeEach(async function () {
        //deploy our fundMe contract using hardhat-deploy
        // const accounts = await ethers.getSigners()//gonna return what ever is in the accounts section of our hardhat.config.js
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]); //allows us to run our entire deploy folder with as many tags as we want. since all of our scripts have the tag all then it will deploy all of our scripts
        fundMe = await ethers.getContract("FundMe"); //get the most recently deployed FundMe contract
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        ); //this line returns an instance of a smart contract
      });
      describe("constructor", function () {
        //the it function is a part of testing fremworks like mocha and is used to define individual test cases
        //in the context of eth smart contract testing using hardhat, the it function is often used to specify and describe the expected behavior of a particular function
        //it takes 2 params, the description of the test, the async function: which contains the actual logic like the assertion
        //when we run our test suite, the testing framework will execute each it block and report whether the assertions within each block pass or fail
        //if all assertinos pass then the test is considered successful
        it("sets the aggregator addresses correctly", async function () {
          const response = await fundMe.priceFeed();
          assert.equal(response, mockV3Aggregator.address);
        });
      });

      describe("fund", function () {
        it("Fails if you don't sent enough ETH", async function () {
          await expect(fundMe.fund()).to.be.revertedWith(
            "You need to spend more ETH!"
          );
          //this will break cause were not sending eth through
          //when using 'expect' with 'to.be.revertedWith' we are saying that i expect the transaction to revert with the specified error message
        });
        it("updated the amount funded data structure", async function () {
          await fundMe.fund({ value: sendValue });
          const response = await fundMe.getAddressToAmountFunded(deployer);
          assert.equal(response.toString(), sendValue.toString());
        });
        it("adds funder to array of funders", async function () {
          await fundMe.fund({ value: sendValue });
          const funder = await fundMe.getFunder(0);
          assert.equal(funder, deployer);
        });
      });
      describe("withdraw", async function () {
        //for all of our test, we are first gonna fund it with ETH
        beforeEach(async function () {
          await fundMe.fund({ value: sendValue });
        });
        it("Withdraw ETH from a single founder", async function () {
          //Arrange
          //this function gets us the balance of the fundMe contract
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          //Act
          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          //Assert
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
        });
        it("is allows us to withdraw with multiple funders", async () => {
          // Arrange
          const accounts = await ethers.getSigners();
          for (i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i]); //creating new objects to connect to all of these different accounts
            await fundMeConnectedContract.fund({ value: sendValue }); //filling each account with ETH
          }
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          // Act
          const transactionResponse = await fundMe.withdraw();
          // Let's comapre gas costs :)
          // const transactionResponse = await fundMe.withdraw()
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const withdrawGasCost = gasUsed.mul(effectiveGasPrice);
          console.log(`GasCost: ${withdrawGasCost}`);
          console.log(`GasUsed: ${gasUsed}`);
          console.log(`GasPrice: ${effectiveGasPrice}`);
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          // Assert
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(withdrawGasCost).toString()
          );
          // Make a getter for storage variables
          await expect(fundMe.getFunder(0)).to.be.reverted;

          for (i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            );
          }
        });
        it("Only allows the owner to withdraw", async function () {
          const accounts = ethers.getSigners();
          const attacker = accounts[1];
          const attackerConnectContract = await fundMe.connect(attacker);
          await expect(attackerConnectContract.withdraw()).to.be.reverted;
        });
      });
    });
