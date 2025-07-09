# TrackPlan User Flows and Permissions

## Authentication & Onboarding

### User Registration

- Users can sign up using Google OAuth
- New users are directed to an onboarding flow
- During onboarding, users must confirm their details before accessing the app
- Confirming details creates a TrackPlan account

### User Login/Logout

- Authenticated users can log out
- Protected routes require authentication
- Non-authenticated users are redirected to the login page

## Organization Management

### Organization Access

- Users must be part of an organization to view its programs
- Users can belong to multiple organizations
- Users can switch between their organizations

### Organization Permissions

- Organization creators have admin privileges
- Only organization creators can:
  - Delete the organization
  - Invite new members
  - Remove members
- Organization members can view all programs in their organization

## Program Management

### Program Access

- Users can only view programs from organizations they belong to
- Program access is restricted by organization membership

### Program Creation

- Any organization member can create programs
- New programs are automatically associated with the user's active organization

### Program Editing

- Only the program creator can edit the program
- UI shows/hides edit button based on user permissions
- API validates edit permissions on submission

### Program Deletion

- Only organization admins (creators) can delete programs
- Programs are moved to trash instead of being permanently deleted
- Deletion requires confirmation

## User Management

### User Invitations

- Only organization admins can invite new users
- Invitations are sent via email
- System prevents duplicate invitations

### User Roles

- Basic users: Can view and create programs
- Organization admins: Have full control over their organization
- No super-admin role exists (all users are equal in terms of permissions)

## Data Access

### Data Isolation

- Users can only see data from organizations they belong to
- Program lists are filtered by the user's active organization
- User permissions are checked on both client and server side

### Trash System

- Deleted programs go to trash
- Only organization admins can view and manage trash
- Programs can be restored from trash

## UI/UX Flows

### Permission Feedback

- UI elements are shown/hidden based on user permissions
- Clear error messages when actions are not permitted
- Loading states during permission checks

### Navigation

- Users can only navigate to routes they have access to
- Protected routes redirect unauthenticated users
- 404 for non-existent resources

## Error Handling

### Permission Errors

- Clear error messages for unauthorized actions
- Graceful handling of missing permissions
- Logging of permission-related issues

### Data Validation

- Input validation on all forms
- Server-side validation of all mutations
- Protection against unauthorized data access

## Technical Implementation

### Frontend

- Uses Vue 3 Composition API with TypeScript
- Vue Query for data fetching and caching
- Pinia for global state management
- Vue Router for navigation with route guards

### Backend

- Firebase Authentication for user management
- Firestore for data storage with security rules
- Cloud Functions for server-side operations

### Security

- All sensitive operations are protected by authentication
- Row-level security in Firestore rules
- Input sanitization on both client and server
- Rate limiting on authentication endpoints
