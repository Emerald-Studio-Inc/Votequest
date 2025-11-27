import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

interface AppLayoutProps {
    children: React.ReactNode;
    currentScreen: string;
    userData: any;
    onNavigate: (screen: string) => void;
    isConnected: boolean;
    onConnect: () => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({
    children,
    currentScreen,
    userData,
    onNavigate,
    isConnected,
    onConnect
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="app-container">
            {/* Sidebar Navigation */}
            <Sidebar
                currentScreen={currentScreen}
                onNavigate={onNavigate}
                isConnected={isConnected}
                onConnect={onConnect}
            />

            {/* Main Content Area */}
            <div className="main-wrapper">
                {/* Top Header */}
                <TopHeader
                    userData={userData}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />

                {/* Page Content */}
                <main className="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
