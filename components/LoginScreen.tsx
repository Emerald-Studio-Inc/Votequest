import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface LoginScreenProps {
    loading: boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ loading }) => {
    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col px-8 py-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black"></div>
            <div className="absolute inset-0 opacity-10">
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-600 rounded-full blur-[128px]"></div>
            </div>

            <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full relative z-10">
                <div className="mb-16">
                    <h1 className="text-4xl font-light text-white mb-3 tracking-tight">Connect Wallet</h1>
                    <p className="text-zinc-500">Authenticate using your Web3 wallet</p>
                </div>

                <div className="flex justify-center">
                    <ConnectButton.Custom>
                        {({
                            account,
                            chain,
                            openAccountModal,
                            openChainModal,
                            openConnectModal,
                            authenticationStatus,
                            mounted,
                        }) => {
                            const ready = mounted && authenticationStatus !== 'loading';
                            const connected =
                                ready &&
                                account &&
                                chain &&
                                (!authenticationStatus ||
                                    authenticationStatus === 'authenticated');

                            return (
                                <div
                                    {...(!ready && {
                                        'aria-hidden': true,
                                        'style': {
                                            opacity: 0,
                                            pointerEvents: 'none',
                                            userSelect: 'none',
                                        },
                                    })}
                                >
                                    {(() => {
                                        if (!connected) {
                                            return (
                                                <button
                                                    onClick={openConnectModal}
                                                    type="button"
                                                    className="w-full bg-white text-black font-medium py-4 px-8 rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    Connect Wallet
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>
                                            );
                                        }

                                        if (chain.unsupported) {
                                            return (
                                                <button onClick={openChainModal} type="button" className="bg-red-500 text-white px-4 py-2 rounded">
                                                    Wrong network
                                                </button>
                                            );
                                        }

                                        return (
                                            <div style={{ display: 'flex', gap: 12 }}>
                                                <button
                                                    onClick={openChainModal}
                                                    style={{ display: 'flex', alignItems: 'center' }}
                                                    type="button"
                                                    className="bg-zinc-800 text-white px-4 py-2 rounded"
                                                >
                                                    {chain.hasIcon && (
                                                        <div
                                                            style={{
                                                                background: chain.iconBackground,
                                                                width: 12,
                                                                height: 12,
                                                                borderRadius: 999,
                                                                overflow: 'hidden',
                                                                marginRight: 4,
                                                            }}
                                                        >
                                                            {chain.iconUrl && (
                                                                <img
                                                                    alt={chain.name ?? 'Chain icon'}
                                                                    src={chain.iconUrl}
                                                                    style={{ width: 12, height: 12 }}
                                                                />
                                                            )}
                                                        </div>
                                                    )}
                                                    {chain.name}
                                                </button>
                                                <button onClick={openAccountModal} type="button" className="bg-zinc-800 text-white px-4 py-2 rounded">
                                                    {account.displayName}
                                                    {account.displayBalance
                                                        ? ` (${account.displayBalance})`
                                                        : ''}
                                                </button>
                                            </div>
                                        );
                                    })()}
                                </div>
                            );
                        }}
                    </ConnectButton.Custom>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-zinc-600 text-sm">
                        By connecting, you agree to our Terms of Service
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
