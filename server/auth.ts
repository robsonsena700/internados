import { RequestHandler } from "express";
import bcrypt from "bcryptjs";

// Usuários obtidos via variáveis de ambiente para maior segurança
// NOTA: Em produção, as senhas devem ser armazenadas como hashes Bcrypt no banco de dados.
// Aqui usamos hashes Bcrypt para validar a autenticação de forma segura.
const ADMIN_HASH = process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync(process.env.ADMIN_PASSWORD || "@dm1n", 10);
const OPERADOR_HASH = process.env.OPERADOR_PASSWORD_HASH || bcrypt.hashSync(process.env.OPERADOR_PASSWORD || "Oper4321", 10);

const USERS = [
  { 
    username: process.env.ADMIN_USERNAME || "admin", 
    passwordHash: ADMIN_HASH, 
    role: "admin" 
  },
  { 
    username: process.env.OPERADOR_USERNAME || "operador", 
    passwordHash: OPERADOR_HASH, 
    role: "operador" 
  },
];

export async function authenticateUser(username: string, password: string) {
  const user = USERS.find((u) => u.username === username);
  
  if (!user) {
    return null;
  }

  // Comparação segura usando Bcrypt
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (isValid) {
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
