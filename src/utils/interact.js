import  { pinJSONToIPFS } from './pinata.js';
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const  { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);
require('dotenv').config();

const contractABI = require('../contract-abi.json');
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

//Connnect Dapp to Ethereum account(Metamask);
export const connectWallet = async () => {
  if(window.ethereum) {
    try{
      const addressArray = await window.ethereum.request({
      method: "eth_requestAccounts",
      });
      console.log(addressArray)
      const obj = {
        status: "👆🏽 Write a message in the text-field above.",
        address: addressArray[0],
      };
      console.log(obj)
      return obj;
    } 
    catch (err) {
      return {
        address: "",
        status: "😥" + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {""}
            🦊{" "}
            <a 
            rel='noreferrer'
            target= "_blank" href = {`https://metamask.io/download.html`}>
              You must install Metamask, a virtual Ethereum wallet, in your browser.
            </a>
          </p>
        </span>
      )
    }
  }
}


//Mint NFT
export const mintNFT = async (url, name, description) => {
  //error handling
  if (url.trim() === "" || (name.trim() === "" || description.trim() === "")) {
    return{
      success: false,
      statusMessage: "!Please make sure all fields are completed before minting."
    }
  }

  //make metadata
  const metadata = new Object();
  metadata.name = name;
  metadata.image = url;
  metadata.description = description;

  //make pinata call
  const pinataResponse = await pinJSONToIPFS(metadata);

  //console.log(pinataResponse)
  if(!pinataResponse.success) {
    return {
      success: false,
      statusMessage: "😢 Something went wrong while uploading your tokenURI.",
    }
  }
  const tokenURI = pinataResponse.pinataUrl;

  //load smart contract
  //window.contract = await new web3.eth.Contract(contractABI, contractAddress);
  window.contract = await new web3.eth.Contract(contractABI, contractAddress);

  console.log(window)

  //set up your Ethereum transaction
  const transactionParameters = {
    to: contractAddress, //Required except during contract publications.
    from: window.ethereum.selectedAddress, //must match user's active address.
    'data': window.contract.methods.mintNFT(window.ethereum.selectedAddress, tokenURI).encodeABI() //make call to NFT smart contract
  };

  //sign the transaction via Metamask
  try{
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    });
    return  {
      success: "true",
      statusMessage:
      (
        <span>
          <div style={{width: '60%', textAlign: "center", color:'#4FBF26'}}>
          ✅ Check out your transaction on Etherscan:
            <a target="_blank"
            rel='noreferrer'
             href={'https://goerli.etherscan.io/tx/' + txHash}>
             Here
            </a>
          </div>
        </span>
      ),
      status: "success"
    }

  }
  catch (error) {
    return{
      success: false,
      statusMessage: "😥 Something went wrong:" + error.message,
      status: "error"
    }
  }
  // finally{
  //   return{
  //     status: "finally"
  //   }
  // }
}





//Get Wallet Details  in case of refresh.
export const getCurrentwalletConnected = async () => {
  if(window.ethereum) {
    try{
      const addressArray = await window.ethereum.request({
        method: "eth_accounts",
      });
      if(addressArray.length > 0) {
        return{
          address: addressArray[0],
          status: "👆🏽 Write a message in the text-field above.",
        };
      } else {
        return {
          address: "",
          status: "🦊 Connect to Metamask using the top right button."
        };
      }
    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
      };
    }
  }else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a target="_blank"
            rel='noreferrer'
             href={`https://metamask.io/download.html`}>
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
}