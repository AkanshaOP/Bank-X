import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Mic, Loader2 } from "lucide-react";

interface VoiceAuthProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function VoiceAuth({ onSuccess, onCancel }: VoiceAuthProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const timeoutRef = useRef<number>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleRecord = () => {
    setIsRecording(true);
    // Mock voice recording and verification
    timeoutRef.current = window.setTimeout(() => {
      setIsRecording(false);
      setIsVerifying(true);
      // Mock verification process
      timeoutRef.current = window.setTimeout(() => {
        setIsVerifying(false);
        onSuccess();
      }, 1500);
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
              <Mic
                className={`h-16 w-16 ${
                  isRecording ? "text-red-500 animate-pulse" : "text-primary"
                } cursor-pointer`}
                onClick={handleRecord}
              />
            </motion.div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {isVerifying
            ? "Verifying your voice..."
            : isRecording
            ? "Say 'Authorize Payment'"
            : "Click the microphone and say 'Authorize Payment'"}
        </p>
      </div>
      <Button
        variant="outline"
        className="w-full"
        onClick={onCancel}
        disabled={isRecording || isVerifying}
      >
        Cancel
      </Button>
    </motion.div>
  );
}
