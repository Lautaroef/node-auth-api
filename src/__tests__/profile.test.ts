import request from "supertest";
import express from "express";
import profileRoutes from "../routes/profile";
import { userService } from "../services/userService";
import jwt from "jsonwebtoken";

// Mock the services
jest.mock("../services/userService");

const app = express();
app.use(express.json());
app.use("/", profileRoutes);

// Setup environment variables for tests
process.env.JWT_SECRET = "test-secret-key";

describe("Profile Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /profile", () => {
    it("should return user profile when authenticated", async () => {
      const mockUser = {
        id: "123",
        email: "test@example.com",
        created_at: new Date("2024-01-01"),
      };

      (userService.findUserById as jest.Mock).mockResolvedValue(mockUser);

      // Generate a valid JWT token for testing
      const token = jwt.sign({ id: "123" }, process.env.JWT_SECRET!);

      const response = await request(app)
        .get("/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockUser,
        created_at: mockUser.created_at.toISOString(),
      });
      expect(userService.findUserById).toHaveBeenCalledWith("123");
    });

    it("should return 401 if no token provided", async () => {
      const response = await request(app).get("/profile");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: "No token provided" });
    });

    it("should return 401 if token is invalid", async () => {
      const response = await request(app)
        .get("/profile")
        .set("Authorization", "Bearer invalid_token");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: "Invalid token" });
    });

    it("should accept token without Bearer prefix", async () => {
      const mockUser = {
        id: "123",
        email: "test@example.com",
        created_at: new Date("2024-01-01"),
      };

      (userService.findUserById as jest.Mock).mockResolvedValue(mockUser);

      const token = jwt.sign({ id: "123" }, process.env.JWT_SECRET!);

      const response = await request(app)
        .get("/profile")
        .set("Authorization", token);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockUser,
        created_at: mockUser.created_at.toISOString(),
      });
    });

    it("should return 404 if user not found", async () => {
      (userService.findUserById as jest.Mock).mockResolvedValue(null);

      const token = jwt.sign({ id: "999" }, process.env.JWT_SECRET!);

      const response = await request(app)
        .get("/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "User not found" });
    });

    it("should return 500 on internal server error", async () => {
      (userService.findUserById as jest.Mock).mockRejectedValue(new Error("Database error"));

      const token = jwt.sign({ id: "123" }, process.env.JWT_SECRET!);

      const response = await request(app)
        .get("/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Internal server error" });
    });
  });
});
