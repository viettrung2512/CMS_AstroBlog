const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
require('dotenv').config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const loginUser = async (username, password) => {
  const user = await User.findOne({ username });

  if (!user) {
    throw new Error('Invalid username or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid username or password');
  }
      
  const token = jwt.sign(
    { userId: user._id, role: user.userRole },
    process.env.JWT_SECRET_KEY,
    { expiresIn: '1d' }
  );

  return {
    token,
    username: user.username,
    profilePicture: user.profilePicture || "",
    id: user._id,
    userRole: user.userRole
  };
};

const loginWithGoogle = async (googleToken) => {
  const ticket = await client.verifyIdToken({
    idToken: googleToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { email, name, picture } = payload;

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      email,
      username: email.split('@')[0],
      name,
      profilePicture: picture,
      userRole: 'USER',
      isEnabled: true,
    });
  }

  const token = jwt.sign(
    { userId: user._id, role: user.userRole },
    process.env.JWT_SECRET_KEY,
    { expiresIn: '1d' }
  );

  return {
    token,
    username: user.username,
    profilePicture: user.profilePicture || "",
    id: user._id,
    userRole: user.userRole,
  };
};

module.exports = { loginUser, loginWithGoogle };