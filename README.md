# My App - Next.js with Google OAuth Authentication

A modern Next.js application featuring Google OAuth 2.0 authentication, user management, and a clean Material-UI interface.

## 🚀 Features

- **Google OAuth 2.0 Authentication** - Secure sign-in with Google accounts
- **User Management** - Automatic user creation/updates in backend database
- **Material-UI Design** - Modern, responsive user interface
- **Real-time User Directory** - View all registered users
- **Session Management** - Persistent authentication with NextAuth.js
- **TypeScript Support** - Full type safety throughout the application

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Authentication**: NextAuth.js v4
- **UI Framework**: Material-UI (MUI) v7
- **Styling**: Emotion (CSS-in-JS)
- **Backend Integration**: RESTful API calls

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Cloud Console account
- Backend API running on `http://localhost:3000`

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   
   # Google OAuth credentials (from Google Cloud Console)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

4. **Configure Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
   - Copy Client ID and Client Secret to `.env.local`

## 🚀 Getting Started

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

3. **Sign in with Google**
   - Click "Sign in with Google"
   - Complete OAuth flow
   - User will be automatically synced to your backend

## 📁 Project Structure

```
my-app/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts          # NextAuth configuration
│   ├── components/
│   │   └── UsersList.tsx             # User directory component
│   ├── lib/
│   │   └── url-constants.ts          # API endpoint constants
│   ├── auth-provider.tsx             # Session provider wrapper
│   ├── layout.tsx                    # Root layout with providers
│   ├── page.tsx                      # Home page with auth UI
│   ├── registry.tsx                  # Emotion registry for SSR
│   └── theme-provider.tsx            # MUI theme provider
├── public/                           # Static assets
├── .env.local                        # Environment variables
├── package.json
└── README.md
```

## 🔐 Authentication Flow

1. **User clicks "Sign in with Google"**
2. **Redirected to Google OAuth consent screen**
3. **User grants permissions**
4. **Google redirects back with authorization code**
5. **NextAuth exchanges code for access token**
6. **User profile fetched from Google**
7. **User automatically synced to backend API**
8. **Session established and user signed in**

## 🔌 Backend Integration

The app automatically syncs users with your backend API:

**Endpoint**: `POST http://localhost:3000/users`

**Request Body**:
```json
{
  "googleId": "user-google-id",
  "email": "user@example.com",
  "name": "User Name"
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "User created/updated successfully",
  "user": {
    "id": "database-user-id",
    "googleId": "user-google-id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

## 🎨 UI Components

### Home Page (`app/page.tsx`)
- **Authentication Section**: Sign-in/sign-out interface
- **User Profile Display**: Shows current user info when signed in
- **User Directory**: Lists all registered users (when authenticated)

### Users List (`app/components/UsersList.tsx`)
- **Client-side Component**: Fetches and displays users
- **Loading States**: Shows loading indicator while fetching
- **Error Handling**: Displays error messages if fetch fails

## 🔧 Configuration

### NextAuth Configuration (`app/api/auth/[...nextauth]/route.ts`)
- **Google Provider**: Configured with OAuth 2.0
- **JWT Strategy**: Session management with JSON Web Tokens
- **Callbacks**: Automatic user sync with backend
- **TypeScript**: Extended session types for user ID

### Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `NEXTAUTH_URL` | Your app's URL | Yes |
| `NEXTAUTH_SECRET` | Secret for JWT signing | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | Yes |

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
- Update `NEXTAUTH_URL` to your production domain
- Ensure Google OAuth redirect URI includes production URL
- Set secure `NEXTAUTH_SECRET` for production

## 🐛 Troubleshooting

### Common Issues

**"This app is blocked" error**
- Check Google Cloud Console OAuth consent screen
- Ensure user is added as test user (if in testing mode)
- Verify redirect URI matches exactly

**User sync fails**
- Check backend API is running on `http://localhost:3000`
- Verify API endpoint accepts POST requests
- Check network tab for API errors

**Session not persisting**
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Clear browser cookies and try again

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack

# Production
npm run build        # Build for production with Turbopack
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [NextAuth.js](https://next-auth.js.org/) for authentication
- [Material-UI](https://mui.com/) for UI components
- [Next.js](https://nextjs.org/) for the React framework
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2) for authentication provider

---

**Happy coding! 🎉**