// Local Storage Service - Complete offline blog platform

// Storage keys
const STORAGE_KEYS = {
  USERS: 'blogsphere_users',
  BLOGS: 'blogsphere_blogs',
  CURRENT_USER: 'blogsphere_current_user',
  SESSION_TOKEN: 'blogsphere_token'
};

// Initialize default data if empty
const initializeData = () => {
  // Initialize users if empty
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const defaultUsers = [
      {
        id: 'user_1',
        username: 'demouser',
        email: 'demo@example.com',
        password: 'demo123', // In real app, this would be hashed
        bio: 'This is a demo user account',
        avatar_url: '',
        createdAt: new Date().toISOString()
      },
      {
        id: 'user_2',
        username: 'john_doe',
        email: 'john@example.com',
        password: 'john123',
        bio: 'Passionate writer and tech enthusiast',
        avatar_url: '',
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }

  // Initialize blogs if empty
  if (!localStorage.getItem(STORAGE_KEYS.BLOGS)) {
    const defaultBlogs = [
      {
        id: 'blog_1',
        title: 'Welcome to BlogSphere! 🎉',
        content: `Welcome to your new blog platform! This is a fully functional offline version.

✨ Features included:
- Create, edit, and delete blogs
- Public/Private visibility toggle
- Dark/Light mode
- User authentication
- Search functionality
- Responsive design

All your data is stored locally in your browser. Nothing is sent to any server!

Get started by creating your first blog post!`,
        imageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
        isPublic: true,
        authorId: 'user_1',
        authorName: 'demouser',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'blog_2',
        title: 'How Local Storage Works',
        content: `This blog platform uses your browser's localStorage to save all data.

Benefits:
✅ Works offline
✅ No server required
✅ Your data stays private
✅ Instant loading
✅ Free forever

Try creating a new blog post - it will be saved immediately!`,
        imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
        isPublic: true,
        authorId: 'user_1',
        authorName: 'demouser',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'blog_3',
        title: 'Tips for Great Blogging',
        content: `Here are some tips to make your blogs stand out:

1. Write engaging titles that grab attention
2. Use images to break up text
3. Keep paragraphs short and readable
4. Add a personal touch to your writing
5. Be consistent with your posting schedule

Happy blogging! 📝`,
        imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
        isPublic: true,
        authorId: 'user_2',
        authorName: 'john_doe',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(defaultBlogs));
  }
};

// Call initialization
initializeData();

// Helper functions
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Auth Services
export const localStorageAPI = {
  // Register new user
  register: async (username, email, password) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS));
    
    // Check if user exists
    if (users.find(u => u.email === email)) {
      throw new Error('Email already registered');
    }
    if (users.find(u => u.username === username)) {
      throw new Error('Username already taken');
    }
    
    const newUser = {
      id: generateId(),
      username,
      email,
      password, // In production, hash this!
      bio: '',
      avatar_url: '',
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    // Create session
    const token = generateId();
    localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    
    return {
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        bio: newUser.bio,
        avatar_url: newUser.avatar_url,
        createdAt: newUser.createdAt
      }
    };
  },

  // Login user
  login: async (email, password) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS));
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    const token = generateId();
    localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar_url: user.avatar_url,
        createdAt: user.createdAt
      }
    };
  },

  // Logout
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  },

  // Check if logged in
  isLoggedIn: () => {
    return localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN) !== null;
  },

  // Update profile
  updateProfile: async (userId, userData) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS));
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    users[userIndex] = { ...users[userIndex], ...userData };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    // Update current session if it's the same user
    const currentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (currentUser) {
      const parsed = JSON.parse(currentUser);
      if (parsed.id === userId) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(users[userIndex]));
      }
    }
    
    return users[userIndex];
  },

  // Blog Services
  getAllPublicBlogs: async () => {
    const blogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.BLOGS));
    return blogs.filter(blog => blog.isPublic === true)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getUserBlogs: async (userId) => {
    const blogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.BLOGS));
    return blogs.filter(blog => blog.authorId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getBlogById: async (id) => {
    const blogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.BLOGS));
    const blog = blogs.find(b => b.id === id);
    if (!blog) {
      throw new Error('Blog not found');
    }
    return blog;
  },

  createBlog: async (blogData, userId, username) => {
    const blogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.BLOGS));
    const newBlog = {
      id: generateId(),
      ...blogData,
      authorId: userId,
      authorName: username,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    blogs.push(newBlog);
    localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(blogs));
    return newBlog;
  },

  updateBlog: async (id, blogData) => {
    const blogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.BLOGS));
    const blogIndex = blogs.findIndex(b => b.id === id);
    
    if (blogIndex === -1) {
      throw new Error('Blog not found');
    }
    
    blogs[blogIndex] = {
      ...blogs[blogIndex],
      ...blogData,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(blogs));
    return blogs[blogIndex];
  },

  deleteBlog: async (id) => {
    const blogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.BLOGS));
    const filteredBlogs = blogs.filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(filteredBlogs));
    return { success: true };
  },

  // Image upload (creates object URL)
  uploadImage: async (file) => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please upload an image file'));
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('Image size should be less than 5MB'));
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({ imageUrl: reader.result });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // Clear all data (reset to default)
  resetAllData: () => {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.BLOGS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
    initializeData();
    window.location.reload();
  }
};

export const isLocalMode = true;