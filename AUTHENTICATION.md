# Authentication System Documentation

## Overview

This application now includes a complete, database-backed authentication system that integrates both the Django backend and Next.js frontend. Users can register, log in, and have their sessions authenticated for protected routes.

## Backend Authentication (Django)

### Features
- **User Registration**: Create new user accounts with username, email, password, and optional first/last name
- **User Login**: Authenticate users with username/password
- **Token-based Authentication**: Uses Django REST Framework Token Authentication
- **User Logout**: Invalidate user tokens on logout
- **Protected API Endpoints**: All data analysis APIs require authentication
- **User Data Isolation**: Each user can only access their own datasets and analyses

### API Endpoints

#### Authentication Endpoints
- `POST /api/auth/signup/` - Register a new user
- `POST /api/auth/signin/` - Authenticate and get token
- `POST /api/auth/signout/` - Logout and invalidate token
- `GET /api/auth/profile/` - Get current user profile

#### Example Usage

**Register a new user:**
```bash
curl -X POST http://localhost:8000/api/auth/signup/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "user@example.com",
    "password": "securepassword123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/signin/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "securepassword123"
  }'
```

**Access protected endpoints:**
```bash
curl -X GET http://localhost:8000/api/datasets/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"
```

### Protected Data Endpoints
All analytics endpoints now require authentication:
- `GET /api/datasets/` - List user's datasets
- `POST /api/datasets/` - Upload new dataset
- `GET /api/datasets/{id}/preview/` - Preview dataset
- `POST /api/analyses/` - Create analysis
- `GET /api/analyses/` - List user's analyses
- `POST /api/visualizations/` - Create visualization

## Frontend Authentication (Next.js/React)

### Features
- **Authentication Context**: Global state management for user authentication
- **Login/Signup Pages**: Complete UI for user registration and login
- **Protected Routes**: Dashboard and analysis features require authentication
- **Token Management**: Automatic token storage and inclusion in API requests
- **User Session Persistence**: Maintains login state across browser sessions
- **Automatic Logout**: Handles token expiration and logout

### Key Components

#### Authentication Context (`src/contexts/AuthContext.tsx`)
Provides global authentication state management:
```tsx
const { user, isAuthenticated, isLoading, login, logout } = useAuth();
```

#### Authentication Utilities (`src/lib/auth.ts`)
Core authentication functions:
- `signup(data)` - Register new user
- `login(data)` - Authenticate user
- `logout()` - Logout user
- `getToken()` - Get stored auth token
- `isAuthenticated()` - Check auth status

#### Pages
- `/login` - User login page
- `/signup` - User registration page
- `/dashboard` - Protected dashboard (requires authentication)
- `/` - Public landing page with conditional navigation

#### Components
- `AuthGuard` - Protect components/routes that require authentication
- `Navigation` - Shows different options for authenticated/unauthenticated users
- `ClientLayout` - Wraps app with authentication provider

### Usage Examples

**Protect a component:**
```tsx
import { AuthGuard } from '@/components/AuthGuard';

function ProtectedComponent() {
  return (
    <AuthGuard>
      <div>This content requires authentication</div>
    </AuthGuard>
  );
}
```

**Use authentication in component:**
```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      Welcome, {user?.first_name}!
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

**Make authenticated API calls:**
```tsx
import { getToken } from '@/lib/auth';

async function fetchUserData() {
  const token = getToken();
  const response = await fetch('/api/data', {
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response.json();
}
```

## Security Features

### Backend Security
- **Password Validation**: Django's built-in password validators
- **Token Authentication**: Secure token-based authentication
- **CORS Protection**: Configured for frontend domain only
- **User Data Isolation**: Queries filtered by authenticated user
- **Input Validation**: Request data validation and sanitization

### Frontend Security
- **Secure Token Storage**: LocalStorage with proper cleanup
- **Route Protection**: Automatic redirects for unauthenticated users
- **Token Inclusion**: Automatic token inclusion in API requests
- **Session Management**: Proper logout and session cleanup

## Development Workflow

### Testing Authentication

1. **Start the servers:**
   ```bash
   npm run dev  # In project root
   # or
   concurrently "npm run dev" "cd backend && python manage.py runserver"
   ```

2. **Test registration:**
   - Navigate to `http://localhost:3000/signup`
   - Create a new account
   - Should automatically log in and redirect to dashboard

3. **Test login:**
   - Navigate to `http://localhost:3000/login`
   - Login with existing credentials
   - Should redirect to dashboard

4. **Test protected routes:**
   - Try accessing `/dashboard` without authentication
   - Should redirect to login page

### Database Management

**Create a superuser:**
```bash
cd backend
python manage.py createsuperuser
```

**Access admin panel:**
Visit `http://localhost:8000/admin/` to manage users and tokens.

**Reset database (if needed):**
```bash
cd backend
rm db.sqlite3
python manage.py migrate
```

## Troubleshooting

### Common Issues

1. **"No changes detected" during migrations:**
   - This is normal if no model changes were made
   - Authentication uses Django's built-in User model

2. **CORS errors:**
   - Ensure Django backend is running on port 8000
   - Check `CORS_ALLOWED_ORIGINS` in Django settings

3. **Token authentication not working:**
   - Verify token format: `Token YOUR_TOKEN_HERE`
   - Check that `rest_framework.authtoken` is in `INSTALLED_APPS`

4. **Frontend auth state not persisting:**
   - Check browser's LocalStorage for auth_token
   - Ensure AuthProvider wraps the entire app

### API Testing

**Test signup endpoint:**
```bash
curl -X POST http://localhost:8000/api/auth/signup/ \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"testpass123"}'
```

**Test login endpoint:**
```bash
curl -X POST http://localhost:8000/api/auth/signin/ \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"testpass123"}'
```

## Next Steps

### Enhancements
- **Password Reset**: Email-based password reset flow
- **Email Verification**: Verify user email addresses
- **Social Login**: Google/GitHub OAuth integration
- **Role-based Permissions**: Different user roles and permissions
- **Account Management**: User profile editing, password change
- **Session Timeout**: Automatic logout after inactivity

### Security Improvements
- **Rate Limiting**: Prevent brute force attacks
- **Two-Factor Authentication**: Additional security layer
- **Secure Headers**: Additional security headers
- **Input Sanitization**: Enhanced XSS protection
- **Password Strength**: Stronger password requirements

The authentication system is now fully functional and ready for production use!
