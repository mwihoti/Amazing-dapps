import { useWallet } from "@aptos-labs/wallet-adapter-react";
// Internal Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { WalletDetails } from "@/components/WalletDetails";
import { NetworkInfo } from "@/components/NetworkInfo";
import { AccountInfo } from "@/components/AccountInfo";
import { TransferAPT } from "@/components/TransferAPT";
import { WalletSelector } from "../frontend/components/WalletSelector";

function App() {
  const { connected } = useWallet();

  return (
    <>
      
      <div className="flex justify-center items-center text-xl flex-col">
      <Header />
        {connected ? (
          <Card className="p-30  m-8">
              <WalletSelector />
            <CardContent className="flex gap-10 p-10 border">
           
            <WalletDetails />
            <NetworkInfo />
            </CardContent>
            <CardContent className="flex flex-col gap-10 pt-6">
           
              <AccountInfo />
              <TransferAPT />
              
             
            </CardContent>
          </Card>
        ) : (
          <CardHeader className="color-white">
            <CardTitle className="text-2xl">Welcome to aptos amazing.</CardTitle>
            <br />
            <CardTitle className="text-2xl">To get started Connect a wallet</CardTitle>
            <WalletSelector />
          </CardHeader>
          
        )}
      </div>
    </>
  );
}

export default App;
