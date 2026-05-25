import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { sendLoginOtp } from '../services/smsService';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretcyberjwttoken123!';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({ error: 'Phone number already registered' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate a 6-digit OTP for registration verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

    const user = new User({
      name,
      email,
      passwordHash,
      phone,
      role: role || 'CITIZEN',
      otp,
      otpExpiresAt,
      isVerified: false
    });

    await user.save();

    // Send OTP via SMS service
    if (phone) {
      await sendLoginOtp(phone, otp);
    }

    res.status(201).json({ 
      message: 'Registration successful! Verification OTP sent to your phone number.', 
      phone 
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

export const verifyRegistration = async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone number and OTP are required' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if OTP matches and is not expired
    if (!user.otp || user.otp !== otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Clear OTP fields and set isVerified to true
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    user.isVerified = true;
    await user.save();

    res.status(200).json({ 
      message: 'Phone number verified successfully. Please proceed to login.' 
    });
  } catch (error) {
    console.error('Error verifying registration OTP:', error);
    res.status(500).json({ error: 'Server error during verification' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ error: 'Please verify your phone number first before logging in.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json(user);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Find user by phone number
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ error: 'User not registered with this phone number' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ error: 'Please verify your phone number first before logging in.' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

    // Save to user
    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    // Send OTP via SMS service
    await sendLoginOtp(phone, otp);

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Server error during sending OTP' });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone number and OTP are required' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if OTP matches and is not expired
    if (!user.otp || user.otp !== otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Clear OTP fields
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({ 
      token, 
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } 
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Server error during OTP verification' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const { name, email, phone, aadhaar, city, state, secondaryPhone, bloodGroup, address } = req.body;

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (aadhaar !== undefined) user.aadhaar = aadhaar;
    if (city !== undefined) user.city = city;
    if (state !== undefined) user.state = state;
    if (secondaryPhone !== undefined) user.secondaryPhone = secondaryPhone;
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
    if (address !== undefined) user.address = address;

    await user.save();

    res.status(200).json({ 
      message: 'Profile updated successfully', 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        aadhaar: user.aadhaar,
        city: user.city,
        state: user.state,
        secondaryPhone: user.secondaryPhone,
        bloodGroup: user.bloodGroup,
        address: user.address,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Server error during profile update' });
  }
};


