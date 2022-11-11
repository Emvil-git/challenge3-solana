
// importfunctionalities
import React from 'react';
import logo from './logo.svg';
import './App.css';
import {
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import { IoCopyOutline } from 'react-icons/io5'
import {useEffect , useState } from "react";

// create types
type DisplayEncoding = "utf8" | "hex";

type PhantomEvent = "disconnect" | "connect" | "accountChanged";
type PhantomRequestMethod =
  | "connect"
  | "disconnect"
  | "signTransaction"
  | "signAllTransactions"
  | "signMessage";

interface ConnectOpts {
  onlyIfTrusted: boolean;
}

// create a provider interface (hint: think of this as an object) to store the Phantom Provider
interface PhantomProvider {
  publicKey: PublicKey | null;
  isConnected: boolean | null;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  signMessage: (
    message: Uint8Array | string,
    display?: DisplayEncoding
  ) => Promise<any>;
  connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, handler: (args: any) => void) => void;
  request: (method: PhantomRequestMethod, params: any) => Promise<unknown>;
}

/**
 * @description gets Phantom provider, if it exists
 */
 const getProvider = (): PhantomProvider | undefined => {
  if ("solana" in window) {
    // @ts-ignore
    const provider = window.solana as any;
    if (provider.isPhantom) return provider as PhantomProvider;
  }
};

function App() {
  // create state variable for the provider
  const [provider, setProvider] = useState<PhantomProvider | undefined>(
    undefined
  );

	// create state variable for the wallet key
  const [walletKey, setWalletKey] = useState<PhantomProvider | undefined>(
  undefined
  );

  // this is the function that runs whenever the component updates (e.g. render, refresh)
  useEffect(() => {
	  const provider = getProvider();

		// if the phantom provider exists, set this as the provider
	  if (provider) setProvider(provider);
	  else setProvider(undefined);
  }, []);

  /**
   * @description prompts user to connect wallet if it exists.
	 * This function is called when the connect wallet button is clicked
   */
  const connectWallet = async () => {
    // @ts-ignore
    const { solana } = window;

		// checks if phantom wallet exists
    if (solana) {
      try {
				// connects wallet and returns response which includes the wallet public key
        const response = await solana.connect();
        console.log('wallet account ', response.publicKey.toString());
				// update walletKey to be the public key
        setWalletKey(response.publicKey.toString());
      } catch (err) {
      // { code: 4001, message: 'User rejected the request.' }
      }
    }
  };

  const disconnectWallet = async () => {
    // @ts-ignore
    const { solana } = window;

		// checks if phantom wallet exists
    if (solana) {
      try {
				// disconnects wallet and returns response which includes the wallet public key
        const response = await solana.disconnect();
        console.log('wallet disconnected');
				// update walletKey to be the public key
        setWalletKey(undefined);
      } catch (err) {
      // { code: 4001, message: 'User rejected the request.' }
      }
    }
  }

  const copyKey = () => {
    const copyKey = document.getElementById("pubkey") as HTMLInputElement;

    copyKey?.select();
    copyKey.setSelectionRange(0, 99999);

    if (typeof copyKey?.value === 'string'){
      console.log(copyKey?.value)
      navigator.clipboard.writeText(copyKey?.value);  
    }

    const tooltip = document.querySelector('.App-copytoolkit') as HTMLSpanElement;
    tooltip.innerHTML = "Key Copied"
  }

  const mouseOut = () => {
    const tooltip = document.querySelector('.App-copytoolkit') as HTMLSpanElement;
    setTimeout(() => {tooltip.innerHTML = "Copy Key"} , 300)
  }

  const display = () => {
    switch(true) {
      case provider !== undefined && walletKey !== undefined:
        return(
          <section className='App-cont'>
            <p>Connected account</p>
            <section className='App-keywrap'>
              <h3 className='App-keylabel'>Your Public Key</h3>
              <section className='App-keysect'>
                <textarea wrap='off' rows={1} readOnly value={`${walletKey}`} id='pubkey'/>
                <button onMouseOut={mouseOut} onClick={copyKey} className='App-copy'>
                
                <span className='App-copytoolkit'>Copy Key</span>
                <IoCopyOutline />
                
                </button>
              </section>
            </section>
            <button
              onClick={disconnectWallet}
              className="App-btn"
            >
              Disconnect Wallet
            </button>
          </section>
        )
      case provider !== undefined && !walletKey:
        return(
          <section className='App-cont'>
            <button
              onClick={connectWallet}
              className="App-btn"
            >
              Connect Wallet
            </button>
          </section>
        )
      default:
        return(
          <section className='App-cont'>
            <p>
              No provider found. Install{" "}
              <a href="https://phantom.app/">Phantom Browser extension</a>
            </p>
          </section>
        )
    }
  }

	// HTML code for the app
  return (
    <div className="App">
      <main className='App-main'>
        <header className="App-header">
          <h2>Connect to Phantom Wallet</h2>
        </header>

        {display()}

        {/* {provider && !walletKey && (
            <button
              onClick={connectWallet}
            >
              Connect Wallet
            </button>
          )}
          {provider && walletKey && <p>Connected account</p> }
  
          {!provider && (
            <p>
              No provider found. Install{" "}
              <a href="https://phantom.app/">Phantom Browser extension</a>
            </p>
          )} */}
      </main>
    </div>
  );
}

export default App;
