import { ethers } from "ethers";

/**
 * Script triển khai Smart Contract DocumentNotary lên Ethereum Sepolia Testnet
 * 
 * Hướng dẫn chạy:
 * 1. npx hardhat compile
 * 2. npx hardhat run scripts/deploy.ts --network sepolia
 */
async function main() {
  console.log("Đang chuẩn bị triển khai DocumentNotary contract...");

  // Trong môi trường Hardhat:
  // const DocumentNotary = await ethers.getContractFactory("DocumentNotary");
  // const notary = await DocumentNotary.deploy();
  // await notary.waitForDeployment();
  // const address = await notary.getAddress();
  
  // console.log(`Smart Contract triển khai thành công tại địa chỉ: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
