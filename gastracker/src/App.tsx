import { useState } from 'react'
import './App.css'
import { BrowserProvider, JsonRpcSigner, formatEther } from 'ethers';
import axios from 'axios';
import Transaction from './interfaces';


function GasTracker(){
  const [address, setAddress] = useState<string>('');
  const [totalGasFees, setTotalGasFees] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async (address: string) => {
    try {
      const response = await axios.get(
        `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=K7IRNV42MVFIZ6UYVUQ757FF2RBXJMSG6M`
      );
      return response.data.result;
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to fetch transactions.');
      return [];
    }
  };
  

  const calculateGasFees = async () => {
    setError(null);

    if (!address) {
      setError('Please enter a valid Ethereum address.');
      return;
    }

    const transactions = await fetchTransactions(address);
    if (transactions.length === 0) {
      setError('No transactions found for this address.');
      return;
    }

    let totalGasFeesWei = BigInt(0);
    transactions.forEach((tx: Transaction) => {
      const gasUsed = BigInt(tx.gasUsed);
      const gasPrice = BigInt(tx.gasPrice);
      totalGasFeesWei += gasUsed * gasPrice;
    });

    const totalGasFeesInEther = formatEther(totalGasFeesWei.toString());
    setTotalGasFees(totalGasFeesInEther);
  };

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new BrowserProvider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer: JsonRpcSigner = await provider.getSigner();
        const connectedAddress = await signer.getAddress();
        setAddress(connectedAddress);
      } else {
        setError('MetaMask is not installed');
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect MetaMask.');
    }
  };

  return (
    <>
      <h1>Ethereum Gas Fee Tracker</h1>
      <button onClick={connectWallet}>Connect MetaMask</button>
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Enter Ethereum Address"
      />
      <button onClick={calculateGasFees}>Calculate Gas Fees</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {totalGasFees && <h2>Total Gas Fees Paid: {totalGasFees} ETH</h2>}
    </>
  );
};


export default GasTracker
