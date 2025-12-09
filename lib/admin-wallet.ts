/**
 * Admin-only wallet hook for Polygon Amoy
 * Only connects wallet when explicitly needed for admin functions
 */

'use client'

import { useState, useCallback } from 'react'

// Polygon Amoy testnet configuration
const POLYGON_AMOY_CHAIN_ID = '0x13882' // 80002 in hex
const POLYGON_AMOY_RPC_URL = 'https://rpc-amoy.polygon.technology/'

export function useAdminWallet() {
    const [address, setAddress] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [connecting, setConnecting] = useState(false)

    const connect = useCallback(async () => {
        try {
            setConnecting(true)
            setError(null)

            const ethereumWindow = (window as any).ethereum
            if (!ethereumWindow) {
                throw new Error('MetaMask or compatible wallet not installed. Please install MetaMask to use admin features.')
            }

            // Request accounts
            const accounts = await ethereumWindow.request({
                method: 'eth_requestAccounts'
            })

            if (accounts && accounts.length > 0) {
                // Switch to Polygon Amoy
                try {
                    await ethereumWindow.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: POLYGON_AMOY_CHAIN_ID }]
                    })
                } catch (switchError: any) {
                    // Chain not added, add it
                    if (switchError.code === 4902) {
                        await ethereumWindow.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: POLYGON_AMOY_CHAIN_ID,
                                chainName: 'Polygon Amoy',
                                nativeCurrency: {
                                    name: 'POL',
                                    symbol: 'POL',
                                    decimals: 18
                                },
                                rpcUrls: [POLYGON_AMOY_RPC_URL],
                                blockExplorerUrls: ['https://amoy.polygonscan.com/']
                            }]
                        })
                    } else {
                        throw switchError
                    }
                }

                setAddress(accounts[0])
                return accounts[0]
            }
        } catch (err: any) {
            setError(err.message || 'Failed to connect wallet')
            throw err
        } finally {
            setConnecting(false)
        }
    }, [])

    const disconnect = useCallback(() => {
        setAddress(null)
        setError(null)
    }, [])

    return {
        address,
        error,
        connecting,
        connect,
        disconnect,
        isConnected: !!address
    }
}

