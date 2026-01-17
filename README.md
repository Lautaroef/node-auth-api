# Node.js Authentication API

A robust authentication API built with Node.js, TypeScript, Express, PostgreSQL, and JWT. This project demonstrates clean architecture with a proper separation of concerns using controllers and services.

## Features

- User registration and login with JWT authentication
- Password hashing with bcrypt
- Protected routes with JWT middleware
- PostgreSQL database
- TypeScript for type safety
- Controllers and Services architecture
- Comprehensive unit tests with Jest
- Docker support for easy deployment

## Tech Stack

- **Node.js** - Runtime environment
- **TypeScript** - Type safety and better dx
- **Express** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Jest** - Testing framework
- **Docker** - Containerization

## Project Structure

```
src/
├── controllers/       # HTTP request handlers
│   ├── authController.ts
│   └── profileController.ts
├── services/          # Business logic
│   ├── authService.ts
│   └── userService.ts
├── routes/            # Route definitions
│   ├── auth.ts
│   └── profile.ts
├── middleware/        # Express middleware
│   └── authMiddleware.ts
├── models/            # TypeScript types
│   └── user.ts
├── types/             # Type declarations
│   └── express.d.ts
├── migrations/        # Database migrations
│   └── 001_create_users.sql
├── __tests__/         # Unit tests
│   ├── auth.test.ts
│   └── profile.test.ts
├── db.ts              # Database connection
└── index.ts           # Application entry point
```

## Prerequisites

- Node.js 20.x or higher
- PostgreSQL 15.x or higher
- npm or yarn

## Setup Instructions

### Option 1: Local Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dir
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your configuration:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/directory_db
   JWT_SECRET=your-super-secret-jwt-key
   PORT=4000
   ```

4. **Create the PostgreSQL database**
   ```bash
   createdb directory_db
   ```

   Or using psql:
   ```sql
   CREATE DATABASE directory_db;
   ```

5. **Run database migrations**
   ```bash
   npm run migrate
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:4000`

### Option 2: Docker Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd directory
   ```

2. **Start the application with Docker Compose**
   ```bash
   docker-compose up -d
   ```

   This will:
   - Start a PostgreSQL container
   - Build and start the Node.js application
   - Run migrations automatically
   - Expose the API on `http://localhost:4000`

3. **View logs**
   ```bash
   docker-compose logs -f app
   ```

4. **Stop the application**
   ```bash
   docker-compose down
   ```

## API Endpoints

### Authentication

#### Register a new user
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User registered successfully"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Profile

#### Get user profile (Protected)
```http
GET /profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

## Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Generate coverage report:
```bash
npm run test:coverage
```

## Building for Production

1. **Build the TypeScript code**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm test` - Run tests
- `npm run migrate` - Run database migrations

## Architecture

This project follows a clean architecture pattern:

- **Routes**: Define API endpoints and delegate to controllers
- **Controllers**: Handle HTTP requests/responses and input validation
- **Services**: Contain business logic and data operations
- **Models**: Define TypeScript types for data structures
- **Middleware**: Handle cross-cutting concerns like authentication

## Security

- Passwords are hashed using bcrypt before storage
- JWT tokens expire after 1 hour
- Protected routes require valid JWT authentication
- SQL injection prevention via parameterized queries
- Environment variables for sensitive configuration

## License

MIT
