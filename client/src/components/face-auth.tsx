import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Scan, Loader2 } from "lucide-react";

interface FaceAuthProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function FaceAuth({ onSuccess, onCancel }: FaceAuthProps) {
  const [isScanning, setIsScanning] = useState(false);
  const timeoutRef = useRef<number>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleScan = () => {
    setIsScanning(true);
    // Mock facial scanning process
    timeoutRef.current = window.setTimeout(() => {
      setIsScanning(false);
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
          {isScanning ? (
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
          ) : (
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Scan
                className="h-16 w-16 text-primary cursor-pointer"
                onClick={handleScan}
              />
            </motion.div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {isScanning
            ? "Scanning your face..."
            : "Click the icon to start facial scanning"}
        </p>
      </div>
      <Button
        variant="outline"
        className="w-full"
        onClick={onCancel}
        disabled={isScanning}
      >
        Cancel
      </Button>
    </motion.div>
  );
}
