import { useState, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { aptosClient } from "@/utils/aptosClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { batchMintNFTS } from "@/entry-functions/nftCollection"; // Your function to batch mint NFTs

export function BatchMintNFTs() {
  const { account, signAndSubmitTransaction } = useWallet();
  const queryClient = useQueryClient();

  const [collectionId, setCollectionId] = useState<string>();
  const [amount, setAmount] = useState<number>();
  const [transactions, setTransactions] = useState<any[]>([]);

  const onClickBatchMint = async () => {
    if (!account || !collectionId || !amount) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields.",
      });
      return;
    }

    try {
      const committedTransaction = await signAndSubmitTransaction(
        batchMintNFTS({
          collectionId,
          amount,
        }),
      );
      const executedTransaction = await aptosClient().waitForTransaction({
        transactionHash: committedTransaction.hash,
      });

      toast({
        title: "Success",
        description: `Batch minting succeeded, hash: ${executedTransaction.hash}`,
      });
      queryClient.invalidateQueries();
      setTransactions((prev) => [executedTransaction, ...prev]);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to batch mint NFTs.",
      });
    }
  };

  useEffect(() => {
    if (account) {
      fetchTransactions();
    }
  }, [account]);

  const fetchTransactions = async () => {
    if (!account) return;

    try {
      const accountAddress = { account: { address: "your_account_address" } };
      const response = await aptosClient().getAccountTransactions({ accountAddress: accountAddress.account.address });
      setTransactions(response || []);
    } catch (error) {
      console.error("Failed to fetch transactions", error);
    }
  };

  return (
    <div className="gap-6">
      <h4 className="text-lg p-10 border m-4 font-medium">Batch Mint NFTs</h4>
      <div className="p-3 flex flex-col">
        <label htmlFor="collectionId">Collection ID</label>
        <Input disabled={!account} placeholder="Collection ID" onChange={(e) => setCollectionId(e.target.value)} />

        <label htmlFor="amount">Amount</label>
        <Input disabled={!account} placeholder="Amount" type="number" onChange={(e) => setAmount(parseInt(e.target.value))} />
      </div>

      <Button
        disabled={!account || !collectionId || !amount}
        onClick={onClickBatchMint}
        className="bg-teal-400 hover:bg-lime-900 text-black text-lg"
      >
        Batch Mint NFTs
      </Button>

      <div className="mt-4">
        <h4 className="text-lg font-medium">Transaction History:</h4>
        {transactions.length > 0 ? (
          <ul className="mt-2 space-y-2">
            {transactions.map((tx, index) => (
              <li key={index} className="p-2 bg-gray-100 rounded-md">
                <span className="font-semibold">Tx Hash:</span> {tx.hash || "N/A"} <br />
                <span className="font-semibold">Status:</span> {tx.success ? "Success" : "Failed"} <br />
                <span className="font-semibold">TimeStamp:</span> {tx.timestamp ? new Date(tx.timestamp / 1000).toLocaleString() : "N/A"}
              </li>
            ))}
          </ul>
        ) : (
          <p>No transactions yet</p>
        )}
      </div>
    </div>
  );
}
