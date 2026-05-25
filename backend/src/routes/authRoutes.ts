import { Router } from 'express';
import { register, login, getMe, sendOtp, verifyOtp, verifyRegistration, updateProfile } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/verify-registration', verifyRegistration);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/me', getMe);
router.put('/profile', updateProfile);

export default router;
