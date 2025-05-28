# SUPER_ADMIN Setup Guide

This document explains how to create the initial SUPER_ADMIN user for the ClimaEdu platform.

## Overview

The SUPER_ADMIN is the root user of the platform with global access to all institutions and system-wide operations. Only one SUPER_ADMIN can exist in the system, and it must be the first user created.

## Prerequisites

- Firebase project configured
- Environment variables set up (see `.env.local`)
- `SUPER_ADMIN_SETUP_KEY` environment variable configured
- Firebase emulators running (for development)
- `firebase-admin` package installed

## Creation Method

### API Endpoint

For production deployments, use the protected API endpoint:

```bash
curl -X POST https://your-app.vercel.app/api/setup/super-admin \
  -H "X-Setup-Key: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@climaedu.com",
    "name": "John Doe",
    "password": "SecurePassword123"
  }'
```

**Success Response:**
```json
{
  "success": true,
  "message": "SUPER_ADMIN user created successfully",
  "userId": "abc123xyz789"
}
```

**Error Responses:**
```json
// Invalid setup key
{
  "error": "Invalid or missing setup key"
}

// SUPER_ADMIN already exists
{
  "error": "A SUPER_ADMIN user already exists in the system"
}

// Missing fields
{
  "error": "Missing required fields: email, name, password"
}
```

## Environment Variables

Add to your `.env.local` (development) or environment configuration (production):

```env
# Super Admin Setup
SUPER_ADMIN_SETUP_KEY=your-super-secret-key-here
```

**Important:** Use a strong, unique key for production environments.

## Security Considerations

1. **Setup Key Protection**: Keep the `SUPER_ADMIN_SETUP_KEY` secret and secure
2. **One-Time Use**: The system prevents creating multiple SUPER_ADMIN users
3. **Strong Password**: Use a strong password for the SUPER_ADMIN account
4. **API Rate Limiting**: The API endpoint has built-in protection against abuse
5. **Audit Trail**: All creation attempts are logged for security monitoring

## SUPER_ADMIN Characteristics

- **Global Access**: Not associated with any specific institution
- **Unique**: Only one can exist in the system
- **Firebase Auth**: Uses standard Firebase authentication
- **Role**: `UserRole.SUPER_ADMIN`
- **Permissions**: Full access to all platform features and institutions

## Troubleshooting

### Common Issues

1. **"SUPER_ADMIN already exists"**
   - Only one SUPER_ADMIN can exist
   - Check if one was already created
   - Use the existing SUPER_ADMIN credentials

2. **"Setup key not configured"**
   - Ensure `SUPER_ADMIN_SETUP_KEY` is set in environment variables
   - Restart the application after adding the variable

3. **"Invalid or missing setup key"**
   - Verify the `X-Setup-Key` header matches the environment variable
   - Check for typos in the key

4. **Firebase connection errors**
   - Verify Firebase configuration in `.env.local`
   - Ensure Firebase project is properly set up
   - Check network connectivity

## Next Steps

After creating the SUPER_ADMIN:

1. **Login**: Use the credentials to log into the platform
2. **Create Institutions**: Set up the first institutions
3. **Create Users**: Add LOCAL_ADMIN and other users to institutions
4. **Configure Platform**: Set up system-wide configurations

## File Structure

```
src/
├── app/api/setup/super-admin/route.ts    # API endpoint
└── _core/modules/user/core/use-cases/
    └── create-super-admin/               # Use case implementation
```

## Related Documentation

- [User Management](./user.md)
- [Institution Management](./institution.md)
- [Authentication System](./auth.md)
- [Environment Setup](../README.md)
