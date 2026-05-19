import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma.js";
import { logger } from "../utils/logger.js";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  storageLimit: number;
  usedStorage: number;
  createdAt: Date;
  updatedAt: Date;
};

const JWT_EXPIRES_IN = "1d";

const sanitizeUser = (user: any): SafeUser => {
  const { passwordHash, ...safe } = user;
  return safe as SafeUser;
};

export class AuthService {
  async register(user: RegisterInput): Promise<SafeUser> {
    try {
      logger.info("Register attempt", { email: user.email });

      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (existingUser) {
        logger.warn("Register failed. User already exists", {
          email: user.email,
        });
        throw new Error("User already exists");
      }

      const hashedPassword = await bcrypt.hash(user.password, 10);

      const newUser = await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          passwordHash: hashedPassword,
          storageLimit: 1024 * 1024 * 1024,
        },
      });

      logger.info("User registered successfully", { userId: newUser.id });

      return sanitizeUser(newUser);
    } catch (error) {
      logger.error("Registration error", { error });
      throw error;
    }
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ token: string; user: SafeUser }> {
    try {
      logger.info("Login attempt", { email });

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        logger.warn("Login failed. User not found", { email });
        throw new Error("Invalid credentials");
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);

      if (!isMatch) {
        logger.warn("Login failed. Wrong password", { email });
        throw new Error("Invalid credentials");
      }

      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });

      logger.info("Login successful", { userId: user.id });

      return { token, user: sanitizeUser(user) };
    } catch (error) {
      logger.error("Login error", { email, error });
      throw error;
    }
  }

  async getById(userId: string): Promise<SafeUser | null> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user ? sanitizeUser(user) : null;
  }
}
