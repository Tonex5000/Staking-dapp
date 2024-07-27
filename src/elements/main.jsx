import React, { useState, useEffect } from "react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import Navbar from "./navbar";
import FormHeader from "./components/FormHeader";
import StakeButton from "./components/StakeButton";
import { ButtonBase } from "@mui/material";
const solana = new Connection(
  "https://solemn-boldest-firefly.solana-mainnet.quiknode.pro/121d45fc4c2e2c713f8c2f2b0559d3324fe12a1e/"
);
const tokenMintAddress = new PublicKey(
  "GMWhFAjvmkEkSoU8MepbbeTdWhSZJr3nTY3VM3SATd91"
);
const checkTokenAccount = async (connection, publicKey, tokenMintAddress) => {
  const tokenAccount = await getAssociatedTokenAddress(
    tokenMintAddress,
    publicKey
  );
  const accountInfo = await connection.getAccountInfo(tokenAccount);
  return accountInfo !== null;
};
const createTokenAccount = async (connection, publicKey, tokenMintAddress) => {
  const tokenAccount = await getAssociatedTokenAddress(
    tokenMintAddress,
    publicKey
  );
  const transaction = new Transaction().add(
    createAssociatedTokenAccountInstruction(
      publicKey,
      tokenAccount,
      publicKey,
      tokenMintAddress
    )
  );
  const { blockhash } = await connection.getRecentBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = publicKey;
  const signed = await window.solana.signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction(signature);
};
const getTokenBalance = async (connection, publicKey, tokenMintAddress) => {
  const tokenAccount = await getAssociatedTokenAddress(
    tokenMintAddress,
    publicKey
  );
  try {
    const balance = await connection.getTokenAccountBalance(tokenAccount);
    console.log("Token balance:", balance.value.uiAmount);
    return balance.value.uiAmount;
  } catch (error) {
    console.error("Error fetching token balance:", error);
    return 0;
  }
};
const verifyTokenAccount = async (connection, publicKey, tokenMintAddress) => {
  const tokenAccount = await getAssociatedTokenAddress(
    tokenMintAddress,
    publicKey
  );
  try {
    const accountInfo = await connection.getParsedAccountInfo(tokenAccount);
    console.log("Token Account Info:", accountInfo);
    if (accountInfo.value) {
      console.log(
        "Token Account Balance:",
        accountInfo.value.data.parsed.info.tokenAmount.uiAmount
      );
    } else {
      console.log("Token Account does not exist");
    }
  } catch (error) {
    console.error("Error verifying token account:", error);
  }
};
const verifyTokenMint = async (connection, tokenMintAddress) => {
  try {
    const mintInfo = await connection.getParsedAccountInfo(tokenMintAddress);
    console.log("Token Mint Info:", mintInfo);
  } catch (error) {
    console.error("Error verifying token mint:", error);
  }
};
const Main = () => {
  const [amount, setAmount] = useState(0);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [publicKey, setPublicKey] = useState(null);
  const [depositStatus, setDepositStatus] = useState(null);
  const [currentSlot, setCurrentSlot] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(null);
  const stakeReward = 0;
  const [unStakedStatus, setUnStakedStatus] = useState(null);
  const fixedRecipientAddress = new PublicKey(
    "2PJEwHZEEJWiXwWyk7hbQDY3tGyWtdrymAqKJhkWupF1"
  );
  useEffect(() => {
    const fetchCurrentSlot = async () => {
      try {
        const slot = await solana.getSlot();
        setCurrentSlot(slot);
        console.log("Current Slot:", slot);
      } catch (error) {
        console.error("Error fetching current slot:", error);
      }
    };
    const fetchBalance = async () => {
      if (publicKey) {
        const balance = await getTokenBalance(
          solana,
          publicKey,
          tokenMintAddress
        );
        setTokenBalance(balance);
      }
    };
    const verifyAccount = async () => {
      if (publicKey) {
        await verifyTokenAccount(solana, publicKey, tokenMintAddress);
      }
    };
    fetchCurrentSlot();
    fetchBalance();
    verifyAccount();
    verifyTokenMint(solana, tokenMintAddress);
  }, [publicKey]);const connectWallet = async (walletType) => {
    try {
      let provider;
      if (walletType === "phantom" && window.solana && window.solana.isPhantom) {
        provider = window.solana;
        await provider.connect();
        setPublicKey(provider.publicKey);
      } else if (walletType === "solflare" && window.solflare) {
        provider = window.solflare;
        await provider.connect();
        setPublicKey(provider.publicKey);
      } else {
        setTransactionStatus(`${walletType} wallet is not installed!`);
        return;
      }
    } catch (err) {
      console.error(`Error connecting to ${walletType} wallet: `, err);
      setTransactionStatus(`Error: ${err.message}`);
    }
  };
  const recordDepositOnBackend = async (walletAddress, amount) => {
    try {
      const response = await fetch(
        "https://backend-wmqj.onrender.com/deposit",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wallet_address: walletAddress,
            amount: amount,
            status: "completed",
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to record deposit");
      }
      const data = await response.json();
      setDepositStatus(
        `Staking recorded. Total Staked: ${data.total_deposited}`
      );
    } catch (error) {
      setDepositStatus(`Error recording Staking: ${error.message}`);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!publicKey) {
      setTransactionStatus("Please connect your wallet first.");
      return;
    }
    const tokenAccountExists = await checkTokenAccount(
      solana,
      publicKey,
      tokenMintAddress
    );
    if (!tokenAccountExists) {
      setTransactionStatus("Token account does not exist. Creating it now...");
      try {
        await createTokenAccount(solana, publicKey, tokenMintAddress);
        setTransactionStatus("Token account created successfully.");
      } catch (error) {
        setTransactionStatus(`Error creating token account: ${error.message}`);
        return;
      }
    }
    const balance = await getTokenBalance(solana, publicKey, tokenMintAddress);
    if (balance < parseFloat(amount)) {
      setTransactionStatus(`Insufficient balance. You have ${balance} tokens.`);
      return;
    }
    try {
      if (!window.solana.isConnected) {
        throw new Error("Phantom wallet is not connected");
      }
      const senderTokenAccountPubkey = await getAssociatedTokenAddress(
        tokenMintAddress,
        publicKey
      );
      const recipientTokenAccountPubkey = await getAssociatedTokenAddress(
        tokenMintAddress,
        fixedRecipientAddress
      );
      console.log("Sender Token Account:", senderTokenAccountPubkey.toString());
      console.log(
        "Recipient Token Account:",
        recipientTokenAccountPubkey.toString()
      );
      console.log("Amount to transfer:", amount);
      let transaction = new Transaction();
      const senderAccountInfo = await solana.getAccountInfo(
        senderTokenAccountPubkey
      );
      if (!senderAccountInfo) {
        console.log("Creating sender's token account");
        const createAccountInstruction =
          createAssociatedTokenAccountInstruction(
            publicKey,
            senderTokenAccountPubkey,
            publicKey,
            tokenMintAddress
          );
        transaction.add(createAccountInstruction);
      }
      const recipientAccountInfo = await solana.getAccountInfo(
        recipientTokenAccountPubkey
      );
      if (!recipientAccountInfo) {
        console.log("Creating recipient's token account");
        const createRecipientAccountInstruction =
          createAssociatedTokenAccountInstruction(
            publicKey,
            recipientTokenAccountPubkey,
            fixedRecipientAddress,
            tokenMintAddress
          );
        transaction.add(createRecipientAccountInstruction);
      }
      const senderTokenBalance = await solana.getTokenAccountBalance(
        senderTokenAccountPubkey
      );
      console.log("Sender token balance:", senderTokenBalance.value.uiAmount);
      if (senderTokenBalance.value.uiAmount < parseFloat(amount)) {
        setTransactionStatus(
          `Insufficient balance. You have ${senderTokenBalance.value.uiAmount} tokens.`
        );
        return;
      }
      const senderTokenAccountInfo = await solana.getAccountInfo(
        senderTokenAccountPubkey
      );
      if (!senderTokenAccountInfo) {
        setTransactionStatus(
          "Sender's token account doesn't exist. Please create it first."
        );
        return;
      }
      const tokenMintInfo = await solana.getParsedAccountInfo(tokenMintAddress);
      const decimals = tokenMintInfo.value.data.parsed.info.decimals;
      const transferInstruction = createTransferInstruction(
        senderTokenAccountPubkey,
        recipientTokenAccountPubkey,
        publicKey,
        parseInt(parseFloat(amount) * Math.pow(10, decimals))
      );
      transaction.add(transferInstruction);
      const { blockhash, lastValidBlockHeight } =
        await solana.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      const signedTransaction = await window.solana.signTransaction(
        transaction
      );
      console.log("Sending transaction...");
      const rawTransaction = signedTransaction.serialize();
      const signature = await solana.sendRawTransaction(rawTransaction, {
        skipPreflight: !1,
        preflightCommitment: "confirmed",
      });
      console.log("Transaction sent with signature:", signature);
      console.log("Confirming transaction...");
      const confirmation = await solana.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });
      if (confirmation.value.err) {
        throw new Error(
          `Transaction failed: ${JSON.stringify(confirmation.value.err)}`
        );
      }
      setTransactionStatus(
        `Transaction successful with signature: ${signature}`
      );
      await recordDepositOnBackend(publicKey.toString(), amount);
    } catch (error) {
      console.error("Detailed error:", error);
      if (error.logs) {
        console.error("Transaction logs:");
        error.logs.forEach((log, index) => {
          console.error(`Log ${index}:`, log);
        });
        setTransactionStatus(
          `Transaction failed. Logs: ${error.logs.join("\n")}`
        );
      } else {
        console.error("Error details:", error.message);
        setTransactionStatus(`Error during token transfer: ${error.message}`);
      }
      if (
        error.message.includes(
          "Attempt to debit an account but found no record of a prior credit"
        )
      ) {
        console.error(
          "This error suggests that the token account doesn't have sufficient balance or doesn't exist."
        );
        setTransactionStatus(
          "Transfer failed: Insufficient balance or token account doesn't exist."
        );
      }
    }
  };
  useEffect(() => {
    const timer = setInterval(() => {
      setTransactionStatus(null);
      setDepositStatus(null);
      setUnStakedStatus(null);
    }, 5000);
    return () => clearInterval(timer);
  }, [transactionStatus, depositStatus]);
  return (
    <>
      <Navbar
        connectWallet={connectWallet}
        publicKey={publicKey}
        depositStatus={depositStatus}
        transactionStatus={transactionStatus}
        tokenBalance={tokenBalance}
        currentSlot={currentSlot}
      />
      <div className="mt-[70px]">
        <article className="pb-[24px] my-[60px] mb-[80px] md:mb-[100px]">
          <h2 className="text-[50px] leading-[56px] font-[400]">
            SINGLE STAKE POOL
          </h2>
          <p className="text-[20px] font-[700] leading-[32px]">
            Staked $HOME is locked until maturity.
          </p>
        </article>
        {}
        <main className="bg-white text-black rounded-[25px] w-full md:w-[450px] mx-auto p-[16px] pb-0">
          <div className="mb-[24px]">
            <FormHeader leading="APY" value="15%" />
            <FormHeader leading="Lock Time" value="1 month" />
            <FormHeader leading="Wallet" value={`${tokenBalance} HOME`} />
          </div>
          <form onSubmit={handleSubmit}>
            <div className="w-full mt-[8px]">
              <p className="text-right">Max:{tokenBalance}</p>
              <section className="flex justify-end">
                <div className="flex items-center border border-black flex-[2] px-4 mr-[8px]">
                  <input
                    type="number"
                    name="stake"
                    id="stake"
                    min={0}
                    defaultValue={0}
                    onChange={(e) => {
                      setAmount(e.target.value);
                    }}
                    className="w-full text-right no-arrows outline-none focus:outline-none border-none text-[24px] font-bold"
                  />
                  <p className="ml-5 text-[24px] font-[100] tracking-[0.22512px] leading-[1.5]">
                    HOME
                  </p>
                </div>
                <ButtonBase
                  className="MuiTouchRipple-root"
                  onClick={() => setAmount(tokenBalance)}
                  style={{
                    backgroundColor: "#77787D",
                    padding: "20px",
                    paddingLeft: "24px",
                    paddingRight: "24px",
                    fontSize: "14px",
                    color: "white",
                    borderRadius: "5px",
                    textTransform: "uppercase",
                    fontWeight: 400,
                    letterSpacing: "0.02857em",
                    lineHeight: "1.75",
                  }}
                >
                  Max
                </ButtonBase>
              </section>
              <StakeButton type={"submit"} buttonText="Stake" />
            </div>
            <p className="text-[14px]">{transactionStatus}</p>
          </form>
          {}
          <form>
            <div className="w-full mt-[8px]">
              <p className="text-right">Max:{tokenBalance}</p>
              <section className="flex justify-end">
                <div className="flex items-center border border-black flex-[2] px-4 mr-[8px]">
                  <input
                    type="number"
                    name="stake"
                    id="stake"
                    min={0}
                    defaultValue={0}
                    onChange={(e) => {
                      setAmount(e.target.value);
                    }}
                    className="w-full text-right no-arrows outline-none focus:outline-none border-none text-[24px] font-bold"
                  />
                  <p className="ml-5 text-[24px] font-[100] tracking-[0.22512px] leading-[1.5]">
                    HOME
                  </p>
                </div>
                <ButtonBase
                  className="MuiTouchRipple-root"
                  onClick={() => setAmount(tokenBalance)}
                  style={{
                    backgroundColor: "#77787D",
                    padding: "20px",
                    paddingLeft: "24px",
                    paddingRight: "24px",
                    fontSize: "14px",
                    color: "white",
                    borderRadius: "5px",
                    textTransform: "uppercase",
                    fontWeight: 400,
                    letterSpacing: "0.02857em",
                    lineHeight: "1.75",
                  }}
                >
                  Max
                </ButtonBase>
              </section>
              <div
                onMouseOver={() => {
                  setUnStakedStatus(
                    "UnStaked token can only be unstaked after a period of 30 days"
                  );
                }}
                onMouseOut={() => {
                  setUnStakedStatus(null);
                }}
              >
                <StakeButton
                  type={"submit"}
                  disabled={!0}
                  onClick={() => null}
                  buttonText="UnStake"
                />
              </div>
              <p className="text-[14px] transition-opacity duration-200 ease-linear">
                {unStakedStatus}
              </p>
            </div>
          </form>
          <article>
            <hr />
            <section className="flex justify-between items-center mt-[24px]">
              <h3 className="text-[16px] font-[700]">Your Rewards</h3>
              <h3 className="text-[24px] font-[700]">{stakeReward}HOME</h3>
            </section>
            <StakeButton
              buttonText="CLAIM REWARDS"
              onClick={() => null}
              disabled={!0}
              paddingBottom={"20px"}
            />
          </article>
        </main>
      </div>
    </>
  );
};
export default Main;
