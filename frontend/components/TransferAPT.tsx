import { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
// Internal components
import { toast } from "@/components/ui/use-toast";
import { aptosClient } from "@/utils/aptosClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAccountAPTBalance } from "@/view-functions/getAccountBalance";
import { transferAPT } from "@/entry-functions/transferAPT";

export function TransferAPT() {
  const { account, signAndSubmitTransaction } = useWallet();
  const queryClient = useQueryClient();

  const [aptBalance, setAptBalance] = useState<number>(0);
  const [recipient, setRecipient] = useState<string>();
  const [transferAmount, setTransferAmount] = useState<number>();
  const [transactions, setTransactions] = useState<any[]>([]);
  const { data } = useQuery({
    queryKey: ["apt-balance", account?.address],
    refetchInterval: 10_000,
    queryFn: async () => {
      try {
        if (account === null) {
          console.error("Account not available");
        }

        const balance = await getAccountAPTBalance({ accountAddress: account!.address });

        return {
          balance,
        };
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error,
        });
        return {
          balance: 0,
        };
      }
    },
  });

  const fetchTransactions = async () => {
    if (!account) return;

    try {
      const response = await aptosClient().getAccountTransactions({ accountAddress: account.address });
      console.log("Transactions", response);

      if (response && Array.isArray(response)) {
        setTransactions(response);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error("Failed to fetch transactions", error);
    }
  };

  const onClickButton = async () => {
    if (!account || !recipient || !transferAmount) {
      return;
    }

    try {
      const committedTransaction = await signAndSubmitTransaction(
        transferAPT({
          to: recipient,
          // APT is 8 decimal places
          amount: Math.pow(10, 8) * transferAmount,
        }),
      );
      const executedTransaction = await aptosClient().waitForTransaction({
        transactionHash: committedTransaction.hash,
      });
      queryClient.invalidateQueries();
      toast({
        title: "Success",
        description: `Transaction succeeded, hash: ${executedTransaction.hash}`,
      });
      setTransactions((prevTransactions) => [
        executedTransaction,
        ...prevTransactions,
      ])
      await fetchTransactions(); // Fetch transactions after a successful transfer
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (data) {
      setAptBalance(data.balance);
      fetchTransactions();
    }
  }, [data]);

  return (
    <div className="gap-6">
      <h4 className="text-lg p-10 border m-4 font-medium">APT balance: {aptBalance / Math.pow(10, 8)}</h4>
      <div>
        <div className="p-3 flex flex-col">
          <label htmlFor="recipient">Recipient</label>
          <Input disabled={!account} placeholder="0x1" onChange={(e) => setRecipient(e.target.value)} />
          <label htmlFor="amount">Amount</label>
          <Input disabled={!account} placeholder="100" onChange={(e) => setTransferAmount(parseFloat(e.target.value))} />
        </div>
      </div>
      <Button
        disabled={!account || !recipient || !transferAmount || transferAmount > aptBalance || transferAmount <= 0}
        onClick={onClickButton}
        className="bg-teal-400 hover:bg-lime-900 text-black text-lg"
      >
        Transfer
      </Button>
      <div className="mt-4">
        {/* Display Transaction */}
        <h4 className="text-lg font-medium">Transaction History:</h4>
        {transactions.length > 0 ? (
          <ul className="mt-2 space-y-2">
            {transactions.map((tx, index) => (
              <li key={index} className="p-2 bg-gray-100 rounded-md">
                <span className="font-semibold">Tx Hash:</span> {tx.hash ? tx.hash.toString() : "N/A"} <br />
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