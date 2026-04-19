import { hashPassword, comparePassword } from '../../utils/password';
import { generateToken, verifyRefreshToken } from '../../utils/jwt';
import {
  createUser,
  findExistingUser,
  findUserByEmail,
  findUserByUserId,
} from '../../repo/auth/auth.repo';

export const loginUser = async (email: string, password: string) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error('User not found');
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  return {
    userId: user.userId,
    email: user.email,
    username: user.username,
    role: user.role,
  };
};

export const registerUser = async (
  email: string,
  username: string,
  password: string,
  userId: string,
) => {
  const existingUser = await findExistingUser(email, username, userId);

  if (existingUser) {
    if (existingUser.email === email) {
      throw new Error('Email already exists');
    }
    if (existingUser.username === username) {
      throw new Error('Username already exists');
    }
    if (existingUser.userId === userId) {
      throw new Error('User ID already exists');
    }
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await createUser({
    userId,
    email,
    username,
    password: hashedPassword,
  });

  return {
    userId: newUser.userId,
    email: newUser.email,
    username: newUser.username,
    role: newUser.role,
  };
};

export const refreshAccessToken = async (refreshToken: string) => {
  const decoded = verifyRefreshToken(refreshToken);

  if (!decoded) {
    throw new Error('Invalid or expired refresh token');
  }

  const user = await findUserByUserId(decoded.userId);

  if (!user) {
    throw new Error('User not found');
  }

  const newToken = generateToken(decoded.userId);

  return {
    token: newToken,
    userId: decoded.userId,
  };
};
