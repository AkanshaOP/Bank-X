import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  School,
  Home,
  Briefcase,
  Heart,
  User,
  MessageSquare,
  Calculator,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { LoanChat } from "./loan-chat";

type LoanType = "personal" | "education" | "business" | "medical" | "home";

interface LoanTypeConfig {
  icon: React.ReactNode;
  label: string;
  maxAmount: number;
  description: string;
}

const loanTypes: Record<LoanType, LoanTypeConfig> = {
  personal: {
    icon: <User className="h-6 w-6" />,
    label: "Personal Loan",
    maxAmount: 500000,
    description: "Quick personal loans for your needs",
  },
  education: {
    icon: <School className="h-6 w-6" />,
    label: "Education Loan",
    maxAmount: 1000000,
    description: "Invest in your future with education loans",
  },
  business: {
    icon: <Briefcase className="h-6 w-6" />,
    label: "Business Loan",
    maxAmount: 2000000,
    description: "Grow your business with flexible loans",
  },
  medical: {
    icon: <Heart className="h-6 w-6" />,
    label: "Medical Loan",
    maxAmount: 800000,
    description: "Healthcare financing made easy",
  },
  home: {
    icon: <Home className="h-6 w-6" />,
    label: "Home Loan",
    maxAmount: 5000000,
    description: "Make your dream home a reality",
  },
};

export function LoanApplication() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedLoanType, setSelectedLoanType] = useState<LoanType | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showLoanChat, setShowLoanChat] = useState(false);
  const [amount, setAmount] = useState("");
  const [income, setIncome] = useState("");
  const [employment, setEmployment] = useState("");
  const [recommendation, setRecommendation] = useState<string | null>(null);

  const calculateRecommendation = () => {
    const monthlyIncome = Number(income);
    const requestedAmount = Number(amount);

    if (!monthlyIncome || !requestedAmount || !selectedLoanType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all the required fields",
        variant: "destructive",
      });
      return;
    }

    const maxEligible = monthlyIncome * 36;
    const loanTypeLimit = loanTypes[selectedLoanType].maxAmount;
    const eligible = Math.min(maxEligible, loanTypeLimit);

    if (requestedAmount > eligible) {
      setRecommendation(
        `Based on your monthly income of ₹${monthlyIncome}, we recommend a maximum loan amount of ₹${eligible}. Consider reducing your loan amount or increasing your income documentation.`
      );
    } else {
      setRecommendation(
        `Great news! Based on your profile, you are eligible for the requested loan amount of ₹${requestedAmount}. We recommend proceeding with the application.`
      );
    }

    setShowChat(true);
  };

  const handleApply = () => {
    toast({
      title: "Application Submitted",
      description: "Your loan application is being processed. We'll notify you soon.",
    });

    setSelectedLoanType(null);
    setAmount("");
    setIncome("");
    setEmployment("");
    setShowChat(false);
    setRecommendation(null);
  };

  return (
    <div className="space-y-8">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-blue-600">Apply for a Loan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {showLoanChat ? (
            <LoanChat onClose={() => setShowLoanChat(false)} />
          ) : !selectedLoanType ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-4"
            >
              {Object.entries(loanTypes).map(([type, config]) => (
                <Button
                  key={type}
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto p-4 text-blue-600 hover:bg-blue-50"
                  onClick={() => setSelectedLoanType(type as LoanType)}
                >
                  {config.icon}
                  <span className="font-medium">{config.label}</span>
                  <span className="text-xs text-blue-400">
                    {config.description}
                  </span>
                </Button>
              ))}
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto p-4 text-blue-600 hover:bg-blue-50"
                onClick={() => setShowLoanChat(true)}
              >
                <MessageSquare className="h-6 w-6" />
                <span className="font-medium">Chat with AI Advisor</span>
                <span className="text-xs text-blue-400">
                  Get personalized loan recommendations
                </span>
              </Button>
            </motion.div>
          ) : showChat ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                  <p className="text-sm text-blue-900">{recommendation}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 text-blue-600"
                  onClick={() => setShowChat(false)}
                >
                  Adjust Details
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={handleApply}
                >
                  Proceed with Application
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-lg font-medium text-blue-600">
                {loanTypes[selectedLoanType].icon}
                <span>{loanTypes[selectedLoanType].label}</span>
              </div>
              <Input
                type="number"
                placeholder="Desired Loan Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border-blue-200 focus:border-blue-400"
              />
              <Input
                type="number"
                placeholder="Monthly Income"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="border-blue-200 focus:border-blue-400"
              />
              <Select
                value={employment}
                onValueChange={setEmployment}
              >
                <SelectTrigger className="border-blue-200">
                  <SelectValue placeholder="Employment Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salaried">Salaried</SelectItem>
                  <SelectItem value="self-employed">Self Employed</SelectItem>
                  <SelectItem value="business">Business Owner</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 text-blue-600"
                  onClick={() => setSelectedLoanType(null)}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={calculateRecommendation}
                >
                  <Calculator className="mr-2 h-4 w-4" />
                  Get Recommendation
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-600">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Approved Loans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">2</div>
            <p className="text-sm text-blue-400">Total value: ₹15,00,000</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-600">
              <XCircle className="h-5 w-5 text-red-500" />
              Denied Loans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">1</div>
            <p className="text-sm text-blue-400">Last attempt: 2 days ago</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-600">
              <Clock className="h-5 w-5 text-yellow-500" />
              Pending Loans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">1</div>
            <p className="text-sm text-blue-400">Under review: 1 application</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}