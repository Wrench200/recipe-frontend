import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Clock, Users, Heart, MessageCircle, ChefHat, User, Flame, Leaf, Sun, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    loadRecipe();
  }, [id]);

  const loadRecipe = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/recipes/${id}`);
      setRecipe(response.data);
      
      if (isAuthenticated && response.data.ratings) {
        const userRatingData = response.data.ratings.find(
          rating => rating.user._id === user.id
        );
        if (userRatingData) {
          setUserRating(userRatingData.rating);
        }
      }
    } catch (error) {
      toast.error('Failed to load recipe');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (rating) => {
    if (!isAuthenticated) {
      toast.error('Please login to rate recipes');
      return;
    }

    try {
      await api.post(`/recipes/${id}/rate`, { rating });
      setUserRating(rating);
      toast.success('Recipe rated successfully!');
      loadRecipe(); // Reload to get updated rating
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to rate recipe';
      toast.error(message);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to comment');
      return;
    }

    if (!commentText.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      await api.post(`/recipes/${id}/comment`, { text: commentText });
      setCommentText('');
      toast.success('Comment added successfully!');
      loadRecipe(); // Reload to get updated comments
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add favorites');
      return;
    }

    try {
      if (isFavorited) {
        await api.delete(`/recipes/${id}/favorite`);
        setIsFavorited(false);
        toast.success('Removed from favorites');
      } else {
        await api.post(`/recipes/${id}/favorite`);
        setIsFavorited(true);
        toast.success('Added to favorites');
      }
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} hours ${mins} minutes` : `${hours} hours`;
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={20}
          className={`star ${i <= rating ? 'filled' : ''} ${interactive ? 'cursor-pointer' : ''}`}
          onClick={interactive && onRatingChange ? () => onRatingChange(i) : undefined}
        />
      );
    }
    return stars;
  };


  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <div className="loading-text">Loading recipe...</div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="empty-state">
        <ChefHat size={64} className="empty-state-icon" />
        <h3>Recipe not found</h3>
        <p>The recipe you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="recipe-detail">
      <div className="recipe-header">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="recipe-main-image"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/800x400?text=No+Image';
          }}
        />
        
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">{recipe.title}</h1>
          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <button
                onClick={handleToggleFavorite}
                className={`btn ${isFavorited ? 'btn-danger' : 'btn-outline'}`}
              >
                <Heart size={16} className={isFavorited ? 'filled' : ''} />
                {isFavorited ? 'Favorited' : 'Add to Favorites'}
              </button>
            )}
          </div>
        </div>

        <p className="text-lg text-gray-600 mb-6">{recipe.description}</p>

        <div className="recipe-info">
          <div className="info-item">
            <Star size={20} className="mr-1 text-gray-500" />
            <div>
              <div className="font-semibold">Rating</div>
              <div className="flex items-center gap-1">
                <span className="text-sm">{recipe.averageRating || 0}</span>
                <div className="star-rating">
                  {renderStars(recipe.averageRating || 0)}
                </div>
                <span className="text-sm text-gray-500">({recipe.ratings?.length || 0})</span>
              </div>
            </div>
          </div>
          <div className="info-item">
            <Clock size={20} className="mr-1 text-gray-500" />
            <div>
              <div className="font-semibold">Prep Time</div>
              <div className="text-sm text-gray-600">{formatTime(recipe.prepTime)}</div>
            </div>
          </div>
          <div className="info-item">
            <Clock size={20} className="mr-1 text-gray-500" />
            <div>
              <div className="font-semibold">Cook Time</div>
              <div className="text-sm text-gray-600">{formatTime(recipe.cookTime)}</div>
            </div>
          </div>
          <div className="info-item">
            <Users size={20} className="mr-1 text-gray-500" />
            <div>
              <div className="font-semibold">Servings</div>
              <div className="text-sm text-gray-600">{recipe.servings}</div>
            </div>
          </div>
          <div className="info-item">
            <ChefHat size={20} className="mr-1 text-gray-500" />
            <div>
              <div className="font-semibold">Difficulty</div>
              <div className="text-sm text-gray-600">{recipe.difficulty}</div>
            </div>
          </div>
          <div className="info-item">
            <span className="inline-flex items-center">
              <Sun size={20} className="mr-1 text-gray-500" />
            </span>
            <div>
              <div className="font-semibold">Cuisine</div>
              <div className="text-sm text-gray-600">{recipe.cuisine}</div>
            </div>
          </div>
          <div className="info-item">
            <span className="inline-flex items-center">
              <Leaf size={20} className="mr-1 text-gray-500" />
            </span>
            <div>
              <div className="font-semibold">Diet</div>
              <div className="text-sm text-gray-600">{recipe.diet}</div>
            </div>
          </div>
          {recipe.calories && (
            <div className="info-item">
              <span className="inline-flex items-center">
                <Flame size={20} className="mr-1 text-gray-500" />
              </span>
              <div>
                <div className="font-semibold">Calories</div>
                <div className="text-sm text-gray-600">{recipe.calories} per serving</div>
              </div>
            </div>
          )}
          
        </div>

        {isAuthenticated && (
          <div className="card p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Rate this Recipe</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Your rating:</span>
              <div className="star-rating">
                {renderStars(userRating, true, handleRating)}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <User size={20} />
            <span>By {recipe.author?.username}</span>
          </div>
          <div className="text-sm text-gray-500">
            {new Date(recipe.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>


      <div className="ingredients-section">
        <h2 className="section-title">Ingredients</h2>
        <ul className="ingredient-list">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index} className="ingredient-item">
              <span className="font-medium">{ingredient.name}</span>
              <span className="text-gray-600">{ingredient.amount}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="instructions-section">
        <h2 className="section-title">Instructions</h2>
        <ol className="instruction-list">
          {recipe.instructions.map((instruction, index) => (
            <li key={index} className="instruction-item">
              <div className="instruction-number">{instruction.step}</div>
              <div className="instruction-text">{instruction.description}</div>
            </li>
          ))}
        </ol>
      </div>

      <div className="comments-section">
        <h2 className="section-title">Comments ({recipe.comments?.length || 0})</h2>
        
        {isAuthenticated && (
          <form onSubmit={handleAddComment} className="comment-form">
            <div className="form-group">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts about this recipe..."
                className="form-input form-textarea"
                rows="3"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              <MessageCircle size={16} />
              Add Comment
            </button>
          </form>
        )}

        <div className="comment-list">
          {recipe.comments?.map((comment, index) => (
            <div key={index} className="comment-item">
              <div className="comment-header">
                <span className="comment-author">{comment.user?.username}</span>
                <span className="comment-date">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="comment-text">{comment.text}</p>
            </div>
          ))}
        </div>

        {recipe.comments?.length === 0 && (
          <div className="empty-state">
            <MessageCircle size={48} className="empty-state-icon" />
            <h3>No comments yet</h3>
            <p>Be the first to share your thoughts about this recipe!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeDetail;
