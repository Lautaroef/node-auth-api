# Bug Report & Fixes

This document outlines the bugs found in the codebase and the solutions applied.

---

## Bugs Identified and Fixed

### 1. Missing `await` in Password Comparison

**Location:** `src/routes/auth.ts:32`

**Bug Description:**
The `bcrypt.compare()` function is asynchronous and returns a Promise. The code was missing the `await` keyword, which caused the function to always return a truthy Promise object instead of the actual boolean comparison result.

**Original Code:**
```typescript
const isValid = bcrypt.compare(password, user.password);
if (!isValid) return res.status(401).json({ error: "Invalid credentials" });
```

**Impact:**
Login would always fail because the condition `if (!isValid)` would never be true (a Promise object is truthy).

**Fix Applied:**
```typescript
const isValid = await bcrypt.compare(password, user.password);
if (!isValid) return res.status(401).json({ error: "Invalid credentials" });
```

**How I Found It:**
- TypeScript would have shown a type warning if strict checking was fully enabled
- Testing the login endpoint would immediately reveal this bug
- Code review of async operations

---

### 2. Typo in Environment Variable Name

**Location:** `src/routes/auth.ts:35`

**Bug Description:**
The JWT secret environment variable was misspelled as `JWT_SECERT` instead of `JWT_SECRET`.

**Original Code:**
```typescript
const token = jwt.sign({ id: user.id }, process.env.JWT_SECERT!, {
  expiresIn: "1h",
});
```

**Impact:**
JWT token generation would fail or use `undefined` as the secret, causing authentication to fail completely.

**Fix Applied:**
```typescript
const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
  expiresIn: "1h",
});
```

**How I Found It:**
- Simple typo spotted during code review
- Would cause runtime errors when testing login
- Environment variable name inconsistency

---

### 3. Non-Standard Authorization Header Name

**Location:** `src/middleware/authMiddleware.ts:9`

**Bug Description:**
The middleware was looking for a custom header `authorization-token` instead of the standard `Authorization` header with Bearer token format.

**Original Code:**
```typescript
const token = req.headers["authorization-token"];
if (!token) return res.status(401).json({ error: "No token provided" });
```

**Impact:**
- API clients using standard `Authorization: Bearer <token>` format would fail
- Incompatible with most HTTP clients and API testing tools
- Poor adherence to REST API standards

**Fix Applied:**
```typescript
const authHeader = req.headers.authorization;
if (!authHeader) return res.status(401).json({ error: "No token provided" });

const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
```

**How I Found It:**
- Knowledge of HTTP authentication standards
- Comparison with industry best practices
- Would be discovered when testing with standard API clients like Postman

---

### 4. Wrong Column Name in Profile Query

**Location:** `src/routes/profile.ts:10`

**Bug Description:**
The SQL query used `user_id` as the column name, but the database schema defines the primary key as `id`.

**Original Code:**
```typescript
const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [userId]);
```

**Impact:**
Profile endpoint would always return no results, causing a 500 error or returning `undefined`.

**Fix Applied:**
```typescript
const result = await pool.query("SELECT id, email, created_at FROM users WHERE id = $1", [userId]);
```

**How I Found It:**
- Cross-referenced the SQL migration file `001_create_users.sql`
- The migration shows the primary key is `id`, not `user_id`
- Database schema analysis

**Additional Improvement:**
Also changed from `SELECT *` to explicitly selecting only non-sensitive fields (excluding password).

---

### 5. User Model Field Mismatch

**Location:** `src/models/user.ts`

**Bug Description:**
The User type defined `username: string` but the database schema and all routes use `email` instead.

**Original Code:**
```typescript
export type User = {
  id: string;
  username: string;
  password: string;
  created_at: Date;
};
```

**Impact:**
Type safety would be compromised, leading to potential TypeScript errors or incorrect assumptions about the data structure.

**Fix Applied:**
```typescript
export type User = {
  id: string;
  email: string;
  password: string;
  created_at: Date;
};
```

**How I Found It:**
- Compared type definition with database schema
- Checked route handlers to see which field was actually being used
- Schema consistency check

---

## Architecture Improvements

In addition to fixing bugs, the codebase was refactored to follow a proper MVC architecture:

### Changes Made:

1. **Created Services Layer** (`src/services/`)
   - `authService.ts` - Handles authentication logic (password hashing, JWT generation)
   - `userService.ts` - Handles user data operations (CRUD for users)

2. **Created Controllers Layer** (`src/controllers/`)
   - `authController.ts` - Handles HTTP requests/responses for authentication
   - `profileController.ts` - Handles HTTP requests/responses for profile

3. **Simplified Routes** (`src/routes/`)
   - Routes now only define endpoints and delegate to controllers
   - Clean separation of concerns

4. **Added Type Safety**
   - Created `src/types/express.d.ts` to properly type the Express Request object
   - Better TypeScript support throughout

5. **Environment Configuration**
   - Added `.env.example` with all required environment variables

---

## Testing Approach

### How I Debugged:
1. **Static Analysis** - Read through the code to identify logical errors
2. **Schema Comparison** - Cross-referenced database schema with queries
3. **Type Checking** - Verified TypeScript types match actual usage
4. **Standards Review** - Checked against REST API and Node.js best practices

### Testing Strategy:
- Unit tests for services (business logic)
- Integration tests for controllers (request/response handling)
- End-to-end tests for complete user flows (register → login → profile)

---

## Lessons Learned

1. **Always `await` async functions** - Missing `await` is a common bug in async/await code
2. **Use standard HTTP headers** - Following standards makes APIs more compatible
3. **Match types with schema** - Keep TypeScript types synchronized with database schema
4. **Explicit field selection** - Use `SELECT field1, field2` instead of `SELECT *` to avoid exposing sensitive data
5. **Separation of concerns** - Controllers and services make code more maintainable and testable
