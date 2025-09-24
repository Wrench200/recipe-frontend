import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { User, Heart, ChefHat, Edit, Clock, Users, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('recipes');
  const [userRecipes, setUserRecipes] = useState([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    bio: '',
    avatar: ''
  });

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      loadUserData();
      setProfileData({
        username: user.username || '',
        bio: user.bio || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [recipesResponse, favoritesResponse] = await Promise.all([
        api.get(`/recipes/user/${user.id}`),
        api.get(`/users/${user.id}/favorites`)
      ]);
      
      setUserRecipes(recipesResponse.data);
      setFavoriteRecipes(favoritesResponse.data);
    } catch (error) {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    setEditing(true);
  };

  const handleSaveProfile = async () => {
    const result = await updateProfile(profileData);
    if (result.success) {
      setEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileData({
      username: user.username || '',
      bio: user.bio || '',
      avatar: user.avatar || ''
    });
    setEditing(false);
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


  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <div className="loading-text">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={profileData.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=3b82f6&color=fff`}
              alt={user.username}
              className="profile-avatar"
            />
            {editing && (
              <button className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1">
                <Edit size={12} />
              </button>
            )}
          </div>
          <div className="profile-info">
            {editing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                  className="form-input"
                />
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="form-input form-textarea"
                  rows="3"
                  placeholder="Tell us about yourself..."
                />
                <div className="flex gap-2">
                  <button onClick={handleSaveProfile} className="btn btn-primary btn-sm">
                    Save
                  </button>
                  <button onClick={handleCancelEdit} className="btn btn-outline btn-sm">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1>{user.username}</h1>
                <p className="profile-bio">{user.bio || 'No bio yet'}</p>
                <button onClick={handleEditProfile} className="btn btn-outline btn-sm">
                  <Edit size={16} />
                  Edit Profile
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === 'recipes' ? 'active' : ''} flex items-center gap-2`}
          onClick={() => setActiveTab('recipes')}
        >
          <ChefHat size={20} />
          My Recipes ({userRecipes.length})
        </button>
        <button
          className={`profile-tab ${activeTab === 'favorites' ? 'active' : ''} flex items-center gap-2`}
          onClick={() => setActiveTab('favorites')}
        >
          <Heart size={20} />
          Favorites ({favoriteRecipes.length})
        </button>
      </div>

      {activeTab === 'recipes' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">My Recipes</h2>
            <Link to="/add-recipe" className="btn btn-primary">
             
              Add Recipe
            </Link>
          </div>

          {userRecipes.length === 0 ? (
            <div className="empty-state">
              <ChefHat size={64} className="empty-state-icon" />
              <h3>No recipes yet</h3>
              <p>Start sharing your delicious recipes with the community!</p>
              <Link to="/add-recipe" className="btn btn-primary">
                Add Your First Recipe
              </Link>
            </div>
          ) : (
            <div className="recipe-grid">
              {userRecipes.map((recipe) => (
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
        </div>
      )}

      {activeTab === 'favorites' && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Favorite Recipes</h2>

          {favoriteRecipes.length === 0 ? (
            <div className="empty-state">
              <Heart size={64} className="empty-state-icon" />
              <h3>No favorites yet</h3>
              <p>Start exploring recipes and add them to your favorites!</p>
              <Link to="/search" className="btn btn-primary">
                Explore Recipes
              </Link>
            </div>
          ) : (
            <div className="recipe-grid">
              {favoriteRecipes.map((recipe) => (
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
        </div>
      )}
    </div>
  );
};

export default Profile;
