import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertTransactionSchema } from "@shared/schema";
import Anthropic from "@anthropic-ai/sdk";

interface AuthenticatedRequest extends Express.Request {
  user?: {
    id: number;
    fullName: string;
    balance: number;
  };
}

// ✅ Initialize Anthropic Client
const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
if (!anthropicApiKey || !anthropicApiKey.startsWith("sk-ant-")) {
  console.warn("⚠ Warning: Anthropic API key is missing or invalid.");
}

const anthropic = new Anthropic({ apiKey: anthropicApiKey! });

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // ✅ Fetch Transactions
  app.get("/api/transactions", async (req: AuthenticatedRequest, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const transactions = await storage.getUserTransactions(req.user.id);
      res.json(transactions);
    } catch (error) {
      console.error("Transaction Fetch Error:", error);
      res.status(500).json({ message: "Failed to retrieve transactions." });
    }
  });

  // ✅ Add New Transaction
  app.post("/api/transactions", async (req: AuthenticatedRequest, res) => {
    if (!req.user) return res.sendStatus(401);

    try {
      const transactionData = insertTransactionSchema.parse({
        ...req.body,
        userId: req.user.id,
        timestamp: new Date(),
      });

      const newBalance =
        req.user.balance +
        (transactionData.type === "credit"
          ? transactionData.amount
          : -transactionData.amount);

      if (newBalance < 0) {
        return res.status(400).json({ message: "Insufficient funds" });
      }

      const [transaction, user] = await Promise.all([
        storage.createTransaction(transactionData),
        storage.updateUserBalance(req.user.id, newBalance),
      ]);

      req.login(user, (err) => {
        if (err)
          return res.status(500).json({ message: "Session update failed" });
        res.status(201).json(transaction);
      });
    } catch (error) {
      console.error("Transaction Creation Error:", error);
      res.status(400).json({ message: "Invalid transaction data." });
    }
  });

  // ✅ AI Chat for Loan Inquiries
  app.post("/api/chat", async (req: AuthenticatedRequest, res) => {
    if (!req.user) return res.sendStatus(401);

    if (!anthropicApiKey) {
      return res.status(503).json({
        message:
          "AI chat service is not properly configured. Please contact support.",
      });
    }

    try {
      const { message } = req.body;

      const systemMessage = `You are Bank X's AI loan advisor. Your role is to help customers with loan-related queries and provide personalized advice. 

Customer: ${req.user.fullName}
Account Balance: $${(req.user.balance / 100).toFixed(2)}

### Focus Areas:
1️⃣ Loan eligibility, interest rates, and documentation
2️⃣ Step-by-step loan application guidance
3️⃣ Repayment schedules, EMI calculations, and prepayment benefits
4️⃣ Special government schemes and compliance details

Keep responses clear, professional, and user-friendly.`;

      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        system: systemMessage,
        messages: [{ role: "user", content: message }],
      });

      const aiResponse =
        response?.content?.[0]?.text ?? "Sorry, I couldn't process your request.";

      res.json({ message: aiResponse });
    } catch (error: any) {
      console.error("Chat API Error:", error);

      if (error.status === 401) {
        res.status(503).json({
          message: "AI service authentication failed. Please contact support.",
        });
      } else {
        res.status(500).json({
          message: "I'm having trouble processing your request right now. Try again later.",
        });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
