import jwt from 'jsonwebtoken';

export const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'supersecretjwtkey_megabasket_2026';
  return jwt.sign({ id }, secret, {
    expiresIn: '30d',
  });
};
