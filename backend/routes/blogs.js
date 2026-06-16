const router = require('express').Router();
const auth = require('../middleware/auth');
const supabase = require('../config/supabase');

// Get all public blogs
router.get('/public', async (req, res) => {
  try {
    const { data: blogs, error } = await supabase
      .from('blogs')
      .select(`
        *,
        users:user_id (username)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Format response to match your frontend expectations
    const formattedBlogs = blogs.map(blog => ({
      _id: blog.id,
      title: blog.title,
      content: blog.content,
      imageUrl: blog.image_url,
      isPublic: blog.is_public,
      author: blog.users,
      createdAt: blog.created_at,
      updatedAt: blog.updated_at
    }));
    
    res.json(formattedBlogs);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Get user's own blogs
router.get('/my-blogs', auth, async (req, res) => {
  try {
    const { data: blogs, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const formattedBlogs = blogs.map(blog => ({
      _id: blog.id,
      title: blog.title,
      content: blog.content,
      imageUrl: blog.image_url,
      isPublic: blog.is_public,
      createdAt: blog.created_at,
      updatedAt: blog.updated_at
    }));
    
    res.json(formattedBlogs);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Create a blog
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, imageUrl, isPublic } = req.body;
    
    const { data: newBlog, error } = await supabase
      .from('blogs')
      .insert([{
        user_id: req.user.id,
        title,
        content,
        image_url: imageUrl,
        is_public: isPublic !== undefined ? isPublic : true
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      _id: newBlog.id,
      title: newBlog.title,
      content: newBlog.content,
      imageUrl: newBlog.image_url,
      isPublic: newBlog.is_public,
      createdAt: newBlog.created_at
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Update a blog
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, imageUrl, isPublic } = req.body;
    const blogId = req.params.id;
    
    // Check ownership
    const { data: existingBlog } = await supabase
      .from('blogs')
      .select('user_id')
      .eq('id', blogId)
      .single();
    
    if (!existingBlog) {
      return res.status(404).json({ msg: 'Blog not found' });
    }
    
    if (existingBlog.user_id !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    const { data: updatedBlog, error } = await supabase
      .from('blogs')
      .update({
        title,
        content,
        image_url: imageUrl,
        is_public: isPublic,
        updated_at: new Date()
      })
      .eq('id', blogId)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      _id: updatedBlog.id,
      title: updatedBlog.title,
      content: updatedBlog.content,
      imageUrl: updatedBlog.image_url,
      isPublic: updatedBlog.is_public
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Delete a blog
router.delete('/:id', auth, async (req, res) => {
  try {
    const blogId = req.params.id;
    
    // Check ownership
    const { data: existingBlog } = await supabase
      .from('blogs')
      .select('user_id')
      .eq('id', blogId)
      .single();
    
    if (!existingBlog) {
      return res.status(404).json({ msg: 'Blog not found' });
    }
    
    if (existingBlog.user_id !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', blogId);
    
    if (error) throw error;
    
    res.json({ msg: 'Blog removed' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;