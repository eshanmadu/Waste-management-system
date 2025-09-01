const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const WasteRecycle = require('../models/wasteRecycleModel');
const Reward = require('../models/Reward');
const Redeem = require('../models/Redeems');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Get all redeems
router.get('/', async (req, res) => {
  try {
    console.log('Starting to fetch redeems...');
    console.log('Request headers:', req.headers);
    
   
    const redeems = await Redeem.find()
      .populate('userId', 'firstName lastName userId')
      .populate('rewardId', 'name points image')
      .sort({ redemptionDate: -1 });

    console.log('Raw redeems from database:', JSON.stringify(redeems, null, 2));

  
    const transformedRedeems = redeems.map(redeem => {
      if (!redeem.userId || !redeem.rewardId) {
        console.warn('Missing populated fields for redeem:', redeem._id);
        return null;
      }

      const transformed = {
        _id: redeem._id,
        userId: redeem.userId.userId, 
        userName: `${redeem.userId.firstName} ${redeem.userId.lastName}`,
        rewardId: redeem.rewardId._id,
        rewardName: redeem.rewardId.name,
        rewardPoints: redeem.rewardId.points,
        rewardDetails: {
          image: redeem.rewardId.image
        },
        shippingInfo: redeem.shippingInfo,
        status: redeem.status || 'pending',
        redemptionDate: redeem.redemptionDate
      };
      console.log('Transformed redeem:', JSON.stringify(transformed, null, 2));
      return transformed;
    }).filter(redeem => redeem !== null);

    console.log('Final transformed redeems:', JSON.stringify(transformedRedeems, null, 2));
    res.status(200).json(transformedRedeems);
  } catch (error) {
    console.error('Error in GET /redeem:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch redeems',
      details: error.message 
    });
  }
});

// calculate total redeem points 
async function calculateTotalRedeemPoints(recId) {
  const userPoints = await WasteRecycle.aggregate([
    { $match: { recId } },
    { $group: { _id: "$recId", totalPoints: { $sum: "$redeemPoints" } } }
  ]);

  return userPoints.length ? userPoints[0].totalPoints : 0;
}

// 🔥 Handle reward redemption with transaction
router.post('/', async (req, res) => {
  let session;
  try {
    console.log('Starting redemption transaction...');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    session = await mongoose.startSession();
    session.startTransaction();

    const { userId, rewardId, shippingInfo } = req.body;

    // Validate input
    if (!userId || !rewardId || !shippingInfo) {
      console.log('Missing required fields:', { userId, rewardId, shippingInfo });
      await session.abortTransaction();
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Fetch user by userId
    console.log('Fetching user:', userId);
    const user = await User.findOne({ userId }).session(session);
    if (!user) {
      console.log('User not found:', userId);
      await session.abortTransaction();
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    console.log('Found user:', user);

    // Fetch reward details
    console.log('Fetching reward:', rewardId);
    const reward = await Reward.findById(rewardId).session(session);
    if (!reward) {
      console.log('Reward not found:', rewardId);
      await session.abortTransaction();
      return res.status(404).json({ success: false, error: 'Reward not found' });
    }
    console.log('Found reward:', reward);

    // Check if user has enough points
    console.log('Checking points:', {
      required: reward.points,
      available: user.redeemPoints
    });
    if (user.redeemPoints < reward.points) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        error: `Insufficient points. Required: ${reward.points}, Available: ${user.redeemPoints}`
      });
    }

    // Create redemption record with shipping info
    console.log('Creating redemption record with shipping info:', shippingInfo);
    const newRedemption = new Redeem({
      userId: user._id,
      userName: `${user.firstName} ${user.lastName}`,
      rewardId: reward._id,
      rewardName: reward.name,
      rewardPoints: reward.points,
      userPointsBefore: user.redeemPoints,
      userPointsAfter: user.redeemPoints - reward.points,
      shippingInfo: {
        name: shippingInfo.name,
        address: shippingInfo.address,
        phoneNumber: shippingInfo.phoneNumber,
        postalCode: shippingInfo.postalCode,
        city: shippingInfo.city,
        state: shippingInfo.state
      },
      status: 'pending'
    });

    console.log('Saving redemption record...');
    const savedRedemption = await newRedemption.save({ session });
    console.log('Saved redemption:', savedRedemption);

    // Deduct points from user's account
    console.log('Updating user points...');
    user.redeemPoints -= reward.points;
    const updatedUser = await user.save({ session });
    console.log('Updated user points:', updatedUser.redeemPoints);

    console.log('Committing transaction...');
    await session.commitTransaction();
    console.log('Transaction committed successfully');

    res.status(200).json({
      success: true,
      data: {
        redemptionId: savedRedemption._id,
        remainingPoints: updatedUser.redeemPoints,
        rewardDetails: {
          name: reward.name,
          points: reward.points,
          image: reward.image
        }
      }
    });

  } catch (error) {
    console.error('Redemption error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    if (session) {
      console.log('Aborting transaction due to error...');
      await session.abortTransaction();
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Transaction failed', 
      details: error.message 
    });
  } finally {
    if (session) {
      console.log('Ending session...');
      session.endSession();
    }
  }
});

// 🔥 Get redemption history with up-to-date points
router.get('/history/:recId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Get total redeem points 
    const totalRedeemPoints = await calculateTotalRedeemPoints(req.params.recId);

    // Fetch redemption history 
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { redemptionDate: -1 },
      select: '-__v'
    };

    const history = await Redeem.paginate({ recId: req.params.recId }, options);

    res.status(200).json({
      success: true,
      data: {
        recId: req.params.recId,
        totalRedeemPoints, 
        totalRedemptions: history.totalDocs,
        currentPage: history.page,
        totalPages: history.totalPages,
        history: history.docs
      }
    });

  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ success: false, error: 'Server error', details: error.message });
  }
});

//  Update redeem points dynamically when new waste is reported
router.post('/update-points/:recId', async (req, res) => {
  try {
    const { recId } = req.params;

    // Recalculate total redeem points
    const updatedTotalPoints = await calculateTotalRedeemPoints(recId);

    res.status(200).json({
      success: true,
      message: "Redeem points updated successfully.",
      totalRedeemPoints: updatedTotalPoints
    });

  } catch (error) {
    console.error('Update points error:', error);
    res.status(500).json({ success: false, error: 'Failed to update redeem points' });
  }
});

// Update redeem shipping information
router.patch('/:id', async (req, res) => {
  try {
    const { shippingInfo, status } = req.body;
    const redeem = await Redeem.findById(req.params.id);

    if (!redeem) {
      return res.status(404).json({ success: false, error: 'Redeem not found' });
    }

    // Update shipping information if provided
    if (shippingInfo) {
      // Validate required shipping fields
      const requiredFields = ['name', 'address', 'phoneNumber', 'postalCode', 'city', 'state'];
      const missingFields = requiredFields.filter(field => !shippingInfo[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required shipping fields',
          missingFields 
        });
      }

      redeem.shippingInfo = shippingInfo;
    }

    // Update status if provided
    if (status) {
      if (!['pending', 'shipped', 'delivered'].includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid status' });
      }
      redeem.status = status;
    }

    await redeem.save();

    // Return the updated redeem with populated fields
    const updatedRedeem = await Redeem.findById(redeem._id)
      .populate('userId', 'firstName lastName')
      .populate('rewardId', 'name points image');

    res.status(200).json({ 
      success: true, 
      data: {
        _id: updatedRedeem._id,
        userId: updatedRedeem.userId._id,
        userName: `${updatedRedeem.userId.firstName} ${updatedRedeem.userId.lastName}`,
        rewardId: updatedRedeem.rewardId._id,
        rewardName: updatedRedeem.rewardId.name,
        rewardPoints: updatedRedeem.rewardId.points,
        rewardDetails: {
          image: updatedRedeem.rewardId.image
        },
        shippingInfo: updatedRedeem.shippingInfo,
        status: updatedRedeem.status,
        redemptionDate: updatedRedeem.redemptionDate
      }
    });
  } catch (error) {
    console.error('Error updating redeem:', error);
    res.status(500).json({ success: false, error: 'Failed to update redeem' });
  }
});

// Cancel redeem and return points
router.patch('/:id/cancel', async (req, res) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const redeem = await Redeem.findById(req.params.id).session(session);
    if (!redeem) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, error: 'Redeem not found' });
    }

    // Only allow cancellation of pending redeems
    if (redeem.status !== 'pending') {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false, 
        error: 'Only pending redeems can be cancelled' 
      });
    }

    // Find user and return points
    const user = await User.findById(redeem.userId).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Return points to user
    user.redeemPoints += redeem.rewardPoints;
    await user.save({ session });

    // Delete the redeem
    await Redeem.findByIdAndDelete(req.params.id).session(session);

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      remainingPoints: user.redeemPoints,
      message: 'Redeem cancelled successfully'
    });

  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    console.error('Error cancelling redeem:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to cancel redeem',
      details: error.message 
    });
  } finally {
    if (session) {
      session.endSession();
    }
  }
});

module.exports = router;
