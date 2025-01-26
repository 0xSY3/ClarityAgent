import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { STACKS_MAINNET } from '@stacks/network';

interface UserData {
  profile: {
    stxAddress: {
      mainnet: string;
      testnet: string;
    };
  };
}

export const WalletConnector = () => {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(() => {
    const appConfig = new AppConfig(['store_write', 'publish_data']);
    const userSession = new UserSession({ appConfig });
    return userSession.isUserSignedIn() ? userSession.loadUserData() : null;
  });

  const appConfig = new AppConfig(['store_write', 'publish_data']);
  const userSession = new UserSession({ appConfig });

  const connectWallet = useCallback(async () => {
    setLoading(true);
    try {
      await showConnect({
        appDetails: {
          name: 'ClarityAgent',
          icon: window.location.origin + '/logo.png',
        },
        redirectTo: '/',
        onFinish: () => {
          setUserData(userSession.loadUserData());
          setLoading(false);
        },
        userSession,
      });
    } catch (error) {
      console.error('Connection failed:', error);
      setLoading(false);
    }
  }, []);

  const disconnect = () => {
    userSession.signUserOut();
    setUserData(null);
  };

  if (userData?.profile) {
    const address = userData.profile.stxAddress.mainnet;
    const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

    return (
      <Button
        onClick={disconnect}
        className="px-4 py-2 bg-black/60 font-medium text-sm rounded-lg
          border border-orange-500/20 text-orange-400 
          hover:bg-orange-500/10 hover:border-orange-500/30
          transition-all duration-300"
      >
        {shortAddress}
      </Button>
    );
  }

  return (
    <Button
      onClick={connectWallet}
      disabled={loading}
      className="px-4 py-2 bg-orange-500/10 font-medium text-sm rounded-lg
        border border-orange-500/20 text-orange-400
        hover:bg-orange-500/20 hover:border-orange-500/30
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-300"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin">◌</span>
          Connecting...
        </span>
      ) : (
        'Connect Wallet'
      )}
    </Button>
  );
};

export default WalletConnector;