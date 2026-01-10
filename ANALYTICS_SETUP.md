# Google Analytics Setup Guide

## Step 1: Create Google Analytics Account

1. Go to https://analytics.google.com/
2. Sign in with your Google account
3. Click **"Start measuring"** or **"Admin"** (gear icon)
4. Click **"Create Property"**
5. Enter property details:
   - **Property name**: Durga Maa Mandir Website
   - **Reporting time zone**: Select your time zone (e.g., Asia/Kolkata)
   - **Currency**: INR - Indian Rupee

## Step 2: Set Up Web Data Stream

1. After creating property, click **"Add stream"**
2. Choose **"Web"**
3. Enter website details:
   - **Website URL**: Your production URL (or http://localhost:3001 for testing)
   - **Stream name**: Durga Maa Website
4. Click **"Create stream"**

## Step 3: Get Your Measurement ID

1. You'll see your **Measurement ID** at the top right
2. It looks like: **G-XXXXXXXXXX**
3. **Copy this ID**

## Step 4: Add Measurement ID to Your Project

1. Open or create file: `frontend/.env`
2. Add this line (replace with your actual ID):

```
REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Example:
```
REACT_APP_API_URL=http://localhost:8082/api
REACT_APP_GA_MEASUREMENT_ID=G-ABC123XYZ
```

## Step 5: Restart Frontend

After adding the Measurement ID:

```bash
cd frontend
npm start
```

## Step 6: Verify Tracking

1. Open your website: http://localhost:3001
2. Go to Google Analytics → **Reports** → **Realtime**
3. You should see yourself as an active user!
4. Navigate to different pages and see them tracked in real-time

---

## What Gets Tracked Automatically

✅ **Page Views**: Every page the user visits  
✅ **User Location**: Country, city  
✅ **Device Type**: Desktop, mobile, tablet  
✅ **Browser**: Chrome, Firefox, Safari, etc.  
✅ **Session Duration**: How long users stay  
✅ **Traffic Source**: Direct, search, referral  

---

## Custom Events Tracked

The following custom events are also tracked:

- **Donations Made**: `trackDonation(amount, donorName, category)`
- **Event Views**: `trackEventView(eventName, eventId)`
- **Contact Page Views**: `trackContactView()`
- **Admin Login**: `trackAdminLogin(userId)`
- **Service Bookings**: `trackServiceBooking(serviceName, amount)`

---

## Viewing Analytics

### Real-Time Reports
- Go to: **Reports** → **Realtime**
- See active users right now
- See which pages they're viewing

### Overview Reports
- Go to: **Reports** → **Life cycle** → **Acquisition** → **Overview**
- See daily/weekly/monthly visitors
- See top pages
- See user demographics

### Custom Reports
- Go to: **Explore** tab
- Create custom reports with specific metrics

---

## Important Notes

- Analytics data appears with a 24-48 hour delay (except Real-time)
- Real-time reports show data from the last 30 minutes
- Make sure to add your production domain to GA when you deploy
- Keep your Measurement ID secure (it's okay to expose in frontend)

---

## Troubleshooting

**Not seeing data in Real-time?**
- Check browser console for errors
- Verify Measurement ID is correct
- Disable ad blockers
- Check if script is loaded: Look for `gtag/js` in Network tab

**Still not working?**
- Clear browser cache
- Try incognito/private mode
- Check `.env` file has correct format
- Restart frontend server

---

## Production Deployment

When deploying to production:

1. Add your production domain in Google Analytics:
   - Go to **Admin** → **Data Streams**
   - Click your stream
   - Add production URL under **Website URL**

2. Set environment variable in production:
   - If using AWS/Heroku: Set `REACT_APP_GA_MEASUREMENT_ID`
   - If using S3: Add to build process

3. The same Measurement ID can be used for both dev and production
   - Or create separate GA properties for dev/staging/prod

---

## Need Help?

- Google Analytics Help: https://support.google.com/analytics/
- GA4 Documentation: https://developers.google.com/analytics/devguides/collection/ga4

