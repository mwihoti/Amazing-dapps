import { useState, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { aptosClient } from "@/utils/aptosClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {  createCollection } from '@/entry-functions/nftCollection' // Your function to handle collection creation

export function CreateCollection() {
  const { account, signAndSubmitTransaction } = useWallet();
  const queryClient = useQueryClient();

  const [name, setName] = useState<string>();
  const [description, setDescription] = useState<string>();
  const [uri, setUri] = useState<string>();
  const [maxSupply, setMaxSupply] = useState<number>();
  const [transactions, setTransactions] = useState<any[]>([]);

  
  const onClickCreate = async () => {
    if (!account || !name || !description || !uri || !maxSupply) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields.",
      });
      return;
    }

    try {
      const committedTransaction = await signAndSubmitTransaction(
        createCollection({
          creator_addr: account.address,
          name, 
          description,         
          uri,
          maxSupply,
        }),
      );
      const executedTransaction = await aptosClient().waitForTransaction({
        transactionHash: committedTransaction.hash,
      });

      toast({
        title: "Success",
        description: `Collection created, hash: ${executedTransaction.hash}`,
      });
      queryClient.invalidateQueries();
      setTransactions((prev) => [executedTransaction, ...prev]);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create collection.",
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
      const response = await aptosClient().getAccountTransactions({ accountAddress: account.address });
      setTransactions(response || []);
    } catch (error) {
      console.error("Failed to fetch transactions", error);
    }
  };

  return (
    <div className="gap-6">
      <h4 className="text-lg p-10 border m-4 font-medium">Create a Collection</h4>
      <div className="p-3 flex flex-col">
        <label htmlFor="name">Name</label>
        <Input disabled={!account} placeholder="Collection Name" onChange={(e) => setName(e.target.value)} />

        <label htmlFor="description">Description</label>
        <Input disabled={!account} placeholder="Collection Description" onChange={(e) => setDescription(e.target.value)} />

        <label htmlFor="uri">URI</label>
        <Input disabled={!account} placeholder="Collection URI" onChange={(e) => setUri(e.target.value)} />

        <label htmlFor="maxSupply">Max Supply</label>
        <Input disabled={!account} placeholder="Max Supply" type="number" onChange={(e) => setMaxSupply(parseInt(e.target.value))} />
      </div>

      <Button
        disabled={!account || !name || !description || !uri || !maxSupply}
        onClick={onClickCreate}
        className="bg-teal-400 hover:bg-lime-900 text-black text-lg"
      >
        Create Collection
      </Button>

     {/* <div className="mt-4">
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
      </div> */}
    </div>
  );
}