import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function AddEditRecipePage() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");
  const [category, setCategory] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");

  useEffect(() => {
    if (isEditMode) {
      fetch(`http://localhost:5000/recipes/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setTitle(data.title || "");
          setImageUrl(data.imageUrl || "");
          setPrepTime(data.prepTime || "");
          setCookTime(data.cookTime || "");
          setServings(data.servings || "");
          setCategory(data.category || "");
          setIngredients((data.ingredients || []).join("\n"));
          setInstructions((data.instructions || []).join("\n")); // ✅ FIXED
        })
        .catch((err) => console.error("Failed to fetch recipe:", err));
    }
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !title ||
      !prepTime ||
      !cookTime ||
      !servings ||
      !category ||
      !ingredients ||
      !instructions
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    const newRecipe = {
      title,
      imageUrl,
      prepTime: Number(prepTime),
      cookTime: Number(cookTime),
      servings: Number(servings),
      category,
      ingredients: ingredients
        .split("\n")
        .map((i) => i.trim())
        .filter((line) => line !== ""),
      instructions: instructions // ✅ FIXED
        .split("\n")
        .map((i) => i.trim())
        .filter((line) => line !== ""),
    };

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        isEditMode
          ? `http://localhost:5000/recipes/${id}`
          : "http://localhost:5000/recipes",
        {
          method: isEditMode ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newRecipe),
        }
      );

      if (response.ok) {
        navigate("/recipes");
      } else {
        const errorData = await response.json();
        alert("Error saving recipe: " + JSON.stringify(errorData));
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
      alert("Failed to connect to the server.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6 md:p-8">
        <h1 className="text-3xl font-bold text-orange-600 mb-6">
          {isEditMode ? "Edit Recipe" : "Add New Recipe"}
        </h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <InputField
            label="Recipe Title"
            value={title}
            onChange={setTitle}
            required
          />

          <InputField
            label="Image URL"
            type="url"
            value={imageUrl}
            onChange={setImageUrl}
            placeholder="https://example.com/image.jpg"
          />

          {imageUrl && (
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-64 object-cover rounded-lg shadow"
            />
          )}

          <div>
            <label className="block text-gray-700 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            >
              <option value="">Select Category</option>
              <option value="Veg">Veg / சைவம்</option>
              <option value="Non-Veg">Non-Veg / அசைவம்</option>
              <option value="Dessert">Dessert / இனிப்புகள்</option>
              <option value="Breakfast">Breakfast / காலை உணவு</option>
              <option value="Snack">Snack / சிற்றுண்டி</option>
            </select>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <InputField
              label="Prep Time (mins)"
              type="number"
              value={prepTime}
              onChange={setPrepTime}
              required
            />
            <InputField
              label="Cook Time (mins)"
              type="number"
              value={cookTime}
              onChange={setCookTime}
              required
            />
            <InputField
              label="Servings"
              type="number"
              value={servings}
              onChange={setServings}
              required
            />
          </div>

          <TextAreaField
            label="Ingredients (one per line)"
            value={ingredients}
            onChange={setIngredients}
            minHeight="150px"
            required
          />

          <TextAreaField
            label="Instructions"
            value={instructions}
            onChange={setInstructions}
            minHeight="200px"
            required
          />

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/recipes")}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              {isEditMode ? "Update Recipe" : "Save Recipe"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
}) {
  return (
    <div>
      <label className="block text-gray-700 mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  required = false,
  placeholder = "",
  minHeight = "100px",
}) {
  return (
    <div>
      <label className="block text-gray-700 mb-2">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        style={{ minHeight }}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}
