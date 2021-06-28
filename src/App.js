import React from 'react';
import './App.css';

import {generatePassword} from './Utils/generation';

const {SodiumPlus} = require('sodium-plus');

function App() {
    React.useEffect(() => {
        console.log("Ready.");
        console.log("Generating keys...")
        createKeys();

    }, [])

    // React states
    const [encryptedData, setEncryptedData] = React.useState(null);
    const [decryptedData, setDecryptedData] = React.useState(null);
    const [sodium, setSodium] = React.useState(null);
    const [sodiumKey, setKey] = React.useState(null);
    const [keysLoader, setKeysLoader] = React.useState("Generating keys...");

    // Helper functions

    const fromHexString = async (hexString) => new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

    const toHexString = (bytes) => bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

    const createKeys = async () => { // Creates cryptography keys derived from a randomly generated password and salt.
        setSodium(await SodiumPlus.auto());
        const sodium = await SodiumPlus.auto();

        let password = await generatePassword(16);
        let plainSalt = await generatePassword(16);
        let salt = new TextEncoder().encode(plainSalt);
        console.log(`Password: ${password}\nSalt: ${plainSalt}`)

        const key = await sodium.crypto_pwhash(32, password, salt, sodium.CRYPTO_PWHASH_OPSLIMIT_INTERACTIVE, sodium.CRYPTO_PWHASH_MEMLIMIT_INTERACTIVE);
        setKey(key);
        console.log("Keys generated.");
        setKeysLoader("Keys generated!")
    }

    const encrypt = async (unencryptedText) => { // Encrypts data using the keys and a randomly generated nonce.
        const nonce = await sodium.randombytes_buf(24);
        let ciphertext = toHexString(await sodium.crypto_secretbox(unencryptedText, nonce, sodiumKey));
        setEncryptedData(ciphertext);
        return [ciphertext, nonce];
    }

    const decrypt = async (data) => { // Decrypts encrypted data using a provided nonce.
        let decrypted = await sodium.crypto_secretbox_open(await fromHexString(data[0]), data[1], sodiumKey);
        setDecryptedData(decrypted.toString('utf8'));
    }

    return (
        <>
            <div className="App">
                <p>{keysLoader}</p>
                {
                keysLoader === 'Keys generated!' && <>
                    <textarea style={
                            {
                                height: "4rem",
                                width: "50%"
                            }
                        }
                        onChange={
                            async (e) => {
                                await decrypt(await encrypt(e.target.value))
                            }
                    }></textarea>
                <br></br>
                <h1>Encrypted Data</h1>
                <div style={
                    {
                        width: "100%",
                        display: "flex",
                        justifyContent: "center"
                    }
                }>
                    <div style={
                        {
                            width: "80%",
                            wordWrap: "break-word"
                        }
                    }>
                        <p>{encryptedData}</p>
                    </div>
                </div>
                <h1>Decrypted Data</h1>
                <div style={
                    {
                        width: "100%",
                        display: "flex",
                        justifyContent: "center"
                    }
                }>
                    <div style={
                        {
                            width: "80%",
                            wordWrap: "break-word"
                        }
                    }>
                        <p>{decryptedData}</p>
                    </div>
                </div>
            </>
            } </div>
        </>
    );
}

export default App;
