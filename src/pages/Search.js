import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Search as SearchIcon, Clock, Users, Filter, ChefHat, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const SearchRecipe = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    cuisine: '',
    diet: '',
    difficulty: '',
    maxPrepTime: '',
    maxCookTime: '',
    maxCalories: '',
    ingredients: ''
  });

  useEffect(() => {
    loadRecipes();
  }, [searchParams]);

  const loadRecipes = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // Add search query
      if (filters.search) params.append('search', filters.search);
      if (filters.cuisine) params.append('cuisine', filters.cuisine);
      if (filters.diet) params.append('diet', filters.diet);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.maxPrepTime) params.append('maxPrepTime', filters.maxPrepTime);
      if (filters.maxCookTime) params.append('maxCookTime', filters.maxCookTime);
      if (filters.maxCalories) params.append('maxCalories', filters.maxCalories);
      if (filters.ingredients) params.append('ingredients', filters.ingredients);
      
      params.append('page', page);
      params.append('limit', 12);

      const response = await api.get(`/recipes?${params.toString()}`);
      setRecipes(response.data.recipes);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams();
    if (filters.search) newParams.set('q', filters.search);
    setSearchParams(newParams);
    loadRecipes();
  };

  const handleFilterSubmit = () => {
    loadRecipes();
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      cuisine: '',
      diet: '',
      difficulty: '',
      maxPrepTime: '',
      maxCookTime: '',
      maxCalories: '',
      ingredients: ''
    });
    setSearchParams({});
    loadRecipes();
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


  const renderPagination = () => {
    if (!pagination.totalPages || pagination.totalPages <= 1) return null;

    const pages = [];
    const currentPage = pagination.currentPage;
    const totalPages = pagination.totalPages;

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => loadRecipes(currentPage - 1)}
        disabled={!pagination.hasPrev}
        className="pagination-btn"
      >
        Previous
      </button>
    );

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
        pages.push(
          <button
            key={i}
            onClick={() => loadRecipes(i)}
            className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
          >
            {i}
          </button>
        );
      } else if (i === currentPage - 3 || i === currentPage + 3) {
        pages.push(<span key={`ellipsis-${i}`} className="pagination-btn">...</span>);
      }
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => loadRecipes(currentPage + 1)}
        disabled={!pagination.hasNext}
        className="pagination-btn"
      >
        Next
      </button>
    );

    return <div className="pagination">{pages}</div>;
  };

  return (
    <div className="search-container">
      <div className="search-header">
        <h1 className="text-3xl font-bold mb-4">Search Recipes</h1>
        <p className="text-gray-600">Find the perfect recipe for your next meal</p>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search for recipes, ingredients, or cuisines..."
              className="form-input pr-10"
            />
            <SearchIcon size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </div>
      </form>

      <div className="search-filters">
        <div className="filter-group">
          <label className="filter-label">Cuisine</label>
          <select
            value={filters.cuisine}
            onChange={(e) => handleFilterChange('cuisine', e.target.value)}
            className="form-input form-select"
          >
            <option value="">All Cuisines</option>
            <option value="Italian">Italian</option>
            <option value="Mexican">Mexican</option>
            <option value="Asian">Asian</option>
            <option value="American">American</option>
            <option value="French">French</option>
            <option value="Indian">Indian</option>
            <option value="Mediterranean">Mediterranean</option>
            <option value="Thai">Thai</option>
            <option value="Chinese">Chinese</option>
            <option value="Japanese">Japanese</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Diet</label>
          <select
            value={filters.diet}
            onChange={(e) => handleFilterChange('diet', e.target.value)}
            className="form-input form-select"
          >
            <option value="">All Diets</option>
            <option value="Regular">Regular</option>
            <option value="Vegetarian">Vegetarian</option>
            <option value="Vegan">Vegan</option>
            <option value="Gluten-Free">Gluten-Free</option>
            <option value="Keto">Keto</option>
            <option value="Paleo">Paleo</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Difficulty</label>
          <select
            value={filters.difficulty}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            className="form-input form-select"
          >
            <option value="">All Levels</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Max Prep Time (min)</label>
          <input
            type="number"
            value={filters.maxPrepTime}
            onChange={(e) => handleFilterChange('maxPrepTime', e.target.value)}
            className="form-input"
            placeholder="e.g. 30"
            min="0"
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Max Cook Time (min)</label>
          <input
            type="number"
            value={filters.maxCookTime}
            onChange={(e) => handleFilterChange('maxCookTime', e.target.value)}
            className="form-input"
            placeholder="e.g. 60"
            min="0"
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Max Calories</label>
          <input
            type="number"
            value={filters.maxCalories}
            onChange={(e) => handleFilterChange('maxCalories', e.target.value)}
            className="form-input"
            placeholder="e.g. 500"
            min="0"
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Ingredients</label>
          <input
            type="text"
            value={filters.ingredients}
            onChange={(e) => handleFilterChange('ingredients', e.target.value)}
            className="form-input"
            placeholder="e.g. chicken, tomato, onion"
          />
        </div>

        <div className="filter-group">
          <button
            type="button"
            onClick={handleFilterSubmit}
            className="btn btn-primary"
          >
            <Filter size={16} />
            Apply Filters
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="btn btn-outline"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {loading ? 'Searching...' : `${pagination.totalRecipes || 0} recipes found`}
          </h2>
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <div className="loading-text">Searching recipes...</div>
        </div>
      ) : recipes.length === 0 ? (
        <div className="empty-state">
          <ChefHat size={64} className="empty-state-icon" />
          <h3>No recipes found</h3>
          <p>Try adjusting your search criteria or browse all recipes.</p>
          <button onClick={clearFilters} className="btn btn-primary">
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="recipe-grid">
            {recipes.map((recipe) => (
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

          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default SearchRecipe;
