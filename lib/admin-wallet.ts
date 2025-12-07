/**
 * Admin-only wallet hook
 * Only connects MetaMask when explicitly needed for admin functions
 */

'use client'

import { useState, useCallback } from 'react'

export function useAdminWallet() {
    const [address, setAddress] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [connecting, setConnecting] = useState(false)

    const connect = useCallback(async () => {
        try {
            setConnecting(true)
            setError(null)

            if (!window.ethereum) {
                throw new Error('MetaMask not installed. Please install MetaMask to use admin features.')
            }

            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            })

            if (accounts && accounts.length > 0) {
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
