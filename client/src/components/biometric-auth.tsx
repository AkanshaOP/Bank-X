import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Loader2, Fingerprint } from "lucide-react";

interface BiometricAuthProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function BiometricAuth({ onSuccess, onCancel }: BiometricAuthProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const timeoutRef = useRef<number>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleVerify = () => {
    setIsVerifying(true);
    // Mock biometric verification
    timeoutRef.current = window.setTimeout(() => {
      setIsVerifying(false);
      onSuccess();
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          {isVerifying ? (
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
          ) : (
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Fingerprint
                className="h-16 w-16 text-primary cursor-pointer"
                onClick={handleVerify}
              />
            </motion.div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {isVerifying
            ? "Verifying your identity..."
            : "Click the fingerprint to verify your identity"}
        </p>
      </div>
      <Button
        variant="outline"
        className="w-full"
        onClick={onCancel}
        disabled={isVerifying}
      >
        Cancel
      </Button>
    </motion.div>
  );
}
