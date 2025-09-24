import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Plus, X, Upload, ChefHat } from 'lucide-react';
import toast from 'react-hot-toast';

const AddRecipe = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    prepTime: '',
    cookTime: '',
    servings: '',
    calories: '',
    difficulty: 'Easy',
    cuisine: '',
    diet: 'Regular',
    ingredients: [{ name: '', amount: '' }],
    instructions: [{ step: 1, description: '' }]
  });

  React.useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to add recipes');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index][field] = value;
    setFormData(prev => ({
      ...prev,
      ingredients: newIngredients
    }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', amount: '' }]
    }));
  };

  const removeIngredient = (index) => {
    if (formData.ingredients.length > 1) {
      const newIngredients = formData.ingredients.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        ingredients: newIngredients
      }));
    }
  };

  const handleInstructionChange = (index, field, value) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index][field] = value;
    setFormData(prev => ({
      ...prev,
      instructions: newInstructions
    }));
  };

  const addInstruction = () => {
    const nextStep = formData.instructions.length + 1;
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, { step: nextStep, description: '' }]
    }));
  };

  const removeInstruction = (index) => {
    if (formData.instructions.length > 1) {
      const newInstructions = formData.instructions.filter((_, i) => i !== index);
      // Renumber steps
      const renumberedInstructions = newInstructions.map((instruction, i) => ({
        ...instruction,
        step: i + 1
      }));
      setFormData(prev => ({
        ...prev,
        instructions: renumberedInstructions
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          image: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast.error('Please enter a recipe title');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please enter a recipe description');
      return;
    }
    if (!formData.image) {
      toast.error('Please upload a recipe image');
      return;
    }
    if (!formData.cuisine.trim()) {
      toast.error('Please enter the cuisine type');
      return;
    }

    // Validate ingredients
    const validIngredients = formData.ingredients.filter(ing => 
      ing.name.trim() && ing.amount.trim()
    );
    if (validIngredients.length === 0) {
      toast.error('Please add at least one ingredient');
      return;
    }

    // Validate instructions
    const validInstructions = formData.instructions.filter(inst => 
      inst.description.trim()
    );
    if (validInstructions.length === 0) {
      toast.error('Please add at least one instruction');
      return;
    }

    try {
      setLoading(true);
      
      const recipeData = {
        ...formData,
        ingredients: validIngredients,
        instructions: validInstructions,
        prepTime: parseInt(formData.prepTime),
        cookTime: parseInt(formData.cookTime),
        servings: parseInt(formData.servings),
        calories: formData.calories ? parseInt(formData.calories) : undefined
      };

      const response = await api.post('/recipes', recipeData);
      toast.success('Recipe added successfully!');
      navigate(`/recipe/${response.data._id}`);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add recipe';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="form-container">
      <h1 className="form-title">Add New Recipe</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Recipe Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter recipe title"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="form-input form-textarea"
            placeholder="Describe your recipe..."
            rows="3"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Recipe Image <span className="text-red-500">*</span></label>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <label className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors w-full sm:w-64 min-h-[140px]">
              <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M16 10l-4-4m0 0l-4 4m4-4v12" />
              </svg>
              <span className="text-gray-600 text-sm mb-1">Click to upload</span>
              <span className="text-xs text-gray-400">PNG, JPG, JPEG, GIF</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                required
              />
            </label>
            {formData.image && (
              <div className="w-full sm:w-48 mt-4 sm:mt-0">
                <img
                  src={formData.image}
                  alt="Recipe preview"
                  className="w-full h-40 object-cover rounded-lg border border-gray-200 shadow"
                />
                <div className="text-xs text-gray-500 text-center mt-1">Preview</div>
              </div>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Prep Time (minutes) *</label>
            <input
              type="number"
              name="prepTime"
              value={formData.prepTime}
              onChange={handleInputChange}
              className="form-input"
              min="0"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Cook Time (minutes) *</label>
            <input
              type="number"
              name="cookTime"
              value={formData.cookTime}
              onChange={handleInputChange}
              className="form-input"
              min="0"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Servings *</label>
            <input
              type="number"
              name="servings"
              value={formData.servings}
              onChange={handleInputChange}
              className="form-input"
              min="1"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Calories (optional)</label>
            <input
              type="number"
              name="calories"
              value={formData.calories}
              onChange={handleInputChange}
              className="form-input"
              min="0"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Difficulty *</label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleInputChange}
              className="form-input form-select"
              required
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Cuisine *</label>
            <input
              type="text"
              name="cuisine"
              value={formData.cuisine}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., Italian, Mexican, Asian"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Diet Type *</label>
          <select
            name="diet"
            value={formData.diet}
            onChange={handleInputChange}
            className="form-input form-select"
            required
          >
            <option value="Regular">Regular</option>
            <option value="Vegetarian">Vegetarian</option>
            <option value="Vegan">Vegan</option>
            <option value="Gluten-Free">Gluten-Free</option>
            <option value="Keto">Keto</option>
            <option value="Paleo">Paleo</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Ingredients *</label>
          {formData.ingredients.map((ingredient, index) => (
            <div key={index} className="ingredient-row mb-4">
              <input
                type="text"
                value={ingredient.name}
                onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                className="form-input"
                placeholder="Ingredient name"
              />
              <input
                type="text"
                value={ingredient.amount}
                onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                className="form-input"
                placeholder="Amount"
              />
              {formData.ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="remove-btn bg-red-600 flex items-center justify-center size-10 text-white border-none rounded px-2 py-2 cursor-pointer transition-colors duration-200 hover:bg-red-700"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addIngredient}
            className="add-btn flex items-center gap-2"
          >
            <Plus size={16} />
            Add Ingredient
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Instructions *</label>
          {formData.instructions.map((instruction, index) => (
            <div key={index} className="instruction-row mb-4">
              <input
                type="number"
                value={instruction.step}
                className="form-input instruction-number-input"
                disabled
              />
              <textarea
                value={instruction.description}
                onChange={(e) => handleInstructionChange(index, 'description', e.target.value)}
                className="form-input instruction-text-input"
                placeholder="Describe this step..."
                rows="2"
              />
              {formData.instructions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeInstruction(index)}
                  className="remove-btn bg-red-600 flex items-center justify-center size-10 text-white border-none rounded px-2 py-2 cursor-pointer transition-colors duration-200 hover:bg-red-700"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addInstruction}
            className="add-btn flex items-center gap-2"
          >
            <Plus size={16} />
            Add Step
          </button>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Adding Recipe...
              </>
            ) : (
              <>
                
                Add Recipe
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRecipe;
