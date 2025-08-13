"use client"

import { useAccount, useBalance, useChainId } from 'wagmi'

export function useWallet() {
  const { address, isConnected, isConnecting } = useAccount()
  const chainId = useChainId()
  
  const { data: balance } = useBalance({
    address,
  })

  return {
    // Connection state
    address,
    isConnected,
    isConnecting,
    
    // Wallet data
    balance,
    chainId,
  }
} 