# 📊 AI Feedback Analytics System

## Overview
A complete feedback collection and analytics system for your AI chatbot that helps you continuously improve AI responses based on real user feedback.

## ✨ Features Implemented

### 1. **Thumbs Up/Down Feedback**
- ✅ Visual feedback buttons on every AI response
- ✅ Instant UI feedback (green for helpful, red for not helpful)
- ✅ Automatic categorization of feedback
- ✅ Stores question, answer, and user context

### 2. **Database Storage**
- ✅ MongoDB Feedback model with indexes
- ✅ Tracks: feedback type, category, user, timestamp
- ✅ Auto-categorization into 8 categories:
  - Shipping
  - Returns
  - Orders
  - Payment
  - Products
  - Account
  - Pricing
  - Support
  - General

### 3. **Analytics Dashboard**
- ✅ Real-time satisfaction metrics
- ✅ Performance breakdown by category
- ✅ Recent negative feedback review section
- ✅ Filterable by date range and category
- ✅ CSV export functionality

## 🚀 How to Access

### User Side (Chatbot)
- Users see thumbs up/down buttons below each AI response
- One click to provide feedback
- Feedback automatically saved to database

### Admin Side (Dashboard)
1. Navigate to **Admin Dashboard**: `/admin/dashboard`
2. Click **"AI Feedback Analytics"** button
3. Or go directly to: `/admin/feedback`

## 📈 Dashboard Metrics

### Summary Cards
- **Total Feedback**: All feedback received
- **Positive Count**: Total thumbs up
- **Negative Count**: Total thumbs down
- **Satisfaction Rate**: Percentage of positive feedback

### Category Performance
- Visual progress bars for each category
- Satisfaction rate per category
- Positive/negative counts
- Helps identify weak areas

### Recent Negative Feedback
- Last 10 negative feedback items
- Shows question and AI answer
- Categorized for easy action
- Priority review section

## 🔧 API Endpoints

### Submit Feedback
```javascript
POST /api/v2/chat/feedback
Body: {
  messageIndex: number,
  feedbackType: 'up' | 'down',
  threadId: string (optional),
  question: string (optional),
  answer: string (optional),
  userEmail: string (optional)
}
```

### Get Analytics
```javascript
GET /api/v2/chat/feedback/analytics
Query params:
  - startDate: ISO date string
  - endDate: ISO date string
  - category: string
```

### Get Feedback List
```javascript
GET /api/v2/chat/feedback/list
Query params:
  - page: number (default: 1)
  - limit: number (default: 20)
  - feedbackType: 'up' | 'down' | 'all'
  - category: string | 'all'
```

## 💡 How to Use This Data

### Weekly Review Process
1. **Check Satisfaction Rate**
   - Target: >80% positive feedback
   - If below 70%, immediate action needed

2. **Review Negative Feedback**
   - Read recent negative feedback in dashboard
   - Identify patterns or common issues
   - Note missing information in AI responses

3. **Update Knowledge Base**
   - Add missing information to `/backend/uploads/`
   - Clarify ambiguous policies
   - Add examples for common questions

4. **Re-ingest Documents**
   ```bash
   cd backend
   npm run ingest
   ```

### Monthly Analytics
- Export CSV data
- Track satisfaction trends over time
- Compare category performance
- Set improvement goals

### Continuous Improvement Loop
```
User Feedback → Identify Issues → Update Docs → Re-ingest → Monitor Results
```

## 📊 Categories Explained

| Category | Auto-detected Keywords |
|----------|------------------------|
| **Shipping** | ship, deliver, track, freight, postal |
| **Returns** | return, refund, exchange, money back |
| **Orders** | order, purchase, buy, cart, checkout |
| **Payment** | payment, pay, credit, card, invoice |
| **Products** | product, item, quality, description |
| **Account** | account, login, password, profile |
| **Pricing** | price, cost, discount, coupon, promo |
| **Support** | support, help, contact, service |
| **General** | Everything else |

## 🎯 Success Metrics

### Excellent Performance
- 80%+ satisfaction rate
- <5% negative feedback in any category
- Declining trend in negative feedback

### Good Performance
- 60-80% satisfaction rate
- 5-15% negative feedback
- Stable metrics over time

### Needs Improvement
- <60% satisfaction rate
- >15% negative feedback
- Increasing negative trend

## 🔐 Security & Privacy

- Feedback is anonymous unless user is logged in
- User emails only stored if available
- No sensitive customer data in feedback
- Admin-only access to dashboard

## 🚀 Future Enhancements

Potential additions:
- Email alerts for negative feedback spike
- A/B testing different AI prompts
- Sentiment analysis integration
- Custom feedback categories
- User feedback comments (optional text)
- Slack/Discord notifications for admins

## 📝 Files Modified/Created

### Backend
- ✅ `/backend/model/feedback.js` - Database model
- ✅ `/backend/ai/routes/chat.js` - API endpoints

### Frontend
- ✅ `/frontend/src/pages/FeedbackDashboard.jsx` - Admin dashboard
- ✅ `/frontend/src/features/ai/components/ChatbotStreaming.jsx` - Feedback buttons
- ✅ `/frontend/src/features/ai/components/Chatbot.jsx` - Feedback buttons
- ✅ `/frontend/src/Routes.jsx` - Route configuration
- ✅ `/frontend/src/App.jsx` - App routing
- ✅ `/frontend/src/pages/AdminDashboard.jsx` - Navigation link

## 🎉 You're All Set!

Your AI chatbot now has a complete feedback and analytics system. Start collecting data and watch your AI improve over time!

---

**Questions?** Check the code comments or examine the dashboard for insights.
