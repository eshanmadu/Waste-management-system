import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const ArticleDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [article, setArticle] = useState(location.state?.article);
  const [loading, setLoading] = useState(!location.state?.article);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!location.state?.article) {
        try {
          const response = await fetch(`http://localhost:5001/api/articles/${id}`);
          if (!response.ok) {
            throw new Error('Article not found');
          }
          const data = await response.json();
          setArticle(data);
        } catch (error) {
          console.error('Error fetching article:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchArticle();
  }, [id, location.state]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Article not found</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center bg-gray-100 w-full mt-16 py-12">
      <div className="max-w-4xl w-full px-4 md:px-8 mx-auto">
        <button
          onClick={() => navigate('/articles')}
          className="mb-6 text-green-700 hover:text-green-800 flex items-center"
        >
          ← Back to Articles
        </button>
        
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <img 
            src={article.image} 
            alt={article.title} 
            className="w-full h-64 md:h-96 object-cover rounded-lg mb-6"
          />
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{article.title}</h1>
          
          <div className="flex items-center text-gray-500 text-sm mb-6">
            <span>{article.date}</span>
            <span className="mx-2">•</span>
            <span>{article.category}</span>
            <span className="mx-2">•</span>
            <span>By {article.author}</span>
          </div>
          
          <div className="prose max-w-none">
            {article.content ? (
              article.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-700">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="text-gray-700">{article.excerpt}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail; 