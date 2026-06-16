const router = require('express').Router();
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

// Get current user info
router.get('/me', auth, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, email, bio, avatar_url, created_at')
      .eq('id', req.user.id)
      .single();
    
    if (error || !user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Update user profile
router.put('/update', auth, async (req, res) => {
  try {
    const { username, email, bio, currentPassword, newPassword } = req.body;
    
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (bio !== undefined) updateData.bio = bio;
    
    // Handle password change
    if (currentPassword && newPassword) {
      const { data: user } = await supabase
        .from('users')
        .select('password')
        .eq('id', req.user.id)
        .single();
      
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Current password is incorrect' });
      }
      
      updateData.password = await bcrypt.hash(newPassword, 10);
    }
    
    updateData.updated_at = new Date();
    
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.user.id)
      .select('id, username, email, bio, avatar_url, created_at')
      .single();
    
    if (error) throw error;
    
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;