import { pool } from "../db";
import { User } from "../models/user";

export class UserService {
  /**
   * Create a new user in the database
   */
  async createUser(email: string, hashedPassword: string): Promise<void> {
    await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2)",
      [email, hashedPassword]
    );
  }

  /**
   * Find a user by email
   */
  async findUserByEmail(email: string): Promise<User | null> {
    const result = await pool.query<User>(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    return result.rows[0] || null;
  }

  /**
   * Find a user by ID (without password)
   */
  async findUserById(userId: string): Promise<Omit<User, "password"> | null> {
    const result = await pool.query<Omit<User, "password">>(
      "SELECT id, email, created_at FROM users WHERE id = $1",
      [userId]
    );
    return result.rows[0] || null;
  }

  /**
   * Check if a user with the given email already exists
   */
  async userExists(email: string): Promise<boolean> {
    const user = await this.findUserByEmail(email);
    return user !== null;
  }
}

export const userService = new UserService();
