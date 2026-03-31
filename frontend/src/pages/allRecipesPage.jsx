import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function AllRecipesPage() {
  const defaultRecipes = [
    {
      id: 1,
      title: "Spaghetti Carbonara",
      image:
        "https://th.bing.com/th/id/OIP.dxi4Vni_mWnX7mEtt63rBAHaHa?rs=1&pid=ImgDetMain",
      prepTime: "15 mins",
      cookTime: "15 mins",
      category: "Non-Veg",
    },
    {
      id: 2,
      title: "Chicken Tikka Masala",
      image:
        "https://th.bing.com/th/id/OIP.zviMBVRM2Yl06J4zbHwOtAHaJL?rs=1&pid=ImgDetMain",
      prepTime: "20 mins",
      cookTime: "30 mins",
      category: "Non-Veg",
    },
    {
      id: 3,
      title: "Vegetable Stir Fry",
      image:
        "https://th.bing.com/th/id/R.fedfc3cacefdca99a02baa51213acdcc?rik=DpEwQKMph4ufVQ&riu=http%3a%2f%2fwww.thesmalltownfoodie.com%2fwp-content%2fuploads%2f2018%2f05%2fVegetable-Stir-Fry2.png&ehk=o6wDkmOZXCSA6e985EBacQhqiskQnG0jTAPcCftK6w4%3d&risl=&pid=ImgRaw&r=0",
      prepTime: "10 mins",
      cookTime: "10 mins",
      category: "Veg",
    },
    {
      id: 4,
      title: "Beef Bourguignon",
      image:
        "https://th.bing.com/th/id/OIP.liUYvsBDMjpg8QxHiRK36gHaEK?rs=1&pid=ImgDetMain",
      prepTime: "30 mins",
      cookTime: "3 hours",
      category: "Non-Veg",
    },
  ];

  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("title-asc");
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await axios.get("http://localhost:5000/recipes");
        setRecipes([...res.data, ...defaultRecipes]);
      } catch (err) {
        console.warn("⚠️ Falling back to default recipes:", err.message);
        setRecipes(defaultRecipes);
      }
    };

    fetchRecipes();
  }, []);

  const extractMinutes = (str = "") => {
    const match = str.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const filteredRecipes = recipes
    .filter((r) => r.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((r) =>
      categoryFilter === "All" ? true : r.category === categoryFilter
    )
    .sort((a, b) => {
      switch (sortOption) {
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        case "prepTime-asc":
          return extractMinutes(a.prepTime) - extractMinutes(b.prepTime);
        case "prepTime-desc":
          return extractMinutes(b.prepTime) - extractMinutes(a.prepTime);
        case "cookTime-asc":
          return extractMinutes(a.cookTime) - extractMinutes(b.cookTime);
        case "cookTime-desc":
          return extractMinutes(b.cookTime) - extractMinutes(a.cookTime);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Heading + Profile */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-orange-600">All Recipes</h1>
          <Link to="/profile">
            <img
              src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
              alt="Profile"
              className="w-10 h-10 rounded-full border shadow-sm hover:shadow-md transition cursor-pointer"
            />
          </Link>
        </div>

        {/* Control Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 px-4 py-2 border rounded-lg shadow-sm focus:outline-none"
          />

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="w-full md:w-1/4 px-4 py-2 border rounded-lg shadow-sm"
          >
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
            <option value="prepTime-asc">Prep Time (Min to Max)</option>
            <option value="prepTime-desc">Prep Time (Max to Min)</option>
            <option value="cookTime-asc">Cook Time (Min to Max)</option>
            <option value="cookTime-desc">Cook Time (Max to Min)</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full md:w-1/4 px-4 py-2 border rounded-lg shadow-sm"
          >
            <option value="All">All</option>
            <option value="Veg">Veg</option>
            <option value="Non-Veg">Non-Veg</option>
          </select>
        </div>

        {/* Recipe Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe, index) => (
            <div
              key={recipe._id || recipe.id || index}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
            >
              <img
                src={recipe.image || recipe.imageUrl || "/placeholder.jpg"}
                alt={recipe.title}
                onError={(e) => (e.target.src = "/placeholder.jpg")}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {recipe.title}
                </h2>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Prep: {recipe.prepTime || "N/A"}</span>
                  <span>Cook: {recipe.cookTime || "N/A"}</span>
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  Category: {recipe.category || "N/A"}
                </div>
                <Link
                  to={`/recipes/${recipe._id || recipe.id}`}
                  className="block w-full text-center py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                >
                  View Recipe
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Recipe */}
        <div className="mt-8 text-center">
          <Link
            to="/add-recipe"
            className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            Add New Recipe
          </Link>
        </div>
      </div>
    </div>
  );
}
