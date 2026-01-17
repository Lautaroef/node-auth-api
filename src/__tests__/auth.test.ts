import request from "supertest";
import express from "express";
import authRoutes from "../routes/auth";
import { userService } from "../services/userService";
import { authService } from "../services/authService";

// Mock the services
jest.mock("../services/userService");
jest.mock("../services/authService");

const app = express();
app.use(express.json());
app.use("/auth", authRoutes);

// Setup environment variables for tests
process.env.JWT_SECRET = "test-secret-key";

describe("Auth Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /auth/register", () => {
    it("should register a new user successfully", async () => {
      // Mock service methods
      (userService.findUserByEmail as jest.Mock).mockResolvedValue(null);
      (authService.hashPassword as jest.Mock).mockResolvedValue("hashed_password");
      (userService.createUser as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post("/auth/register")
        .send({
          email: "test@example.com",
          password: "password123",
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: "User registered successfully" });
      expect(userService.findUserByEmail).toHaveBeenCalledWith("test@example.com");
      expect(authService.hashPassword).toHaveBeenCalledWith("password123");
      expect(userService.createUser).toHaveBeenCalledWith("test@example.com", "hashed_password");
    });

    it("should return 400 if email is missing", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({
          password: "password123",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Email and password are required" });
    });

    it("should return 400 if password is missing", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({
          email: "test@example.com",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Email and password are required" });
    });

    it("should return 400 if user already exists", async () => {
      (userService.findUserByEmail as jest.Mock).mockResolvedValue({
        id: "1",
        email: "test@example.com",
        password: "hashed",
        created_at: new Date(),
      });

      const response = await request(app)
        .post("/auth/register")
        .send({
          email: "test@example.com",
          password: "password123",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "User already exists" });
    });

    it("should return 500 on internal server error", async () => {
      (userService.findUserByEmail as jest.Mock).mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/auth/register")
        .send({
          email: "test@example.com",
          password: "password123",
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Internal server error" });
    });
  });

  describe("POST /auth/login", () => {
    it("should login successfully and return a token", async () => {
      const mockUser = {
        id: "123",
        email: "test@example.com",
        password: "hashed_password",
        created_at: new Date(),
      };

      (userService.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (authService.comparePassword as jest.Mock).mockResolvedValue(true);
      (authService.generateToken as jest.Mock).mockReturnValue("jwt_token_here");

      const response = await request(app)
        .post("/auth/login")
        .send({
          email: "test@example.com",
          password: "password123",
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ token: "jwt_token_here" });
      expect(userService.findUserByEmail).toHaveBeenCalledWith("test@example.com");
      expect(authService.comparePassword).toHaveBeenCalledWith("password123", "hashed_password");
      expect(authService.generateToken).toHaveBeenCalledWith("123");
    });

    it("should return 400 if email is missing", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          password: "password123",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Email and password are required" });
    });

    it("should return 400 if password is missing", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: "test@example.com",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Email and password are required" });
    });

    it("should return 401 if user does not exist", async () => {
      (userService.findUserByEmail as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post("/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "password123",
        });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: "Invalid credentials" });
    });

    it("should return 401 if password is incorrect", async () => {
      const mockUser = {
        id: "123",
        email: "test@example.com",
        password: "hashed_password",
        created_at: new Date(),
      };

      (userService.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (authService.comparePassword as jest.Mock).mockResolvedValue(false);

      const response = await request(app)
        .post("/auth/login")
        .send({
          email: "test@example.com",
          password: "wrongpassword",
        });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: "Invalid credentials" });
    });

    it("should return 500 on internal server error", async () => {
      (userService.findUserByEmail as jest.Mock).mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/auth/login")
        .send({
          email: "test@example.com",
          password: "password123",
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Internal server error" });
    });
  });
});
