import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Transaction } from "@shared/schema";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";

export function TransactionHistory() {
  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {transactions?.map((transaction, i) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  {transaction.type === "credit" ? (
                    <ArrowUpCircle className="h-8 w-8 text-green-500" />
                  ) : (
                    <ArrowDownCircle className="h-8 w-8 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(transaction.timestamp), "PPp")}
                    </p>
                  </div>
                </div>
                <div
                  className={
                    transaction.type === "credit"
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {transaction.type === "credit" ? "+" : "-"}$
                  {Math.abs(transaction.amount / 100).toFixed(2)}
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
