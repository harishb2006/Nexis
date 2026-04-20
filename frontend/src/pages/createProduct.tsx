import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from '../axiosConfig';
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import NavBar from "../components/auth/nav";

// --- Type Definitions ---

interface RootState {
  user: {
    email: string | null;
  };
}

interface Category {
  title: string;
}

const CreateProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const loggedInEmail = useSelector((state: RootState) => state.user.email);
  
  const [images, setImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [stock, setStock] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const categoriesData: Category[] = [
      { title: "Electronics" },
      { title: "Fashion" },
      { title: "Books" },
      { title: "Home Appliances" },
  ];

  // Auto-populate email from Redux when component mounts
  useEffect(() => {
      if (loggedInEmail && !isEdit) {
          setEmail(loggedInEmail);
      }
  }, [loggedInEmail, isEdit]);

  useEffect(() => {
      if (isEdit) {
          axios
              .get(`/api/v2/product/product/${id}`)
              .then((response) => {
                  const p = response.data.product;
                  setName(p.name);
                  setDescription(p.description);
                  setCategory(p.category);
                  setTags(p.tags || "");
                  setPrice(p.price);
                  setStock(p.stock);
                  setEmail(p.email);
                  if (p.images && p.images.length > 0) {
                      const backendURL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';
                      setPreviewImages(
                        p.images.map(
                          (imgPath: string) => `${backendURL}/${imgPath}`
                        )
                      );
                  }
              })
              .catch((err) => {
                  console.error("Failed to load product details", err);
              });
      }
  }, [id, isEdit]);

  const handleImagesChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
    const imagePreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages((prevPreviews) => [...prevPreviews, ...imagePreviews]);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("category", category);
        formData.append("tags", tags);
        formData.append("price", price);
        formData.append("stock", stock);
        formData.append("email", email);

        images.forEach((image) => {
            formData.append("images", image);
        });

        try {
          if (isEdit) {
            const response = await axios.put(`/api/v2/product/update-product/${id}`, formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            if (response.status === 200) {
                navigate("/my-products");
            }
        } else {
            const response = await axios.post("/api/v2/product/create-product", formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            if (response.status === 201) {
                setImages([]);
                setPreviewImages([]);
                setName("");
                setDescription("");
                setCategory("");
                setTags("");
                setPrice("");
                setStock("");
                setEmail("");
                navigate("/my-products");
            }
        }
    } catch (err: any) {
        console.error("Failed to save product", err);
        alert("Failed to save product. Please check the data and try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
        <div className="min-h-screen w-full relative" style={{
            backgroundColor: "#f8fafc",
            backgroundImage: `radial-gradient(#cbd5e1 1.5px, transparent 1.5px)`,
            backgroundSize: '30px 30px',
            backgroundAttachment: 'fixed'
        }}>
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-0"></div>
            <NavBar />

            <main className="relative z-10 pt-32 pb-20 px-4 flex justify-center items-start">
                <div className="w-full max-w-[600px] bg-white/80 backdrop-blur-md rounded-[2rem] border border-gray-100 shadow-sm p-8 lg:p-10">
                    <div className="mb-8 text-center border-b border-gray-100 pb-6">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                            {isEdit ? "Edit " : "Create "} 
                            <span className="text-indigo-600">Product</span>
                        </h1>
                        <p className="text-gray-500 mt-2 text-sm">Enter the product details below</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-900 mb-1.5 uppercase tracking-wide">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-gray-900 placeholder-gray-400"
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter product name"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-900 mb-1.5 uppercase tracking-wide">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-gray-900 placeholder-gray-400 resize-none"
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Enter product description"
                                    rows={4}
                                    required
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1.5 uppercase tracking-wide">
                                    Category
                                </label>
                                <select
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-gray-900"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Choose a category</option>
                                    {categoriesData.map((i) => (
                                        <option value={i.title} key={i.title}>
                                            {i.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1.5 uppercase tracking-wide flex justify-between">
                                    Tags <span className="text-gray-400 font-normal normal-case">Optional</span>
                                </label>
                                <input
                                    type="text"
                                    value={tags}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-gray-900 placeholder-gray-400"
                                    onChange={(e) => setTags(e.target.value)}
                                    placeholder="Comma separated tags"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1.5 uppercase tracking-wide">
                                    Price
                                </label>
                                <input
                                    type="number"
                                    value={price}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-gray-900 placeholder-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="0.00"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1.5 uppercase tracking-wide">
                                    Stock
                                </label>
                                <input
                                    type="number"
                                    value={stock}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-gray-900 placeholder-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    onChange={(e) => setStock(e.target.value)}
                                    placeholder="Quantity available"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-900 mb-1.5 uppercase tracking-wide flex justify-between">
                                    Seller Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none transition-all text-sm font-medium ${!isEdit && loggedInEmail ? 'bg-gray-50 text-gray-500' : 'bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'}`}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    readOnly={!isEdit && Boolean(loggedInEmail)}
                                    required
                                />
                            </div>

                            <div className="md:col-span-2 pt-2">
                                <label className="block text-sm font-semibold text-gray-900 mb-1.5 uppercase tracking-wide flex justify-between">
                                    {isEdit ? "Images" : "Upload Images"}
                                    {isEdit && <span className="text-gray-400 font-normal normal-case">Upload New (Optional)</span>}
                                </label>
                                
                                <input
                                    name="image"
                                    type="file"
                                    id="upload"
                                    className="hidden"
                                    multiple
                                    onChange={handleImagesChange}
                                    required={!isEdit && previewImages.length === 0}
                                />
                                
                                <label htmlFor="upload" className="cursor-pointer flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/50 transition-all text-sm font-semibold text-gray-600 uppercase tracking-wide">
                                    Select Files
                                </label>

                                {previewImages.length > 0 && (
                                    <div className="flex flex-wrap gap-4 mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        {previewImages.map((img, index) => (
                                            <div key={index} className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm w-[80px] h-[80px]">
                                                <img
                                                    src={img}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isSubmitting ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Product')}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default CreateProduct;