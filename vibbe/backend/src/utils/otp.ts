export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const otpExpiry = () => {
  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + 10); // 10 min expiry
  return expires;
};
