const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789";

const secureRandom = async (count) => { // generate a cryptographically secure integer

    var cryptoObj = window.crypto || window.msCrypto
    var rand = new Uint32Array(1)
    var skip = 0x7fffffff - 0x7fffffff % count
    var result

    if (((count - 1) & count) === 0) {
        cryptoObj.getRandomValues(rand)
        return rand[0] & (count - 1)
    }

    do {
        cryptoObj.getRandomValues(rand)
        result = rand[0] & 0x7fffffff
    } while (result >= skip)

    return result % count
}

export const generatePassword = async (length) => {
    // Generates a password
    const passwordList = new Array;

    for (let x = 0; x < length; x++) {
        var randomLetter = letters.charAt(await secureRandom(letters.length));
        passwordList.push(randomLetter)
    }

    const concatPassword = passwordList.join('');
    return concatPassword;
}