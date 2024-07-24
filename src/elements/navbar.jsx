import { useState, useEffect } from "react";
import phantom from "../assets/phantom.svg";
import solfare from "../assets/solfare.svg";
import { IoClose } from "react-icons/io5";

const Navbar = ({
  connectWallet,
  publicKey,
  currentSlot,
  tokenBalance,
  transactionStatus,
  depositStatus,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [smallMenu, setSmallMenu] = useState(false);

  const ConnectBtn = ({
    image,
    connect,
    isDetected,
    isworking,
    connectWallet,
  }) => (
    <button
      onClick={() => {
        if (isworking) {
          connectWallet();
          setIsOpen(false);
        }
      }}
      className="w-full flex items-center justify-between px-[24px] hover:bg-[#181d30] py-[20px] cursor-pointer rounded-none"
    >
      <div className="flex items-center space-x-2">
        <img
          src={image}
          alt={`${connect} logo`}
          className="w-[28px] h-[28px] rounded-[5px]"
        />
        <p className="text-[18px] font-sans">{connect}</p>
      </div>
      {isDetected && (
        <p className="text-[14px] font-sans text-gray-600">Detected</p>
      )}
    </button>
  );

  useEffect(() => {
    if (publicKey) {
      setAddress(
        publicKey.toString().slice(0, 4) +
          "..." +
          publicKey.toString().slice(-4)
      );
      setIsConnected(true);
    } else {
      setAddress("");
      setIsConnected(false);
    }
  }, [publicKey]);

  return (
    <>
      <div className="w-full flex flex-col justify-end items-baseline h-[15vh] md:h-[20vh]">
        <>
          <button
            className="bg-transparent px-[25px] py-[10px] text-[16px] border-white border-[2px] font-[900] rounded-[10px] text-white self-end"
            onClick={
              // isConnected
              //   ? () => setSmallMenu((prev) => !prev)
              () => setIsOpen(true)
            }
          >
            {isConnected ? address : "Select Wallet"}
          </button>

          {/* <div
            className={`py-[20px] bg-[#11141F] w-[120px] rounded-md self-end ${
              smallMenu ? "hidden" : "flex flex-col"
            }`}
          >
            <button onClick={() => setSmallMenu(false)} className="hover:bg-[bg-[#181d30] w-full text-left">change wallet</button>
            <button onClick={() => setSmallMenu(false)} className="hover:bg-[bg-[#181d30]  w-full text-left">Disconnect</button>
          </div> */}
        </>
      </div>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed z-[1050] top-0 left-0 right-0 bottom-0 bg-[#00000080] flex items-center justify-center"
        >
          <section className="bg-[#11141F] max-w-[400px] rounded-[10px] z-[1060] py-[16px] pb-[30px] relative">
            <div className="flex justify-center items-center h-[40px] w-[40px] rounded-full bg-[#1A1F2E] absolute top-[20px] right-[20px] cursor-pointer">
              <IoClose onClick={() => setIsOpen((prev) => !prev)} size={24} />
            </div>
            <section className="p-12">
              <h2 className="text-[24px] font-sans">
                Connect a wallet on Solana to continue
              </h2>
            </section>
            <ConnectBtn
              connect={"Phantom"}
              connectWallet={() => connectWallet()}
              image={phantom}
              isDetected={true}
              isworking={true}
            />
            <ConnectBtn
              connect={"Solfare"}
              connectWallet={() => connectWallet()}
              image={solfare}
              isDetected={true}
              isworking={true}
            />
          </section>
        </div>
      )}
    </>
  );
};

export default Navbar;