import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { prisma } from "../prisma.js";
import { logger } from "../utils/logger.js";

export class AuthService {
  async register(user: User) {
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

      return newUser;
    } catch (error) {
      logger.error("Registration error", { error });
      throw error;
    }
  }

  async login(email: string, password: string) {
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

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
        expiresIn: "1d",
      });

      logger.info("Login successful", { userId: user.id });

      return { token , user };
    } catch (error) {
      logger.error("Login error", { email, error });
      throw error;
    }
  }
}
