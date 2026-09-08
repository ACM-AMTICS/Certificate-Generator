/**
 * Hardcoded authentication helper for ACM Dashboard.
 */

const ALLOWED_USERS = [
  {
    email: 'abdulkadirshaikh.contact@gmail.com',
    password: 'webmaster@acm.amtics.org',
    role: 'Webmaster',
    name: 'Abdulkadir Shaikh',
  },
  {
    email: 'prathamdkhatri@gmail.com',
    password: 'secretary@acm.amtics.org',
    role: 'Secretary',
    name: 'Pratham Khatri',
  },
];

const AUTH_STORAGE_KEY = 'acm_dashboard_auth_user';

/**
 * Authenticates user credentials against hardcoded records.
 * 
 * @param {string} email 
 * @param {string} password 
 * @returns {{ success: boolean, user?: Object, error?: string }}
 */
export function login(email, password) {
  const normalizedEmail = (email || '').trim().toLowerCase();
  const trimmedPassword = (password || '').trim();

  if (!normalizedEmail || !trimmedPassword) {
    return { success: false, error: 'Email and password are required.' };
  }

  const foundUser = ALLOWED_USERS.find(
    (user) => user.email.toLowerCase() === normalizedEmail
  );

  if (!foundUser) {
    return { success: false, error: 'Unauthorized email address.' };
  }

  if (foundUser.password !== trimmedPassword) {
    return { success: false, error: 'Invalid password.' };
  }

  const sessionData = {
    email: foundUser.email,
    role: foundUser.role,
    name: foundUser.name,
    loggedInAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
  } catch (err) {
    console.error('Failed to save auth session:', err);
  }

  return { success: true, user: sessionData };
}

/**
 * Logs out the current user session.
 */
export function logout() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear auth session:', err);
  }
}

/**
 * Gets currently logged in user session object or null.
 * 
 * @returns {Object|null}
 */
export function getAuthUser() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Checks if a valid user is logged in.
 * 
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!getAuthUser();
}
