# Express Server Boilerplate

A robust Express.js server boilerplate with error handling and basic API structure.

## Features

- Express.js server setup
- CORS configuration
- API routing
- Error handling middleware
- Environment variable configuration

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example`
4. Start the development server:
   ```
   npm run dev
   ```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot-reload

## API Endpoints

- `GET /` - Basic server health check
- `GET /api/health` - API health check endpoint

## Adding New Routes

Create route modules in a `routes` directory and import them in `index.js`:

```javascript
const userRoutes = require("./routes/users");
apiRoutes.use("/users", userRoutes);
```
