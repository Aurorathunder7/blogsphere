const router = require('express').Router();
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const Blog = require('../models/Blog');

// Get all public blogs (no auth required)
router.get('/public', async (req, res) => {
  try {
    const blogs = await Blog.find({ isPublic: true })
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Get user's own blogs (public + private)
router.get('/my-blogs', auth, async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.user.id })
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Get a single blog (respects privacy)
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'username');
    
    if (!blog) {
      return res.status(404).json({ msg: 'Blog not found' });
    }
    
    // Check privacy: if not public, only author can see
    if (!blog.isPublic) {
      const token = req.header('x-auth-token');
      if (!token) {
        return res.status(401).json({ msg: 'This blog is private' });
      }
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.user.id !== blog.author._id.toString()) {
          return res.status(401).json({ msg: 'This blog is private' });
        }
      } catch (err) {
        return res.status(401).json({ msg: 'This blog is private' });
      }
    }
    
    res.json(blog);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Create a blog (requires auth)
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, imageUrl, isPublic } = req.body;
    
    const blog = new Blog({
      title,
      content,
      imageUrl,
      isPublic: isPublic !== undefined ? isPublic : true,
      author: req.user.id
    });
    
    await blog.save();
    res.json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Update a blog (author only)
router.put('/:id', auth, async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ msg: 'Blog not found' });
    }
    
    // Check ownership
    if (blog.author.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    const { title, content, imageUrl, isPublic } = req.body;
    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.imageUrl = imageUrl !== undefined ? imageUrl : blog.imageUrl;
    blog.isPublic = isPublic !== undefined ? isPublic : blog.isPublic;
    blog.updatedAt = Date.now();
    
    await blog.save();
    res.json(blog);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Delete a blog (author only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ msg: 'Blog not found' });
    }
    
    if (blog.author.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    await blog.deleteOne();
    res.json({ msg: 'Blog removed' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;