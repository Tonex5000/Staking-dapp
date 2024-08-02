import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { toast } from 'react-toastify';
import phantom from '../assets/phantom.svg';
import solfare from '../assets/solfare.svg';

const Navbar = ({ onWalletConnect }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
  const [address, setAddress] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletDetected, setWalletDetected] = useState({
    phantom: false,
    solflare: false,
  });

  useEffect(() => {
    const checkWallets = () => {
      setTimeout(() => {
        console.log("Checking for wallets...");
        console.log("Solana object:", window.solana);
        console.log("Solflare object:", window.solflare);
        
        const phantomDetected = !!(window.solana && window.solana.isPhantom);
        const solflareDetected = !!(window.solflare && window.solflare.isSolflare);
        
        console.log("Phantom detected:", phantomDetected);
        console.log("Solflare detected:", solflareDetected);

        setWalletDetected({
          phantom: phantomDetected,
          solflare: solflareDetected,
        });
      }, 500); // 500ms delay
    };

    checkWallets();
    window.addEventListener('load', checkWallets);
    return () => window.removeEventListener('load', checkWallets);
  }, []);

  const handleSuccessfulConnection = (publicKey, walletInstance) => {
    setPublicKey(publicKey);
    setIsConnected(true);
    const pubKeyString = publicKey.toString();
    setAddress(pubKeyString.slice(0, 4) + '...' + pubKeyString.slice(-4));
    onWalletConnect(publicKey, walletInstance);
  };

  const connectWallet = async (walletName) => {
    console.log(`Attempting to connect to ${walletName}`);
    setIsConnecting(true);
    try {
      let wallet;
      if (walletName === 'phantom') {
        wallet = window.solana;
      } else if (walletName === 'solflare') {
        wallet = window.solflare;
      }

      if (!wallet) {
        throw new Error(`${walletName} wallet is not installed!`);
      }

      let publicKey;
      if (walletName === 'phantom') {
        const response = await wallet.connect();
        publicKey = response.publicKey;
      } else if (walletName === 'solflare') {
        await wallet.connect();
        publicKey = wallet.publicKey;
      }

      if (!publicKey) {
        throw new Error("Unable to retrieve public key from wallet");
      }

      handleSuccessfulConnection(publicKey, wallet);
      toast.success("Wallet connected successfully");
      setIsOpen(false);
    } catch (error) {
      console.error(`Error connecting to ${walletName} wallet:`, error);
      toast.error(`Error connecting to ${walletName} wallet: ${error.message}`);
    } finally {
      setIsConnecting(false);
      setIsOpen(false);
    }
  };

  const ConnectBtn = ({ image, connect, isDetected }) => (
    <button
      onClick={() => connectWallet(connect.toLowerCase())}
      className="w-full flex items-center justify-between px-[24px] hover:bg-[#181d30] py-[20px] cursor-pointer rounded-none"
      disabled={isConnecting || !isDetected}
    >
      <div className="flex items-center space-x-2">
        <img src={image} alt={`${connect} logo`} className="w-[28px] h-[28px] rounded-[5px]" />
        <p className="text-[18px] font-sans">{connect}</p>
      </div>
      {isDetected ? (
        <p className="text-[14px] font-sans text-gray-600">Detected</p>
      ) : (
        <p className="text-[14px] font-sans text-red-500">Not detected</p>
      )}
    </button>
  );

  return (
    <>
      <div className="w-full flex flex-col justify-end items-baseline h-[15vh] md:h-[20vh]">
        <button
          className="bg-transparent px-[25px] py-[10px] text-[16px] border-white border-[2px] font-[900] rounded-[10px] text-white self-end"
          onClick={() => {
            if (isConnected) {
              // Handle disconnection if needed
              console.log("Wallet disconnection not implemented");
            } else {
              setIsOpen(true);
            }
          }}
        >
          {isConnected ? address : 'Select Wallet'}
        </button>
      </div>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed z-[1050] top-0 left-0 right-0 bottom-0 bg-[#00000080] flex items-center justify-center"
        >
          {console.log("Modal opened")}
          <section 
            className="bg-[#11141F] max-w-[400px] rounded-[10px] z-[1060] py-[16px] pb-[30px] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="flex justify-center items-center h-[40px] w-[40px] rounded-full bg-[#1A1F2E] absolute top-[20px] right-[20px] cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <IoClose size={24} />
            </div>
            <section className="p-12">
              <h2 className="text-[24px] font-sans">Connect a wallet on Solana to continue</h2>
            </section>
            <ConnectBtn
              connect="Phantom"
              image={phantom}
              isDetected={walletDetected.phantom}
            />
            <ConnectBtn
              connect="Solflare"
              image={solfare}
              isDetected={walletDetected.solflare}
            />
          </section>
        </div>
      )}
    </>
  );
};

export default Navbar;