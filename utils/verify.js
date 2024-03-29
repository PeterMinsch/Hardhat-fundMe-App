const { run } = require("hardhat");

async function verify(contractAddress, args) {
  console.log("verifying contract");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    }); //alows us to run hardhat task
  } catch (
    e //e is an error that the wrap throws
  ) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already verified");
    } else {
      console.log(e);
    }
  }
}

module.exports = { verify };
