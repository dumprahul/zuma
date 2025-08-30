import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedZumaEvents = await deploy("ZumaEvents", {
    from: deployer,
    log: true,
  });

  console.log(`ZumaEvents contract deployed at: ${deployedZumaEvents.address}`);
};
export default func;
func.id = "deploy_zumaEvents"; // id required to prevent reexecution
func.tags = ["ZumaEvents"];
