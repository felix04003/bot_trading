const base58Key = "4axxh6QEQym3enuCQdj4Vae2yaKP3LKCik7qgEE2maB7HtUXGe6yLSTQ8vRSpt7WaAhdPBPFKD4NF44KbvNNzDVf";

// Fonction pour décoder du Base58
function base58ToHex(base58Str) {
    const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    const base = ALPHABET.length;
    let num = 0n;
    
    for (let i = 0; i < base58Str.length; i++) {
        num = num * BigInt(base) + BigInt(ALPHABET.indexOf(base58Str[i]));
    }
    
    const hex = num.toString(16);
    // Ajouter un zéro si la longueur est impaire
    return hex.length % 2 ? '0' + hex : hex;
}

try {
    // Conversion directe Base58 -> Hex
    const hexKey = base58ToHex(base58Key);
    console.log("Conversion Base58 -> Hex:");
    console.log(hexKey);
    console.log(`Longueur hex: ${hexKey.length} caractères`);

    // 3. Vérifier la taille
    if (hexKey.length !== 128) {
        console.log("\n⚠️ Attention: La clé n'a pas la taille attendue (128 caractères hex)");
        console.log(`Taille actuelle: ${hexKey.length} caractères`);
    }

    // 4. Convertir en Buffer
    const keyBuffer = Buffer.from(hexKey, 'hex');
    console.log("\nConversion Hex -> Buffer:");
    console.log(keyBuffer);
    console.log(`Taille du buffer: ${keyBuffer.length} bytes`);

} catch (error) {
    console.error("❌ Erreur lors de la conversion:", error.message);
} 