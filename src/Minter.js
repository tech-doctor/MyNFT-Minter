import { useEffect, useReducer } from "react";
import { connectWallet, mintNFT, getCurrentwalletConnected } from "./utils/interact";


const nftMintReducer = (state, action) => {
  switch (action.type) {
    case "CONNECT_WALLET": 
      return {
        ...state,
        status: action.status,
        walletAddress: action.walletAddress
      }
    case "TEXT_INPUT": 
      return {
        ...state,
        [action.payload.key]: action.payload.value,
      }
    case "MINTING":
      return {
        ...state,
        minting: true,
      }
    case "MINT" :
      return {
        ...state,
        minting: false,
        status: action.status,
        name: "",
        description: "",
        url: ""
      }
    
    case "ACCOUNT_CHANGES" :
      if(action.payload.length > 0 ){
        return{
          ...state,
          walletAddress: action.payload[0],
          status: "👆🏽 Write a message in the text-field above."
        }
      }
      return{
        ...state,
        walletAddress: "",
        status: "🦊 Connect to Metamask using the top right button."

      }
    case "WALLET_LISTENER_ONERROR" : 
      return{
        ...state,
        status: <p>
        {" "}
        🦊{" "}
        <a target="_blank" href={`https://metamask.io/download.html`}>
          You must install Metamask, a virtual Ethereum wallet, in your
          browser.
        </a>
      </p>
      }
    default:
    break;
  }
}


const initialState = {
  walletAddress: "",
  status: "",
  name: "",
  description: "",
  url: "",
  minting: false
}

const Minter = (props) => {
  const [state, dispatch] = useReducer(nftMintReducer, initialState);
  //console.log(state)
  //State variables
  const {name, description, url, walletAddress, status, minting} = state;
  //console.log(window);
 
  useEffect(async () => {
    const {address, status} = await getCurrentwalletConnected();
    dispatch({
      type: 'CONNECT_WALLET', 
      status,
      walletAddress: address
    })
    addWalletListener(dispatch);
  }, []);

  
  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet();
    dispatch({
      type: 'CONNECT_WALLET', 
      status:walletResponse.status,
      walletAddress: walletResponse.address
    })
  };

  const onMintPressed = async () => {
    dispatch({type: 'MINTING'});
    const {statusMessage, status} = await mintNFT(url, name, description);
    dispatch({type: 'MINT', 
    status:statusMessage, 
    payload: status});
  };

  return (
    <div className="Minter">
      <button id="walletButton" onClick={connectWalletPressed}>
        {walletAddress.length > 0 ? (
          <div className="connected">
            <span>Connected: </span>
            <span className="address">{String(walletAddress).substring(0, 4) +
            "..." +
            String(walletAddress).substring(38)}</span>
          </div>
        ) :(
          <span>Connect Wallet</span>
        )}
      </button>
       <div className="header">
          <h2 className="title"> My NFT Minter</h2>
          <p className="form_details">
            Simply add your asset's link, name, and description, then press "Mint."
          </p>
       </div>
      <form>
        <h3>Link to asset: </h3>
        <input
          type="text"
          placeholder="Link to Asset..."
          value={url}
          onChange={(event) => 
            dispatch({
              type: "TEXT_INPUT",
              payload: {
                key: "url", value: event.target.value
              },
            })
          }
        />
        <h3>Name: </h3>
        <input
          type="text"
          placeholder="Enter NFT Name..."
          value={name}
          onChange={(event) => 
            dispatch({
              type: "TEXT_INPUT",
              payload: {
                key: "name", value: event.target.value
              },
            })
          }
        />
        <h3>Description: </h3>
        <input
          type="text"
          placeholder="Enter NFT Description..."
          value = {description}
          onChange={(event) => 
            dispatch({
              type: "TEXT_INPUT",
              payload: {
                key: "description", value: event.target.value
              },
            })
          }
        />
      </form>
       <div className="button_div">
        <button id="mintButton" onClick={onMintPressed}>
          {minting? "Minting..." : "Mint NFT"}
        </button>
       </div>
      <div
       id="status">
        {status}
      </div>
    </div>
  );

  function addWalletListener(dispatch){
    if(window.ethereum) {
      window.ethereum.on("accountsChanged",  (accounts) => {
        console.log("acount: ", accounts)
        dispatch({type: "ACCOUNT_CHANGES", payload:accounts})
      });
    } else{
      dispatch({type: "WALLET_LISTENER_ONERROR"})
    }
  }
  
};



export default Minter;
