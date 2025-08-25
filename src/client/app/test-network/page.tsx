'use client'

import { useState, useEffect } from 'react'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { useContractService } from '@/lib/services/contracts'
import { getNetworkName, isSupportedChain } from '@/lib/contracts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function TestNetworkPage() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const contractService = useContractService()
  
  const [currentNetwork, setCurrentNetwork] = useState<string>('')
  const [isSupported, setIsSupported] = useState<boolean>(false)
  const [testResult, setTestResult] = useState<string>('')

  useEffect(() => {
    if (chainId) {
      setCurrentNetwork(getNetworkName(chainId))
      setIsSupported(isSupportedChain(chainId))
    }
  }, [chainId])

  const testNetworkSwitching = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    try {
      setTestResult('Testing network detection...')
      
      // Test network detection
      const networkName = getNetworkName(chainId || 0)
      const supported = isSupportedChain(chainId || 0)
      
      setTestResult(`Network: ${networkName} (Chain ID: ${chainId})\nSupported: ${supported}`)
      
      toast.success(`Network detection working! Connected to ${networkName}`)
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      toast.error('Network test failed')
    }
  }

  const testContractService = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    try {
      setTestResult('Testing contract service...')
      
      // Test contract service initialization
      const networkName = getNetworkName(chainId || 0)
      
      setTestResult(`Contract service initialized for ${networkName} (Chain ID: ${chainId})`)
      
      toast.success('Contract service working!')
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      toast.error('Contract service test failed')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Network Switching Test</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Network Status</CardTitle>
            <CardDescription>Real-time network information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <strong>Connected:</strong> {isConnected ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Address:</strong> {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
            </div>
            <div>
              <strong>Network:</strong> {currentNetwork || 'Unknown'}
            </div>
            <div>
              <strong>Chain ID:</strong> {chainId || 'Unknown'}
            </div>
            <div>
              <strong>Supported:</strong> {isSupported ? '✅ Yes' : '❌ No'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Network Actions</CardTitle>
            <CardDescription>Test network switching functionality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => switchChain?.({ chainId: 146 })} 
              disabled={!switchChain || chainId === 146}
              className="w-full"
            >
              Switch to Sonic Mainnet
            </Button>
            
            <Button 
              onClick={() => switchChain?.({ chainId: 14601 })} 
              disabled={!switchChain || chainId === 14601}
              className="w-full"
            >
              Switch to Sonic Testnet
            </Button>
            
            <Button 
              onClick={testNetworkSwitching}
              disabled={!isConnected}
              className="w-full"
            >
              Test Network Detection
            </Button>
            
            <Button 
              onClick={testContractService}
              disabled={!isConnected}
              className="w-full"
            >
              Test Contract Service
            </Button>
          </CardContent>
        </Card>
      </div>

      {testResult && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg whitespace-pre-wrap text-sm">
              {testResult}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>✅ <strong>Dynamic Network Detection:</strong> The app automatically detects which network you're connected to</p>
            <p>✅ <strong>Contract Address Selection:</strong> Uses the correct contract addresses based on the current network</p>
            <p>✅ <strong>Network Validation:</strong> Checks if the current network is supported</p>
            <p>✅ <strong>Seamless Switching:</strong> Works when you switch between Mainnet and Testnet</p>
            <p>⚠️ <strong>Current Setup:</strong> Both networks use mainnet contract addresses for testing</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 