import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiEdit2, FiTrash2, FiEye, FiLock, FiUnlock, FiPlusCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

function Dashboard() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchMyBlogs = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/blogs/my-blogs', {
          headers: { 'x-auth-token': token }
        });
        setBlogs(res.data);
      } catch (err) {
        toast.error('Error fetching blogs');
      } finally {
        setLoading(false);
      }
    };
    fetchMyBlogs();
  }, [token]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await axios.delete(`http://localhost:5000/api/blogs/${id}`, {
          headers: { 'x-auth-token': token }
        });
        setBlogs(blogs.filter(blog => blog._id !== id));
        toast.success('Blog deleted successfully!');
      } catch (err) {
        toast.error('Error deleting blog');
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2 text-gray-900 dark:text-white">Your Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage all your blog posts from one place</p>
        </div>
        <Link to="/create">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <FiPlusCircle className="w-5 h-5" />
            <span>Create New Blog</span>
          </motion.button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90">Total Blogs</p>
          <p className="text-3xl font-bold">{blogs.length}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90">Public Blogs</p>
          <p className="text-3xl font-bold">{blogs.filter(b => b.isPublic).length}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90">Private Blogs</p>
          <p className="text-3xl font-bold">{blogs.filter(b => !b.isPublic).length}</p>
        </div>
      </div>

      {/* Blogs List */}
      {blogs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg"
        >
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">You haven't created any blogs yet.</p>
          <Link to="/create">
            <button className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300">
              Create your first blog →
            </button>
          </Link>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {blogs.map(blog => (
            <motion.div
              key={blog._id}
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        blog.isPublic 
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
                          : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                      }`}>
                        {blog.isPublic ? <FiUnlock className="inline w-3 h-3 mr-1" /> : <FiLock className="inline w-3 h-3 mr-1" />}
                        {blog.isPublic ? 'Public' : 'Private'}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <Link to={`/blog/${blog._id}`}>
                      <h2 className="text-xl font-bold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 mb-2">
                        {blog.title}
                      </h2>
                    </Link>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                      {blog.content.substring(0, 150)}...
                    </p>
                  </div>
                  
                  <div className="flex space-x-2 mt-4 md:mt-0">
                    <Link to={`/blog/${blog._id}`}>
                      <button className="flex items-center space-x-1 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200">
                        <FiEye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                    </Link>
                    <Link to={`/edit/${blog._id}`}>
                      <button className="flex items-center space-x-1 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200">
                        <FiEdit2 className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(blog._id)}
                      className="flex items-center space-x-1 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default Dashboard;