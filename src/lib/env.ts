/**
 * @file: env.ts
 * @description: Змінні середовища та їх валідація
 * @dependencies: zod
 * @created: 2024-12-19
 */

import { z } from "zod";

const envSchema = z.object({
  // NextAuth.js
  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),
  NEXTAUTH_SECRET: z.string().default("your-secret-key-here"),
  NEXTAUTH_URL: z.string().default("http://localhost:3000"),
  
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  
  // Database
  DATABASE_URL: z.string().optional(),
  
  // App
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export const env = envSchema.parse({
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "your-secret-key-here",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rlrmizycnruvtjxcccdt.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJscm1penljbnJ1dnRqeGNjY2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwODYwODMsImV4cCI6MjA3MDY2MjA4M30.zchhywDndZCXDsRql5iMHd_qQqXfwEhPk_1rl70sMTo',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJscm1penljbnJ1dnRqeGNjY2R0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA4NjA4MywiZXhwIjoyMDcwNjYyMDgzfQ.pMOM6Sl8gUCEj5eZtCZAdxRedPV3NTyqxRTrzmEbJJc',
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
});
