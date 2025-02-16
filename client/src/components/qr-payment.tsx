import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BiometricAuth } from "./biometric-auth";
import { VoiceAuth } from "./voice-auth";
import { FaceAuth } from "./face-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import QrScanner from "@yudiel/react-qr-scanner";
import { motion } from "framer-motion";
import { QrCode, Fingerprint, Mic, Scan } from "lucide-react";

type AuthMethod = "fingerprint" | "voice" | "face";

export function QRPayment() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const [authMethod, setAuthMethod] = useState<AuthMethod | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<{ recipient: string; amount: number } | null>(null);

  const handleScan = (data: string | null) => {
    if (data) {
      try {
        const scanned = JSON.parse(data);
        if (scanned.recipient && scanned.amount) {
          setPaymentDetails(scanned);
          setShowScanner(false);
          setAuthMethod("fingerprint");
        } else {
          throw new Error("Invalid QR Code Format");
        }
      } catch (e) {
        toast({
          title: "Invalid QR Code",
          description: "The scanned QR code is not a valid payment code",
          variant: "destructive",
        });
      }
    }
  };

  const handleError = (error: unknown) => {
    toast({
      title: "QR Scanner Error",
      description: error instanceof Error ? error.message : "An unknown error occurred",
      variant: "destructive",
    });
  };

  const processPayment = async () => {
    const paymentAmount = paymentDetails?.amount || Number(amount) * 100;
    const paymentDescription = paymentDetails?.recipient || description;

    if (!paymentAmount || !paymentDescription) {
      toast({
        title: "Invalid Payment",
        description: "Please enter a valid amount and description",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("POST", "/api/transactions", {
        amount: -paymentAmount,
        type: "debit",
        description: `Payment to ${paymentDescription}`,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });

      toast({
        title: "Payment Successful",
        description: `Paid $${(paymentAmount / 100).toFixed(2)} to ${paymentDescription}`,
      });

      setPaymentDetails(null);
      setAuthMethod(null);
      setAmount("");
      setDescription("");
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const renderAuthMethod = () => {
    const props = {
      onSuccess: processPayment,
      onCancel: () => setAuthMethod(null),
    };

    switch (authMethod) {
      case "fingerprint":
        return <BiometricAuth {...props} />;
      case "voice":
        return <VoiceAuth {...props} />;
      case "face":
        return <FaceAuth {...props} />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Make a Payment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="direct">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="direct">Direct Payment</TabsTrigger>
            <TabsTrigger value="qr">QR Code</TabsTrigger>
          </TabsList>

          {/* Direct Payment Tab */}
          <TabsContent value="direct">
            {authMethod ? (
              renderAuthMethod()
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <Input
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    className="flex flex-col items-center gap-2 h-auto py-4"
                    variant="outline"
                    onClick={() => setAuthMethod("fingerprint")}
                  >
                    <Fingerprint className="h-6 w-6" />
                    <span className="text-xs">Fingerprint</span>
                  </Button>
                  <Button
                    className="flex flex-col items-center gap-2 h-auto py-4"
                    variant="outline"
                    onClick={() => setAuthMethod("voice")}
                  >
                    <Mic className="h-6 w-6" />
                    <span className="text-xs">Voice</span>
                  </Button>
                  <Button
                    className="flex flex-col items-center gap-2 h-auto py-4"
                    variant="outline"
                    onClick={() => setAuthMethod("face")}
                  >
                    <Scan className="h-6 w-6" />
                    <span className="text-xs">Face</span>
                  </Button>
                </div>
              </motion.div>
            )}
          </TabsContent>

          {/* QR Code Payment Tab */}
          <TabsContent value="qr">
            {showScanner ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <QrScanner onDecode={handleScan} onError={handleError} 

                  containerStyle={{ borderRadius: "0.5rem", overflow: "hidden" }}
                />
                <Button className="mt-4 w-full" variant="outline" onClick={() => setShowScanner(false)}>
                  Cancel Scan
                </Button>
              </motion.div>
            ) : authMethod ? (
              renderAuthMethod()
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <Button className="w-full" onClick={() => setShowScanner(true)}>
                  <QrCode className="mr-2 h-4 w-4" />
                  Scan QR Code
                </Button>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
