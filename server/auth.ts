import { RequestHandler } from "express";
import bcrypt from "bcryptjs";

// Usuários hardcoded para autenticação simples
const USERS = [
  { username: "admin", password: "@dm1n", role: "admin" },
  { username: "operador", password: "Oper4321", role: "operador" },
];

export async function authenticateUser(username: string, password: string) {
  const user = USERS.find((u) => u.username === username);
  
  if (!user) {
    return null;
  }

  // Comparação direta de senha (sem hash para simplicidade)
  if (user.password === password) {
    return { username: user.username, role: user.role };
  }

  return null;
}

export const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Não autenticado" });
  }
  next();
};

// Extender o tipo de Session
declare module "express-session" {
  interface SessionData {
    user?: {
      username: string;
      role: string;
    };
  }
}
