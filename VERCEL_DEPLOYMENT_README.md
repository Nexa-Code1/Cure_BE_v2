# Vercel Deployment Guide

This guide explains how to deploy your Cure backend API to Vercel as serverless functions.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Your project pushed to GitHub, GitLab, or Bitbucket
3. MongoDB database (Atlas recommended for production)

## Environment Variables Setup

### 1. Copy Environment Variables

Copy the contents of `.env.example` and set up the following environment variables in your Vercel dashboard:

```bash
NODE_ENV=production
PORT=3000

# Database Configuration (MongoDB Atlas recommended)
DATABASE=mongodb+srv://your-username:your-password@cluster0.x9s4pjz.mongodb.net/your-database?appName=Cluster0&retryWrites=true&w=majority
DATABASE_URL=your-local-db-url
DATABASE_PASSWORD=your-database-password

# Email Configuration
EMAIL=your-email@gmail.com
EMAIL_PASSWORD=your-email-app-password

# JWT Configuration
JWT_SECRET_LOGIN=your-secure-jwt-secret-key
SALT=10

# Frontend URLs
FRONTEND_URL=https://your-frontend-domain.com
FRONTEND_DEFAULT_URL=http://localhost:5173

# Stripe Payment Configuration
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key

# Cloudinary Configuration (if used)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 2. Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project (or create a new one)
3. Go to Settings → Environment Variables
4. Add each environment variable from the list above

## Deployment Steps

### Option 1: Deploy via Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy your project:
```bash
vercel
```

4. Follow the prompts to configure your project

### Option 2: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Connect your Git repository
4. Vercel will automatically detect the configuration and deploy

## Project Structure Changes

The following changes have been made for Vercel deployment:

- `api/index.js`: Main serverless function entry point
- `vercel.json`: Vercel configuration for routing and build settings
- Updated `src/DB/connection.js`: Database connection caching for serverless
- Updated CORS configuration in `api/index.js` for production

## API Endpoints

Your API will be available at:
- Development: `http://localhost:3000`
- Production: `https://your-project-name.vercel.app`

All routes are prefixed with `/api/`:
- `/api/auth/*` - Authentication endpoints
- `/api/user/*` - User management
- `/api/doctor/*` - Doctor management
- `/api/review/*` - Review system
- `/api/favourite/*` - Favorites
- `/api/booking/*` - Booking system
- `/api/specialists/*` - Specialists
- `/api/payment/*` - Payment processing

## Testing Your Deployment

1. After deployment, note your production URL
2. Test your API endpoints using tools like Postman or curl
3. Verify database connections work
4. Test file uploads and static file serving

## Troubleshooting

### Common Issues:

1. **Database Connection Timeout**:
   - Ensure your MongoDB Atlas IP whitelist includes `0.0.0.0/0` (all IPs)
   - Check your connection string format

2. **Environment Variables Not Working**:
   - Redeploy after adding environment variables
   - Check variable names match exactly (case-sensitive)

3. **CORS Issues**:
   - Update `FRONTEND_URL` in environment variables
   - Add your frontend domain to the CORS origins array

4. **Function Timeout**:
   - Vercel has a 10-second timeout for serverless functions
   - Optimize database queries if needed
   - Consider upgrading to Vercel Pro for longer timeouts

## Monitoring

- Check Vercel dashboard for function logs and performance
- Monitor database usage in MongoDB Atlas
- Set up error tracking if needed

## Security Considerations

- Use strong, unique passwords for all services
- Regularly rotate API keys and secrets
- Enable 2FA on all accounts
- Monitor for unusual activity

## Support

If you encounter issues:
1. Check Vercel function logs in the dashboard
2. Verify environment variables are set correctly
3. Test locally with `npm run dev`
4. Check MongoDB Atlas connection status