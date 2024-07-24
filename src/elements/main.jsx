/* eslint-disable react/prop-types */
import { useState, useEffect, useLayoutEffect } from "react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import StakeButton from "./components/StakeButton";
import InputStake from "./components/InputStake";
import FormHeader from "./components/FormHeader";
import Navbar from "../elements/navbar";
import { ButtonBase } from "@mui/material";

const solana = new Connection(
  "https://solemn-boldest-firefly.solana-mainnet.quiknode.pro/121d45fc4c2e2c713f8c2f2b0559d3324fe12a1e/"
);

// Replace with actual token mint address
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
  // const [unStakedValue, setUnStakedValue] = useState(0);
  const [stakeReward, setStakeReward] = useState(0);
  const [amount, setAmount] = useState("");
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [publicKey, setPublicKey] = useState(null);
  const [depositStatus, setDepositStatus] = useState(null);
  const [currentSlot, setCurrentSlot] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [unStakedStatus, setUnStakedStatus] = useState(null);

  // Fixed recipient address
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
        if (balance === null) {
          setTokenBalance(0);
        } else {
          setTokenBalance(balance);
        }
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
  }, [publicKey]);

  const connectWallet = async () => {
    if (!window.solana || !window.solana.isPhantom) {
      setTransactionStatus("Phantom wallet is not installed!");
      return;
    }
    try {
      const resp = await window.solana.connect();
      setPublicKey(resp.publicKey);
    } catch (err) {
      console.error("Error connecting to wallet: ", err);
      setTransactionStatus(`Error: ${err.message}`);
    }
  };

  const recordDepositOnBackend = async (walletAddress, amount) => {
    try {
      const response = await fetch(
        "https://backend-wmqj.onrender.com/deposit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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

    try {
      // Check if token account exists
      const tokenAccountExists = await checkTokenAccount(
        solana,
        publicKey,
        tokenMintAddress
      );
      if (!tokenAccountExists) {
        setTransactionStatus(
          "Token account does not exist. Creating it now..."
        );
        await createTokenAccount(solana, publicKey, tokenMintAddress);
        setTransactionStatus("Token account created successfully.");
      }

      // Check token balance
      const balance = await getTokenBalance(
        solana,
        publicKey,
        tokenMintAddress
      );
      if (balance < parseFloat(amount)) {
        setTransactionStatus(
          `Insufficient balance. You have ${balance} tokens.`
        );
        return;
      }

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

      let transaction = new Transaction();

      // Create sender's token account if it doesn't exist
      const senderAccountInfo = await solana.getAccountInfo(
        senderTokenAccountPubkey
      );
      if (!senderAccountInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            senderTokenAccountPubkey,
            publicKey,
            tokenMintAddress
          )
        );
      }

      // Create recipient's token account if it doesn't exist
      const recipientAccountInfo = await solana.getAccountInfo(
        recipientTokenAccountPubkey
      );
      if (!recipientAccountInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            recipientTokenAccountPubkey,
            fixedRecipientAddress,
            tokenMintAddress
          )
        );
      }

      const senderTokenBalance = await solana.getTokenAccountBalance(
        senderTokenAccountPubkey
      );
      if (senderTokenBalance.value.uiAmount < parseFloat(amount)) {
        setTransactionStatus(
          `Insufficient balance. You have ${senderTokenBalance.value.uiAmount} tokens.`
        );
        return;
      }

      const tokenMintInfo = await solana.getParsedAccountInfo(tokenMintAddress);
      const decimals = tokenMintInfo.value.data.parsed.info.decimals;

      // Create transfer instruction
      const transferInstruction = createTransferInstruction(
        senderTokenAccountPubkey,
        recipientTokenAccountPubkey,
        publicKey,
        parseInt(parseFloat(amount) * Math.pow(10, decimals))
      );
      transaction.add(transferInstruction);

      // Add recent blockhash and fee payer
      const { blockhash, lastValidBlockHeight } =
        await solana.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Sign and send the transaction
      const signedTransaction = await window.solana.signTransaction(
        transaction
      );
      const rawTransaction = signedTransaction.serialize();
      const signature = await solana.sendRawTransaction(rawTransaction, {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });

      // Confirm the transaction
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
      localStorage.setItem("date_staked", Date.now().toString());
      localStorage.setItem("amount_staked", amount);
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
  useEffect(() => {
    const secondsInMonth = 30.44 * 24 * 60 * 60;
    const increasePerSecond = Math.pow(2, 1 / secondsInMonth) - 1;

    const timer = setInterval(() => {
      const savedTime = localStorage.getItem("date_staked");
      const amountStaked = localStorage.getItem("amount_staked");
      console.log(savedTime);
      if (savedTime) {
        const currentTime = Date.now();
        const elapsedTime = (currentTime - parseInt(savedTime, 10)) / 1000; // elapsed time in seconds

        setStakeReward((prev) => amountStaked + prev * Math.pow(1 + increasePerSecond, elapsedTime));
        console.log(amount);
      }
    }, 1000); // Update every second (1000 milliseconds)

    return () => clearInterval(timer);
  }, []);

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

        {/* Input Form */}
        <main className="bg-white text-black rounded-[25px] w-full md:w-[450px] mx-auto p-[16px] pb-0">
          <div className="mb-[24px]">
            <FormHeader leading="APY" value="100%" />
            <FormHeader leading="Lock Time" value="1 month" />
            <FormHeader leading="Wallet" value={`${tokenBalance} HOME`} />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="w-full mt-[8px]">
              <p className="text-right">Max: {tokenBalance}</p>
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
              <StakeButton
                type={"submit"}
                // onClick={() => handleSubmit()}
                buttonText="Stake"
              />
            </div>
            <p className="text-[14px]">{transactionStatus}</p>
          </form>

          {/* Input UnStake */}
          <form>
            <div className="w-full mt-[8px]">
              <p className="text-right">Max: {tokenBalance}</p>
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
                  disabled={true}
                  onClick={() => null}
                  buttonText="UnStake"
                />
              </div>

              <p className="text-[14px] transition-opacity duration-200 ease-linear">
                {unStakedStatus}
              </p>
            </div>
            {/* <p className="text-[14px]">{transactionStatus}</p> */}
          </form>
          <article>
            <hr />
            <section className="flex justify-between items-center mt-[24px]">
              <h3 className="text-[16px] font-[700]">Your Rewards</h3>
              <h3 className="text-[24px] font-[700]">
                {stakeReward.toFixed(2)} HOME
              </h3>
            </section>
            <StakeButton
              buttonText="CLAIM REWARDS"
              onClick={() => null}
              disabled={true}
              paddingBottom={"20px"}
            />
          </article>
        </main>
      </div>
    </>
  );
};

export default Main;
