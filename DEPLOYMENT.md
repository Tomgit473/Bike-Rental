# Deployment Guide

This project is split into a Vite client and an Express API. Deploy them separately or together behind a reverse proxy.

## Recommended Production Setup

- **Frontend:** Vercel, Netlify, Cloudflare Pages, or static hosting from `client/dist`
- **Backend:** Render, Railway, Fly.io, AWS ECS, Azure App Service, or a Node.js VPS
- **Database:** MongoDB Atlas
- **Images:** Cloudinary
- **Payments:** Stripe or Razorpay with webhooks
- **Email:** SMTP provider such as SendGrid, Amazon SES, Mailgun, or Zoho

## Backend Deployment

1. Create a production MongoDB Atlas database.
2. Set the backend environment variables:

```text
NODE_ENV=production
PORT=5000
MONGO_URI=<mongodb-atlas-uri>
JWT_SECRET=<long-random-secret>
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-client-domain.com
SERVER_URL=https://your-api-domain.com
CLOUDINARY_CLOUD_NAME=<value>
CLOUDINARY_API_KEY=<value>
CLOUDINARY_API_SECRET=<value>
STRIPE_SECRET_KEY=<value>
RAZORPAY_KEY_ID=<value>
RAZORPAY_KEY_SECRET=<value>
SMTP_HOST=<value>
SMTP_PORT=587
SMTP_USER=<value>
SMTP_PASS=<value>
SMTP_FROM="RideLoop <no-reply@your-domain.com>"
```

3. Install and start:

```bash
npm install --omit=dev
npm run start --workspace server
```

4. Confirm health:

```bash
curl https://your-api-domain.com/api/health
```

## Frontend Deployment

1. Set client env vars:

```text
VITE_API_URL=https://your-api-domain.com/api
VITE_GOOGLE_MAPS_API_KEY=<optional>
VITE_MAPBOX_TOKEN=<optional>
VITE_STRIPE_PUBLIC_KEY=<optional>
VITE_RAZORPAY_KEY_ID=<optional>
```

2. Build:

```bash
npm run build --workspace client
```

3. Deploy `client/dist`.

4. Configure SPA fallback so all routes return `index.html`.

## Reverse Proxy Option

If serving client and API from one domain, route `/api/*` and Socket.IO traffic to the Node server, and serve `client/dist` for all other paths.

Example Nginx sketch:

```nginx
location /api/ {
  proxy_pass http://127.0.0.1:5000/api/;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
}

location /socket.io/ {
  proxy_pass http://127.0.0.1:5000/socket.io/;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
}

location / {
  root /var/www/rideloop/client/dist;
  try_files $uri /index.html;
}
```

## Payment Webhooks

The app includes checkout creation and payment confirmation routes. Before accepting real money, add provider webhook endpoints that verify signatures and update `Payment` and `Booking` records server-side. Keep client-side confirmation only as a convenience, not the source of truth.

## Security Checklist

- Enable HTTPS everywhere.
- Restrict CORS to the production client domain.
- Store secrets in platform secret managers.
- Keep admin role assignment out of public registration.
- Add rate limits to OTP, password reset, and login endpoints.
- Use payment webhooks for final payment state.
- Add audit logs for admin moderation, refunds, and dispute handling.
- Run dependency scanning in CI.
