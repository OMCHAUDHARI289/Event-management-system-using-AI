import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';
import adminController from '../controllers/adminController.js';

const router = express.Router();

router.use(authMiddleware); 
router.use(roleMiddleware(['admin'])); // only admin can access

router.post('/members', adminController.addMember); // create club member
router.get('/members/:department', adminController.getMembersByDepartment); // list members branch-wise

export default router;
