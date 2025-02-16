import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Dashboard } from "@/components/dashboard";
import { QRPayment } from "@/components/qr-payment";
import { LoanApplication } from "@/components/loan-application";
import { TransactionHistory } from "@/components/transaction-history";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-16 items-center border-b px-4 lg:px-8">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => logoutMutation.mutate()}
              >
                Logout
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex-1">
          <h1 className="text-2xl font-bold">Bank X</h1>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden lg:inline-block">
            Welcome, {user?.fullName}
          </span>
          <Button
            variant="ghost"
            className="hidden lg:inline-flex"
            onClick={() => logoutMutation.mutate()}
          >
            Logout
          </Button>
        </div>
      </div>

      <main className="container mx-auto p-4 lg:p-8 space-y-8">
        <Dashboard />
        <div className="grid gap-8 lg:grid-cols-2">
          <QRPayment />
          <TransactionHistory />
        </div>
        <LoanApplication />
      </main>
    </div>
  );
}