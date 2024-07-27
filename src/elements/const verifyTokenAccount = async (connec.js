const verifyTokenAccount = async (connection, publicKey, tokenMintAddress) => {
//   const tokenAccount = await getAssociatedTokenAddress(
//     tokenMintAddress,
//     publicKey
//   );
//   try {
//     const accountInfo = await connection.getParsedAccountInfo(tokenAccount);
//     console.log("Token Account Info:", accountInfo);
//     if (accountInfo.value) {
//       console.log(
//         "Token Account Balance:",
//         accountInfo.value.data.parsed.info.tokenAmount.uiAmount
//       );
//     } else {
//       console.log("Token Account does not exist");
//     }
//   } catch (error) {
//     console.error("Error verifying token account:", error);
//   }
// };

// const verifyTokenMint = async (connection, tokenMintAddress) => {
//   try {
//     const mintInfo = await connection.getParsedAccountInfo(tokenMintAddress);
//     console.log("Token Mint Info:", mintInfo);
//   } catch (error) {
//     console.error("Error verifying token mint:", error);
//   }
// };