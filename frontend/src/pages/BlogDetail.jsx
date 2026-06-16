import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { localStorageAPI } from '../services/localStorageService';
import { FiCalendar, FiUser, FiEdit2, FiTrash2, FiArrowLeft, FiLock, FiUnlock } from 'react-icons/fi';
import toast from 'react-hot-toast';

function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthor, setIsAuthor] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const data = await localStorageAPI.getBlogById(id);
        setBlog(data);
        setIsAuthor(user && data.authorId === user.id);
      } catch (err) {
        toast.error('Error fetching blog');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id, user, navigate]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await localStorageAPI.deleteBlog(id);
        toast.success('Blog deleted successfully!');
        navigate('/dashboard');
      } catch (err) {
        toast.error('Error deleting blog');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!blog) return null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 max-w-4xl"
    >
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors duration-200"
      >
        <FiArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      {/* Blog Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            blog.isPublic 
              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
              : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
          }`}>
            {blog.isPublic ? <FiUnlock className="inline w-3 h-3 mr-1" /> : <FiLock className="inline w-3 h-3 mr-1" />}
            {blog.isPublic ? 'Public' : 'Private'}
          </span>
          {isAuthor && (
            <div className="flex space-x-2">
              <button
                onClick={() => navigate(`/edit/${blog.id}`)}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
              >
                <FiEdit2 className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
              >
                <FiTrash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>

        <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-4">
          {blog.title}
        </h1>

        <div className="flex items-center space-x-6 text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <FiUser className="w-5 h-5" />
            <span className="font-medium">{blog.authorName}</span>
          </div>
          <div className="flex items-center space-x-2">
            <FiCalendar className="w-5 h-5" />
            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {blog.imageUrl && (
        <div className="mb-8 rounded-2xl overflow-hidden shadow-xl">
          <img src={blog.imageUrl} alt={blog.title} className="w-full h-auto" />
        </div>
      )}

      {/* Blog Content */}
      <div className="prose prose-lg prose-blue dark:prose-invert max-w-none">
        {blog.content.split('\n').map((paragraph, idx) => (
          <p key={idx} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
          © {new Date().getFullYear()} BlogSphere. All rights reserved.
        </p>
      </div>
    </motion.article>
  );
}

export default BlogDetail;