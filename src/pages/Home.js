import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Clock, Users, ChefHat, Search, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const Home = () => {
  const [popularRecipes, setPopularRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    loadPopularRecipes();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };
  const loadPopularRecipes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/recipes/popular');
      setPopularRecipes(response.data);
    } catch (error) {
      toast.error('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={16} className="star filled" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" size={16} className="star filled" style={{ opacity: 0.5 }} />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={16} className="star" />);
    }

    return stars;
  };


  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <div className="loading-text">Loading recipes...</div>
      </div>
    );
  }

  return (
    <div>
      <section className="hero">
        <div className="container max-w-7xl mx-auto px-4">
          <h1>Popular Recipes</h1>
          <p>Explore the most popular recipes from around the world</p>
          <div className="flex justify-center gap-4 mt-6">
          <form onSubmit={handleSearch} className="flex items-center w-[250px] gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input pr-10 w-full"
              />
              <Search size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            </form>
          </div>
        </div>
      </section>

      <section className="container max-w-7xl mx-auto px-4">
        

        {popularRecipes.length === 0 ? (
          <div className="empty-state">
            <ChefHat size={64} className="empty-state-icon" />
            <h3>No recipes yet</h3>
            <p>Be the first to share a delicious recipe!</p>
            <Link to="/add-recipe" className="btn btn-primary">
              Add Recipe
            </Link>
          </div>
        ) : (
          <div className="recipe-grid">
            {popularRecipes.map((recipe) => (
              <Link key={recipe._id} to={`/recipe/${recipe._id}`} className="recipe-card">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="recipe-image"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                  }}
                />
                <div className="recipe-content">
                  <h3 className="recipe-title">{recipe.title}</h3>
                  <div className="recipe-meta">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{formatTime(recipe.totalTime || recipe.prepTime + recipe.cookTime)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span>{recipe.servings} servings</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">{recipe.difficulty}</span>
                    </div>
                  </div>
                  <p className="recipe-description">{recipe.description}</p>
                  <div className="recipe-rating">
                    <div className="star-rating">
                      {renderStars(recipe.averageRating || 0)}
                    </div>
                    <span className="text-sm text-gray-500 ml-2">
                      ({recipe.ratings?.length || 0} ratings)
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-500">{recipe.cuisine}</span>
                    <span className="text-sm text-gray-500">{recipe.diet}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
