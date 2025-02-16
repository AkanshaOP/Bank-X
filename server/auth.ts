import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import express, { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

// Extend Express User Type
declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

// ✅ Function to Hash Password Securely
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// ✅ Function to Compare Hashed Passwords
async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  // Handle malformed stored passwords
  if (!stored || !stored.includes(".")) return false;
  
  const [hashed, salt] = stored.split(".");
  if (!hashed || !salt) return false;

  try {
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch {
    return false;
  }
}

// ✅ Function to Setup Authentication Middleware
export function setupAuth(app: Express) {
  // Secure Session Configuration
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
    store: storage.sessionStore,
  };

  // Express Middleware
  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // ✅ Passport Local Strategy for Authentication
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) return done(null, false, { message: "Invalid credentials" });
        
        const passwordMatch = await comparePasswords(password, user.password);
        if (!passwordMatch) return done(null, false, { message: "Invalid credentials" });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  // ✅ Serialize User (Save in Session)
  passport.serializeUser((user, done) => done(null, user.id));

  // ✅ Deserialize User (Retrieve from Session) - CRUCIAL MISSING PART
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUserById(id);
      if (!user) return done(null, false);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}