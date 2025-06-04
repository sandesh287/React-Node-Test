# React & Node.js Skill Test

## Estimated Time

- 60 min

## Requirements

- Bug fix to login without any issues (20min) <br/>
  There is no need to change or add login function.
  Interpret the code structure and set the correct environment by the experience of building projects. <br/>
  Here is a login information. <br/>
  ✓ email: admin@gmail.com  ✓ password: admin123

- Implement Restful API of "Meeting" in the both of server and client sides (40min)<br/>
  Focus Code Style and Code Optimization. <br/>
  Reference other functions.

## Environment Setup

This project requires environment variables to be set up in both the Client and Server directories.

### Client Setup
1. Navigate to the Client directory
2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
3. Update the `.env` file with your configuration:
   - `REACT_APP_BASE_URL`: Your API base URL (default: http://localhost:5000/)

### Server Setup
1. Navigate to the Server directory
2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
3. Update the `.env` file with your configuration:
   - `PORT`: Server port (default: 5000)
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Secret key for JWT token generation

**Note:** Never commit the actual `.env` files to the repository. They contain sensitive information and are automatically ignored by git.