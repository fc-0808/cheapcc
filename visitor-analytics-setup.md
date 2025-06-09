# Visitor Analytics Setup

This document explains how to set up the visitor tracking system to monitor your website's traffic and distinguish between real users and bots.

## Components

1. **Database Table**: A new Supabase table called `visitor_logs` to store visitor data
2. **API Endpoint**: A serverless function at `/api/log-visitor` to record visits
3. **Middleware Integration**: Updated middleware to capture data for all site requests
4. **Admin Dashboard**: A protected page at `/admin/visitors` to view traffic data

## Setup Instructions

### 1. Create the Database Table

1. Go to your Supabase dashboard and navigate to the SQL Editor
2. Copy the contents of the `visitor_logs_table.sql` file
3. Run the SQL script to create the table and set up appropriate permissions

### 2. Configure Environment Variables

Add the following variables to your `.env.local` file for development and to your production environment:

```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-supabase-dashboard
ADMIN_EMAIL=your-admin-email@example.com
```

- The `SUPABASE_SERVICE_ROLE_KEY` can be found in your Supabase dashboard under Project Settings > API
- The `ADMIN_EMAIL` should be set to your admin email address to restrict access to the analytics page

### 3. Deploy or Restart Your Application

After making these changes, deploy your application or restart your development server.

## How It Works

1. **Middleware Capture**: For almost every request to your site, the middleware grabs key details like IP address, user agent, and path.
2. **Asynchronous Logging**: The middleware sends this data to the `/api/log-visitor` endpoint without waiting for a response, ensuring site performance is not affected.
3. **Bot Detection**: The API route checks the visitor's `User-Agent` string against common bot patterns.
4. **Admin-Only Access**: The dashboard at `/admin/visitors` is secured so only you can access it.

## Accessing the Analytics

Simply navigate to `/admin/visitors` while logged in with your admin account to view the visitor logs. The page will show:

- Timestamp of each visit
- IP address
- Page path
- User agent
- Whether the visitor was authenticated
- Bot detection result

## Limitations

- The bot detection is based on simple pattern matching of user agents, which can be spoofed
- The system doesn't track client-side interactions or time spent on page
- IP addresses are stored in plain text - consider pseudonymization for GDPR compliance

## Extending the System

You could enhance this basic system with:

1. More sophisticated bot detection using browser fingerprinting
2. Geographic location data based on IP addresses
3. Session tracking to group requests from the same visitor
4. Traffic visualization with charts and graphs
