import React, { useState, useEffect } from 'react';
import { InputTransactionData, useTransaction } from "@aptos-labs/wallet-adapter-react";
import { MODULE_ADDRESS } from "@/constants";
import  { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { aptosClient } from "@/utils/aptosClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { mintNFT } from '@/entry-functions/nftCollection';

export function MintNft() {
    const { account, signAndSubmitTransaction } = useWallet();
    const queryClient = useQueryClient();
  
    const [collectionId, setCollectionId] = useState<string>();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [mintStatus, setMintStatus] = useState<string>("");
    // Remove the unused interface declaration

    const { data } = useQuery({
        queryKey: ["apt-balance", account?.address],
        refetchInterval: 10_000,
        queryFn: async () => {
          try {
            if (!account) return;
    
            const balance = await aptosClient().getAccountBalance(account!.address) as number;
            return { balance };
          } catch (error: any) {
            toast({
              variant: "destructive",
              title: "Error",
              description: error.message,
            });
            return { balance: 0 };
          }
        },
      });

      const fetchTransactions = async () => {
        if (!account) return;
    
        try {
          const response = await aptosClient().getAccountTransactions({ accountAddress: account.address });
          setTransactions(response || []);
        } catch (error) {
          console.error("Failed to fetch transactions", error);
        }
      };
    
      const onMintClick = async () => {
        if (!account || !collectionId) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Account or collection ID is missing.",
          });
          return;
        }
    
        try {
        const committedTransaction = await signAndSubmitTransaction(
            mintNFT({
              collectionId,
              amount: 1, // Provide the required 'amount' property
            }),
        );
    
          const executedTransaction = await aptosClient().waitForTransaction({
            transactionHash: committedTransaction.hash,
          });
    
          setMintStatus("Minting successful!");
          queryClient.invalidateQueries();
          setTransactions((prev) => [executedTransaction, ...prev]);
          await fetchTransactions();
    
          toast({
            title: "Success",
            description: `NFT minted, hash: ${executedTransaction.hash}`,
          });
        } catch (error) {
          console.error(error);
          setMintStatus("Minting failed.");
        }
      };
    
      useEffect(() => {
        if (data) {
          fetchTransactions();
        }
      }, [data]);
    
      return (
        <div className="gap-6">
          <h4 className="text-lg p-10 border m-4 font-medium">Mint an NFT</h4>
          <div>
            <div className="p-3 flex flex-col">
              <label htmlFor="collectionId">Collection ID</label>
              <Input
                disabled={!account}
                placeholder="Collection ID"
                onChange={(e) => setCollectionId(e.target.value)}
              />
            </div>
          </div>
          <Button
            disabled={!account || !collectionId}
            onClick={onMintClick}
            className="bg-teal-400 hover:bg-lime-900 text-black text-lg"
          >
            Mint NFT
          </Button>
          <div className="mt-4">
            <h4 className="text-lg font-medium">Mint Status: {mintStatus}</h4>
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