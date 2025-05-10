const { ethers } = require("hardhat");

async function main() {
  // Cập nhật địa chỉ token mới
  const tokenAddress = "0x05ac4Ba85502C1D361F737AC3856DF88e47f18Ee";
  
  // Địa chỉ người nhận token
  const recipientAddress = "0x86eFBde5d44D09BDEEA515aC4Af4F91e41eBF8cb";
  
  // Kết nối với contract
  const DXToken = await ethers.getContractAt("DXToken", tokenAddress);
  const decimals = await DXToken.decimals();
  
  // Số lượng token muốn gửi
  const amount = ethers.parseUnits("1001000", decimals);
  
  // Kiểm tra số dư trước khi gửi
  const [signer] = await ethers.getSigners();
  const signerAddress = await signer.getAddress();
  const balance = await DXToken.balanceOf(signerAddress);
  
  console.log(`Số dư hiện tại: ${ethers.formatUnits(balance, decimals)} DXToken`);
  console.log(`Đang gửi ${ethers.formatUnits(amount, decimals)} tokens đến ${recipientAddress}...`);
  
  try {
    const tx = await DXToken.transfer(recipientAddress, amount, {
      gasLimit: 200000
    });
    
    console.log("Hash giao dịch transfer:", tx.hash);
    await tx.wait();
    console.log("Chuyển token thành công!");
    
    // Kiểm tra số dư sau khi chuyển
    const newBalance = await DXToken.balanceOf(signerAddress);
    console.log(`Số dư sau khi chuyển: ${ethers.formatUnits(newBalance, decimals)} DXToken`);
    
    const recipientBalance = await DXToken.balanceOf(recipientAddress);
    console.log(`Số dư của người nhận: ${ethers.formatUnits(recipientBalance, decimals)} DXToken`);
  } catch (error) {
    console.error("Lỗi khi chuyển token:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });