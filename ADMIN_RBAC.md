# Admin RBAC System

This application now includes a complete Role-Based Access Control (RBAC) system with separate admin privileges.

## Features

✅ **Role-Based Authentication**
- Users have a `role` field (either "user" or "admin")
- Admin middleware protects admin-only routes
- Separate admin dashboard

✅ **Admin Dashboard**
- View and manage support tickets
- Filter tickets by status
- Assign tickets to yourself
- Add internal notes
- Resolve tickets with resolution notes
- Real-time statistics

## Creating an Admin User

### Option 1: Using the Script (Recommended)

```bash
cd backend
node createAdmin.js <email> <password> <name>
```

**Example:**
```bash
node createAdmin.js admin@shophub.com admin123 "Admin User"
```

### Option 2: Update Existing User

If you already have a user account, you can update it to admin role:

```bash
node createAdmin.js existing@email.com newpassword "Existing User"
```

The script will automatically upgrade the existing user to admin role.

## Admin Login Flow

1. **Login**: Use admin credentials at `/login`
2. **Auto-redirect**: Admins are automatically redirected to `/admin/dashboard`
3. **Navigation**: Admin users see an "Admin" link in the navbar with a shield icon
4. **Protection**: Admin dashboard checks user role and redirects non-admins

## Admin-Only Routes

Backend routes protected by `isAuthenticated` and `isAdmin` middleware:

- `GET /api/v2/tickets/admin/tickets` - List all tickets
- `GET /api/v2/tickets/admin/tickets/stats` - Get statistics
- `GET /api/v2/tickets/admin/tickets/:id` - Get ticket details
- `PUT /api/v2/tickets/admin/tickets/:id/status` - Update status
- `PUT /api/v2/tickets/admin/tickets/:id/assign` - Assign ticket
- `POST /api/v2/tickets/admin/tickets/:id/notes` - Add notes

## Testing the System

1. **Create an admin user:**
   ```bash
   cd backend
   node createAdmin.js admin@shophub.com admin123 "Admin User"
   ```

2. **Start the servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   node server.js

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

3. **Login as admin:**
   - Go to http://localhost:5173/login
   - Enter admin credentials
   - You'll be redirected to admin dashboard

4. **Test ticket creation:**
   - Logout (or use incognito mode)
   - Login as regular user
   - Use the chatbot
   - Type "I need human support" to escalate
   - Login as admin to see the ticket

## User Roles

### Regular User (`role: "user"`)
- Can browse products
- Can place orders
- Can use AI chatbot
- Can escalate to human support
- Cannot access admin dashboard

### Admin User (`role: "admin"`)
- All regular user permissions
- Access to admin dashboard
- Can view all support tickets
- Can assign and resolve tickets
- Can add internal notes
- Special "Admin" badge in navbar

## Security Features

✅ JWT-based authentication
✅ HTTP-only cookies
✅ Role-based middleware protection
✅ Frontend route guards
✅ Automatic redirect for unauthorized access

## API Response with Role

When users login, the API returns:

```json
{
  "success": true,
  "token": "jwt-token",
  "user": {
    "email": "user@example.com",
    "name": "User Name",
    "role": "admin" // or "user"
  }
}
```

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  role: String (default: "user"), // "user" or "admin"
  // ... other fields
}
```

### Ticket Model
```javascript
{
  ticketId: String,
  userId: ObjectId,
  email: String,
  reason: String,
  urgency: String, // "low", "medium", "high"
  status: String, // "open", "in-progress", "resolved", "closed"
  briefing: Object,
  assignedTo: ObjectId,
  resolution: String,
  notes: Array,
  // ... timestamps
}
```

## Troubleshooting

**Can't access admin dashboard?**
- Make sure you're logged in as admin
- Check Redux store has `role: "admin"`
- Clear cookies and login again

**Admin link not showing?**
- Verify user.role === "admin" in Redux store
- Check browser console for state

**Tickets not loading?**
- Ensure backend is running
- Check authentication cookies
- Verify admin middleware is working

## Next Steps

You can extend this system by:
- Adding more admin roles (super-admin, moderator)
- Email notifications for ticket updates
- Real-time ticket updates with WebSockets
- Advanced reporting and analytics
- Audit logs for admin actions
