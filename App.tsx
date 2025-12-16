import React, { createContext, useContext, useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from './components/layout';
import { Button, Input, Card, Badge, Icons, Alert, Textarea, StarRating, Toast, ConfirmationModal } from './components/ui';
import * as API from './services/api';
import { User, UserRole, Attraction, Post, Product, CartItem, Order } from './types';

// --- CONTEXTS ---

interface AuthContextType {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType>({ user: null, login: () => {}, logout: () => {} });
export const useAuth = () => useContext(AuthContext);

interface CartContextType {
  cart: CartItem[];
  addToCart: (p: Product, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}
const CartContext = createContext<CartContextType>({ cart: [], addToCart: () => {}, removeFromCart: () => {}, clearCart: () => {} });
export const useCart = () => useContext(CartContext);

// New Notification Context
interface NotificationContextType {
  notify: (message: string, type?: 'success' | 'error' | 'info') => void;
  confirm: (message: string, onConfirm: () => void) => void;
}
const NotificationContext = createContext<NotificationContextType>({ notify: () => {}, confirm: () => {} });
export const useNotification = () => useContext(NotificationContext);


// --- STATIC REGION DATA FOR CASCADING SELECTS ---
// In a real app, this should be fetched from an API
const REGION_DATA: Record<string, Record<string, string[]>> = {
  '北京市': {
    '北京市': ['东城区', '西城区', '朝阳区', '海淀区', '丰台区', '延庆区']
  },
  '四川省': { 
    '成都市': ['锦江区', '青羊区', '金牛区', '武侯区', '成华区', '都江堰市'],
    '阿坝藏族羌族自治州': ['马尔康市', '九寨沟县', '若尔盖县']
  },
  '浙江省': {
    '杭州市': ['上城区', '拱墅区', '西湖区', '滨江区']
  }
};

const uniqueTags = Array.from(new Set([
  'Nature', 'Hiking', 'Water', 
  'History', 'Culture', 'Shopping', 
  'Ocean', 'Mountain', 'Animals', 'Architecture', 'Family'
])).sort();

// --- PAGES ---

// 1. HOME & ATTRACTIONS
const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);

  // Read state from URL
  const query = searchParams.get('q') || '';
  const province = searchParams.get('province') || '';
  const city = searchParams.get('city') || '';
  const county = searchParams.get('county') || '';
  const tag = searchParams.get('tag') || '';

  // Calculate available options based on selection
  const provinces = Object.keys(REGION_DATA);
  const cities = province && REGION_DATA[province] ? Object.keys(REGION_DATA[province]) : [];
  const counties = province && city && REGION_DATA[province][city] ? REGION_DATA[province][city] : [];

  useEffect(() => {
    setLoading(true);
    API.getAttractions({ province, city, county, query, tag }).then(res => {
      if (res.data) setAttractions(res.data);
      setLoading(false);
    });
  }, [query, province, city, county, tag]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }

    // Reset dependent fields
    if (key === 'province') {
      newParams.delete('city');
      newParams.delete('county');
    }
    if (key === 'city') {
      newParams.delete('county');
    }

    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4 py-10 bg-blue-50 rounded-xl px-4">
        <h1 className="text-4xl font-extrabold text-blue-900">Discover China's Wonders</h1>
        <p className="text-lg text-blue-700 max-w-2xl mx-auto">Explore hidden gems across provinces, cities, and counties.</p>
        
        {/* Search & Filter Controls */}
        <div className="max-w-4xl mx-auto space-y-4 mt-6">
          <div className="relative">
            <Input 
              placeholder="Search attractions by name or description..." 
              value={query} 
              onChange={(e) => updateFilter('q', e.target.value)} 
              className="pl-10"
            />
            <div className="absolute top-2.5 left-3 text-gray-400"><Icons.Search /></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
             {/* Province Select */}
            <select 
              className="bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
              value={province}
              onChange={(e) => updateFilter('province', e.target.value)}
            >
              <option value="">All Provinces</option>
              {provinces.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            {/* City Select */}
            <select 
              className="bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-full disabled:bg-gray-100 disabled:text-gray-400"
              value={city}
              onChange={(e) => updateFilter('city', e.target.value)}
              disabled={!province}
            >
              <option value="">All Cities</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

             {/* County Select */}
            <select 
              className="bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-full disabled:bg-gray-100 disabled:text-gray-400"
              value={county}
              onChange={(e) => updateFilter('county', e.target.value)}
              disabled={!city}
            >
              <option value="">All Districts/Counties</option>
              {counties.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Tag Select */}
            <select 
              className="bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
              value={tag}
              onChange={(e) => updateFilter('tag', e.target.value)}
            >
              <option value="">All Tags</option>
              {uniqueTags.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          
          {(query || province || tag) && (
            <div className="flex justify-center">
              <Button variant="ghost" onClick={clearFilters} className="text-sm">
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {(query || province || city || tag) ? 'Search Results' : 'Featured Attractions'}
        </h2>
        {loading ? <div className="text-center py-10">Loading...</div> : (
          <>
            {attractions.length === 0 ? (
              <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg">
                No attractions found matching your criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {attractions.map(attr => (
                  <Card key={attr.id} className="hover:shadow-md transition-shadow flex flex-col h-full">
                    <img src={attr.imageUrl} alt={attr.title} className="w-full h-48 object-cover" />
                    <div className="p-4 flex flex-col flex-grow">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {attr.province && <Badge color="blue">{attr.province}</Badge>}
                        {attr.city && <Badge color="indigo">{attr.city}</Badge>}
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-gray-900">{attr.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">{attr.description}</p>
                      <div className="flex flex-wrap gap-1 mb-4">
                         {attr.tags.slice(0, 3).map(t => <Badge key={t} color="green">{t}</Badge>)}
                      </div>
                      <Link to={`/attractions/${attr.id}`} className="mt-auto">
                        <Button variant="secondary" className="w-full text-sm">View Details</Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const AttractionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { notify, confirm } = useNotification();
  const [attraction, setAttraction] = useState<Attraction | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New Review Form State
  const [newPostContent, setNewPostContent] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      Promise.all([
        API.getAttractionById(id),
        API.getPosts(id),
        API.getProducts(undefined, id)
      ]).then(([attrRes, postRes, prodRes]) => {
        if (attrRes.data) setAttraction(attrRes.data);
        if (postRes.data) setPosts(postRes.data);
        if (prodRes.data) setProducts(prodRes.data);
        setLoading(false);
      });
    }
  }, [id]);

  const handlePostSubmit = async () => {
    if (!newPostContent.trim() || !user || !id) return;
    setIsSubmitting(true);
    
    let uploadedImageUrl = '';
    if (selectedFile) {
        uploadedImageUrl = await API.uploadFile(selectedFile);
    }

    const res = await API.createPost({
      attractionId: id,
      userId: user.id,
      username: user.username,
      content: newPostContent,
      rating: newRating,
      imageUrl: uploadedImageUrl
    });

    if (res.success && res.data) {
      setPosts([res.data, ...posts]);
      setNewPostContent('');
      setNewRating(5);
      setSelectedFile(null);
      notify("Review posted successfully!", "success");
    }
    setIsSubmitting(false);
  };

  const handleReport = (postId: string) => {
    confirm("Report this review? It will be submitted for admin moderation.", async () => {
      await API.reportPost(postId);
      setPosts(posts.filter(p => p.id !== postId));
      notify("Review reported. It has been hidden and sent to admins for review.", "info");
    });
  };

  if (loading) return <div>Loading...</div>;
  if (!attraction) return <div>Not found</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div>
          <img src={attraction.imageUrl} alt={attraction.title} className="w-full h-80 object-cover rounded-xl shadow-sm mb-6" />
          
          {/* Gallery Grid */}
          {attraction.gallery && attraction.gallery.length > 0 && (
             <div className="grid grid-cols-4 gap-2 mb-6">
                {attraction.gallery.map((img, idx) => (
                   <img key={idx} src={img} alt={`Gallery ${idx}`} className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-90" />
                ))}
             </div>
          )}

          <Card className="p-6">
            <h1 className="text-3xl font-bold mb-4">{attraction.title}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              {attraction.province && <Badge color="blue">{attraction.province}</Badge>}
              {attraction.city && <Badge color="indigo">{attraction.city}</Badge>}
              {attraction.county && <Badge color="purple">{attraction.county}</Badge>}
              {attraction.tags.map(tag => <Badge key={tag} color="green">{tag}</Badge>)}
            </div>
            <p className="text-gray-700 leading-relaxed mb-6">{attraction.description}</p>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Address</p>
                <div className="flex items-start gap-2">
                  <Icons.MapPin /> {attraction.address}
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Open Hours</p>
                <p>{attraction.openHours || 'Not specified'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="font-semibold text-gray-900">Driving Tips</p>
                <p className="italic">{attraction.drivingTips}</p>
              </div>
            </div>
            
            <div className="mt-6">
               <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(attraction.address)}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-2 font-medium">
                 View on External Map &rarr;
               </a>
            </div>
          </Card>
        </div>

        {/* Featured Products Section */}
        {products.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Icons.ShoppingBag />
              Featured Local Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map(product => (
                 <Card key={product.id} className="p-4 flex gap-4">
                    <Link to={`/products/${product.id}`} className="flex-shrink-0">
                      <img src={product.imageUrl} alt={product.name} className="w-24 h-24 object-cover rounded" />
                    </Link>
                    <div className="flex flex-col justify-between flex-grow">
                       <div>
                          <Link to={`/products/${product.id}`} className="font-bold line-clamp-1 hover:text-blue-600">{product.name}</Link>
                          <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                       </div>
                       <div className="flex justify-between items-center mt-2">
                          <span className="font-bold text-blue-600">${product.price}</span>
                          {user?.role !== UserRole.MERCHANT && (
                            <Button onClick={() => addToCart(product, 1)} variant="secondary" className="px-2 py-1 text-xs">Add</Button>
                          )}
                       </div>
                    </div>
                 </Card>
              ))}
            </div>
          </div>
        )}

        {/* Community Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4">Community Reviews</h2>
          
          {user ? (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Your Rating:</span>
                <StarRating rating={newRating} onRatingChange={setNewRating} />
              </div>
              <Textarea 
                placeholder="Share your experience..." 
                value={newPostContent} 
                onChange={e => setNewPostContent(e.target.value)} 
              />
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2">
                     <label className="cursor-pointer flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                         <Icons.Camera />
                         <span>{selectedFile ? selectedFile.name : 'Add Photo'}</span>
                         <input type="file" accept="image/*" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                     </label>
                     {selectedFile && <button onClick={() => setSelectedFile(null)} className="text-xs text-red-500"><Icons.Trash/></button>}
                 </div>
                 <Button onClick={handlePostSubmit} disabled={!newPostContent || isSubmitting} isLoading={isSubmitting}>Post Review</Button>
              </div>
            </div>
          ) : (
            <Alert type="success">Login to share your experience!</Alert>
          )}

          <div className="space-y-6">
            {posts.length === 0 && <p className="text-gray-500 italic">No reviews yet.</p>}
            {posts.map(post => (
              <div key={post.id} className="border-b border-gray-100 last:border-0 pb-6">
                <div className="flex justify-between items-start mb-2">
                   <div className="flex items-center gap-2">
                     <div className="bg-blue-100 p-1 rounded-full"><Icons.User /></div>
                     <div>
                        <div className="font-medium text-sm flex items-center gap-2">
                            {post.username}
                            {post.rating && <StarRating rating={post.rating} readonly />}
                        </div>
                        <div className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</div>
                     </div>
                   </div>
                   {user && <button onClick={() => handleReport(post.id)} className="text-xs text-gray-400 hover:text-red-500 underline">Report</button>}
                </div>
                <p className="text-gray-700 leading-relaxed">{post.content}</p>
                {post.imageUrl && <img src={post.imageUrl} alt="User upload" className="mt-3 w-48 h-48 object-cover rounded-lg border border-gray-100" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <Card className="p-4 bg-yellow-50 border-yellow-100">
           <h3 className="font-bold text-yellow-800 mb-2">Traveler Tips</h3>
           <p className="text-sm text-yellow-700">Remember to check weather conditions before visiting natural attractions. Stay safe!</p>
        </Card>
      </div>
    </div>
  );
};

// 2. COMMERCE
const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const { addToCart } = useCart(); // Use hook directly
  const { user } = useAuth(); // Get user from auth context directly

  useEffect(() => {
    API.getProducts().then(res => res.data && setProducts(res.data));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Local Marketplace</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <Card key={product.id} className="flex flex-col h-full">
            <Link to={`/products/${product.id}`} className="block">
              <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover hover:opacity-90 transition-opacity" />
            </Link>
            <div className="p-4 flex flex-col flex-grow">
              <Link to={`/products/${product.id}`} className="block">
                <h3 className="font-bold text-lg hover:text-blue-600 transition-colors">{product.name}</h3>
              </Link>
              <div className="mb-2">
                 <p className="text-gray-500 text-xs">Sold by {product.merchantName}</p>
                 {product.attractionName && (
                   <Link to={`/attractions/${product.attractionId}`} className="text-xs text-purple-600 font-medium hover:underline block mt-1">
                     📍 {product.attractionName}
                   </Link>
                 )}
              </div>
              <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3">{product.description}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-lg font-bold text-blue-600">${product.price.toFixed(2)}</span>
                {user?.role !== UserRole.MERCHANT && (
                  <Button onClick={() => addToCart(product, 1)} className="text-xs" variant="secondary">
                     Add to Cart
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      API.getProductById(id).then(res => {
        if (res.data) setProduct(res.data);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!product) return <div className="text-center py-10">Product not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
       <Link to="/products" className="text-gray-500 hover:text-blue-600 mb-4 inline-block">&larr; Back to Marketplace</Link>
       <div className="grid md:grid-cols-2 gap-8 bg-white p-6 rounded-xl shadow-sm">
         <img src={product.imageUrl} alt={product.name} className="w-full h-80 object-cover rounded-lg" />
         <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex flex-col gap-1 mb-6 border-b border-gray-100 pb-4">
              <span className="text-sm text-gray-500">Sold by {product.merchantName}</span>
              {product.attractionName && (
                <div className="flex items-center gap-1 text-sm text-purple-700 font-medium">
                  <Icons.MapPin />
                  <span>Available at: </span>
                  <Link to={`/attractions/${product.attractionId}`} className="hover:underline">
                    {product.attractionName}
                  </Link>
                </div>
              )}
            </div>
            
            <div className="text-2xl font-bold text-blue-600 mb-6">${product.price.toFixed(2)}</div>
            
            <p className="text-gray-700 mb-8 leading-relaxed flex-grow">{product.description}</p>
            
            <div className="mt-auto pt-6 border-t border-gray-100">
               <div className="flex items-center justify-between mb-4">
                 <span className="text-sm text-gray-600">In Stock: {product.stock}</span>
               </div>
               {user?.role !== UserRole.MERCHANT && (
                  <Button onClick={() => addToCart(product, 1)} className="w-full py-3 text-lg">
                    Add to Cart
                  </Button>
               )}
            </div>
         </div>
       </div>
    </div>
  );
};

const CartPage = () => {
  const { cart, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const res = await API.createOrder({
      userId: user.id,
      items: cart,
      total
    });
    if (res.success) {
      clearCart();
      notify('Order placed successfully!', 'success');
      navigate('/orders');
    }
  };

  if (cart.length === 0) return <div className="text-center py-20 text-gray-500">Your cart is empty.</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
      <Card className="divide-y divide-gray-100">
        {cart.map(item => (
          <div key={item.id} className="p-4 flex items-center gap-4">
            <Link to={`/products/${item.id}`}>
               <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded" />
            </Link>
            <div className="flex-grow">
              <Link to={`/products/${item.id}`} className="font-medium hover:text-blue-600">{item.name}</Link>
              <p className="text-sm text-gray-500">${item.price} x {item.quantity}</p>
            </div>
            <div className="font-bold">${(item.price * item.quantity).toFixed(2)}</div>
            <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded">
              <Icons.Trash />
            </button>
          </div>
        ))}
        <div className="p-4 bg-gray-50 flex justify-between items-center">
          <span className="font-bold text-lg">Total</span>
          <span className="font-bold text-xl text-blue-600">${total.toFixed(2)}</span>
        </div>
      </Card>
      <div className="mt-6 flex justify-end gap-4">
        <Button variant="ghost" onClick={clearCart}>Clear Cart</Button>
        <Button onClick={handleCheckout}>Checkout</Button>
      </div>
    </div>
  );
};

// 3. AUTH PAGES
const AuthPage: React.FC<{ type: 'login' | 'register' }> = ({ type }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(UserRole.TRAVELER); // Only for register
  const [qualificationFile, setQualificationFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      let res;
      if (type === 'login') {
        res = await API.login(email, password);
      } else {
        if (role === UserRole.MERCHANT && !qualificationFile) {
            setError('Merchants must upload a qualification document (e.g., Business License).');
            setLoading(false);
            return;
        }

        let qualUrl = '';
        if (qualificationFile) {
            qualUrl = await API.uploadFile(qualificationFile);
        }

        res = await API.register({ 
            email, 
            username: email.split('@')[0], 
            role, 
            qualificationUrl: qualUrl 
        }, password);
      }

      if (res.success && res.data) {
        login(res.data);
        navigate('/');
      } else {
        setError(res.message || 'An error occurred');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card className="p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">{type === 'login' ? 'Welcome Back' : 'Join WanderMart'}</h1>
        {error && <Alert>{error}</Alert>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          
          {type === 'register' && (
             <div className="mb-4 space-y-4">
               <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">I am a...</label>
                   <select className="w-full border border-gray-300 rounded px-3 py-2" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
                     <option value={UserRole.TRAVELER}>Traveler</option>
                     <option value={UserRole.MERCHANT}>Merchant</option>
                   </select>
               </div>
               
               {role === UserRole.MERCHANT && (
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business License / Qualification</label>
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        onChange={(e) => setQualificationFile(e.target.files?.[0] || null)}
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload an image of your business license for admin approval.</p>
                 </div>
               )}
             </div>
          )}

          <Button type="submit" className="w-full" isLoading={loading}>{type === 'login' ? 'Login' : 'Sign Up'}</Button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-600">
          {type === 'login' ? "Don't have an account? " : "Already have an account? "}
          <Link to={type === 'login' ? '/register' : '/login'} className="text-blue-600 font-medium">
            {type === 'login' ? 'Sign up' : 'Login'}
          </Link>
        </div>
        
        {type === 'login' && (
          <div className="mt-6 p-4 bg-gray-50 text-xs text-gray-500 rounded border border-gray-200">
            <p className="font-bold mb-1">Demo Credentials:</p>
            <p>Admin: admin@test.com</p>
            <p>Merchant: merchant@test.com (Active)</p>
            <p>Traveler: user@test.com</p>
            <p>Pass: any</p>
          </div>
        )}
      </Card>
    </div>
  );
};

// 4. ROLE DASHBOARDS
const MerchantDashboard = () => {
  const { user } = useAuth();
  const { notify } = useNotification();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>([]); // To populate select
  const [isAdding, setIsAdding] = useState(false);
  
  // New Product Form State
  const [newItem, setNewItem] = useState<Partial<Product>>({ name: '', price: 0, stock: 1, description: '', attractionId: '' });
  const [productImage, setProductImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user && user.status === 'active') {
      API.getProducts(user.id).then(res => res.data && setProducts(res.data));
      API.getOrders(undefined, user.id).then(res => res.data && setOrders(res.data));
      // Fetch attractions for the dropdown (no filters needed)
      API.getAttractions({}).then(res => res.data && setAttractions(res.data));
    }
  }, [user]);

  if (!user) return null;

  if (user.status === 'pending') {
      return (
          <Card className="p-12 text-center max-w-2xl mx-auto mt-10">
              <div className="text-yellow-500 mb-4 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              </div>
              <h1 className="text-2xl font-bold mb-2">Account Pending Approval</h1>
              <p className="text-gray-600 mb-6">Your merchant application has been submitted and is currently under review by our administrators. Please check back later.</p>
              <Button onClick={() => window.location.reload()} variant="secondary">Check Status Again</Button>
          </Card>
      );
  }

  if (user.status === 'rejected') {
      return (
          <Alert type="error">
              <h3 className="font-bold">Application Rejected</h3>
              <p>Your merchant application was not approved. Please contact support for more details.</p>
          </Alert>
      );
  }

  const handleAddProduct = async () => {
    setUploading(true);
    let imageUrl = newItem.imageUrl;
    if (productImage) {
        imageUrl = await API.uploadFile(productImage);
    } else if (!imageUrl) {
        imageUrl = `https://picsum.photos/400/400?random=${Date.now()}`; 
    }

    const res = await API.createProduct({ 
        ...newItem, 
        merchantId: user.id, 
        merchantName: user.username,
        imageUrl
    });
    
    if (res.success && res.data) {
      setProducts([...products, res.data]);
      setIsAdding(false);
      setNewItem({ name: '', price: 0, stock: 1, description: '', attractionId: '' });
      setProductImage(null);
      notify("Product added successfully", "success");
    }
    setUploading(false);
  };

  const handleShipOrder = async (orderId: string) => {
      const tracking = trackingInputs[orderId];
      if (!tracking) {
          notify("Please enter a tracking number.", "error");
          return;
      }
      
      const res = await API.updateOrderStatus(orderId, 'shipped', tracking);
      if (res.success) {
          setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'shipped', trackingNumber: tracking } : o));
          notify("Order marked as shipped!", "success");
      }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Store Dashboard</h1>
        <Button onClick={() => setIsAdding(!isAdding)}>{isAdding ? 'Cancel' : 'Add New Product'}</Button>
      </div>

      {isAdding && (
        <Card className="p-6 bg-blue-50 border-blue-100">
           <h3 className="font-bold mb-4">Add Product</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Input label="Name" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
             <Input label="Price" type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: parseFloat(e.target.value)})} />
             <Input label="Stock" type="number" value={newItem.stock} onChange={e => setNewItem({...newItem, stock: parseInt(e.target.value)})} />
             <div className="md:col-span-2">
               <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
               <input 
                  type="file" 
                  accept="image/*" 
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                  onChange={e => setProductImage(e.target.files?.[0] || null)}
               />
             </div>
             <div className="md:col-span-2">
               <label className="block text-sm font-medium text-gray-700 mb-1">Associated Attraction (Optional)</label>
               <select 
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={newItem.attractionId || ''} 
                  onChange={e => setNewItem({...newItem, attractionId: e.target.value})}
               >
                 <option value="">None (General Product)</option>
                 {attractions.map(attr => (
                   <option key={attr.id} value={attr.id}>{attr.title}</option>
                 ))}
               </select>
               <p className="text-xs text-gray-500 mt-1">If selected, this product will appear on the attraction's detail page.</p>
             </div>
             <div className="md:col-span-2">
                <Input label="Description" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
             </div>
           </div>
           <Button className="mt-4" onClick={handleAddProduct} isLoading={uploading} disabled={uploading}>Save Product</Button>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Your Products</h2>
          <div className="space-y-3">
            {products.map(p => (
              <div key={p.id} className="flex justify-between p-3 bg-white border rounded shadow-sm">
                <div className="flex gap-3">
                  <img src={p.imageUrl} alt="product" className="w-12 h-12 rounded object-cover" />
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-gray-500">Stock: {p.stock} | ${p.price}</div>
                    {p.attractionName && <span className="text-xs text-purple-600 block mt-1">📍 {p.attractionName}</span>}
                  </div>
                </div>
                {p.attractionId && (
                  <Badge color="purple">Linked</Badge>
                )}
              </div>
            ))}
            {products.length === 0 && <p className="text-gray-500">No products yet.</p>}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
          <div className="space-y-4">
            {orders.map(o => (
              <Card key={o.id} className="p-4 bg-white border rounded shadow-sm">
                <div className="flex justify-between mb-3">
                   <div>
                       <span className="font-medium text-sm block">Order #{o.id.slice(-6)}</span>
                       <span className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</span>
                   </div>
                   <Badge color={o.status === 'delivered' ? 'green' : o.status === 'shipped' ? 'blue' : 'yellow'}>{o.status}</Badge>
                </div>
                
                <div className="text-sm text-gray-600 mb-3 space-y-1 bg-gray-50 p-2 rounded">
                    {o.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                            <span>{item.name} x{item.quantity}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className="border-t border-gray-200 pt-1 mt-1 font-bold text-right">
                        Total: ${o.total.toFixed(2)}
                    </div>
                </div>

                {o.status === 'pending' && (
                    <div className="flex gap-2 items-end">
                        <div className="flex-grow">
                            <label className="text-xs text-gray-500 mb-1 block">Tracking Number</label>
                            <input 
                                className="w-full text-sm border rounded px-2 py-1"
                                placeholder="Enter tracking #"
                                value={trackingInputs[o.id] || ''}
                                onChange={(e) => setTrackingInputs({...trackingInputs, [o.id]: e.target.value})}
                            />
                        </div>
                        <Button onClick={() => handleShipOrder(o.id)} className="py-1 text-sm h-8">Ship</Button>
                    </div>
                )}
                {o.status === 'shipped' && (
                    <div className="text-sm text-blue-600">
                        Tracking: <span className="font-mono bg-blue-50 px-1 rounded">{o.trackingNumber}</span>
                    </div>
                )}
              </Card>
            ))}
             {orders.length === 0 && <p className="text-gray-500">No orders yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [reports, setReports] = useState<Post[]>([]);
  const [pendingMerchants, setPendingMerchants] = useState<User[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [activeTab, setActiveTab] = useState<'content' | 'users' | 'attractions'>('content');
  const { notify, confirm } = useNotification();

  // Attraction Form State
  const [editingAttr, setEditingAttr] = useState<Partial<Attraction> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [attrImageFile, setAttrImageFile] = useState<File | null>(null);

  useEffect(() => {
    API.getReportedContent().then(res => res.data && setReports(res.data));
    API.getPendingMerchants().then(res => res.data && setPendingMerchants(res.data));
    API.getAttractions({}).then(res => res.data && setAttractions(res.data));
  }, []);

  const handleModeration = async (id: string, action: 'approve' | 'delete') => {
    await API.moderateContent(id, action);
    setReports(reports.filter(r => r.id !== id));
    notify(action === 'delete' ? "Post deleted" : "Post approved", "success");
  };

  const handleMerchantApproval = async (id: string, status: 'active' | 'rejected') => {
      await API.updateUserStatus(id, status);
      setPendingMerchants(pendingMerchants.filter(u => u.id !== id));
      notify(`User ${status === 'active' ? 'Approved' : 'Rejected'}`, status === 'active' ? "success" : "info");
  };

  const handleSaveAttraction = async () => {
      if (!editingAttr) return;
      
      let imageUrl = editingAttr.imageUrl;
      if (attrImageFile) {
          imageUrl = await API.uploadFile(attrImageFile);
      }

      const payload = { ...editingAttr, imageUrl };

      if (editingAttr.id) {
          // Update
          const res = await API.updateAttraction(editingAttr.id, payload);
          if (res.success && res.data) {
              setAttractions(attractions.map(a => a.id === res.data!.id ? res.data! : a));
          }
      } else {
          // Create
          const res = await API.createAttraction(payload);
          if (res.success && res.data) {
              setAttractions([res.data!, ...attractions]);
          }
      }
      setIsEditing(false);
      setEditingAttr(null);
      setAttrImageFile(null);
      notify("Attraction saved successfully", "success");
  };

  const handleDeleteAttraction = (id: string) => {
      confirm("Are you sure? This cannot be undone.", async () => {
          await API.deleteAttraction(id);
          setAttractions(attractions.filter(a => a.id !== id));
          notify("Attraction deleted", "info");
      });
  };

  const openEdit = (attr?: Attraction) => {
      setEditingAttr(attr || { title: '', description: '', address: '', province: '', city: '', county: '', tags: [] });
      setIsEditing(true);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="flex gap-4 mb-6 border-b overflow-x-auto">
          <button 
            className={`pb-2 px-1 whitespace-nowrap ${activeTab === 'content' ? 'border-b-2 border-blue-600 font-bold text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('content')}
          >
              Content Moderation
          </button>
          <button 
            className={`pb-2 px-1 whitespace-nowrap ${activeTab === 'users' ? 'border-b-2 border-blue-600 font-bold text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('users')}
          >
              Merchant Approvals ({pendingMerchants.length})
          </button>
          <button 
            className={`pb-2 px-1 whitespace-nowrap ${activeTab === 'attractions' ? 'border-b-2 border-blue-600 font-bold text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('attractions')}
          >
              Attractions
          </button>
      </div>

      {activeTab === 'content' && (
        <div>
          {reports.length === 0 ? <Alert type="success">All caught up! No reported content.</Alert> : (
            <div className="space-y-4">
              {reports.map(post => (
                <Card key={post.id} className="p-4">
                   <div className="flex justify-between">
                     <h3 className="font-bold">Reported Post</h3>
                     <span className="text-sm text-gray-500">By {post.username}</span>
                   </div>
                   <p className="my-3 bg-gray-50 p-2 rounded">{post.content}</p>
                   {post.imageUrl && (
                     <div className="mb-3">
                        <span className="text-xs font-semibold text-gray-500 mb-1 block">Attached Image:</span>
                        <img src={post.imageUrl} alt="Reported content" className="h-32 w-auto object-cover rounded border" />
                     </div>
                   )}
                   <div className="flex gap-2">
                     <Button variant="danger" onClick={() => handleModeration(post.id, 'delete')} className="text-sm">Delete</Button>
                     <Button variant="secondary" onClick={() => handleModeration(post.id, 'approve')} className="text-sm">Approve (Ignore Report)</Button>
                   </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
          <div>
              {pendingMerchants.length === 0 ? <Alert type="success">No pending merchant applications.</Alert> : (
                  <div className="grid gap-6">
                      {pendingMerchants.map(user => (
                          <Card key={user.id} className="p-6">
                              <div className="flex flex-col md:flex-row gap-6">
                                  {user.qualificationUrl && (
                                      <div className="w-full md:w-1/3">
                                          <p className="text-sm font-bold mb-2 text-gray-500">Qualification Document</p>
                                          <a href={user.qualificationUrl} target="_blank" rel="noreferrer">
                                            <img src={user.qualificationUrl} alt="License" className="w-full h-48 object-cover rounded border hover:opacity-90" />
                                          </a>
                                      </div>
                                  )}
                                  <div className="flex-grow">
                                      <h3 className="text-xl font-bold">{user.username}</h3>
                                      <p className="text-gray-600 mb-2">{user.email}</p>
                                      <Badge color="yellow">Pending Approval</Badge>
                                      
                                      <div className="mt-6 flex gap-3">
                                          <Button onClick={() => handleMerchantApproval(user.id, 'active')} className="bg-green-600 hover:bg-green-700">Approve Merchant</Button>
                                          <Button onClick={() => handleMerchantApproval(user.id, 'rejected')} variant="danger">Reject Application</Button>
                                      </div>
                                  </div>
                              </div>
                          </Card>
                      ))}
                  </div>
              )}
          </div>
      )}

      {activeTab === 'attractions' && (
          <div>
              {isEditing ? (
                  <Card className="p-6 bg-gray-50">
                      <h3 className="font-bold mb-4">{editingAttr?.id ? 'Edit Attraction' : 'New Attraction'}</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                          <Input label="Title" value={editingAttr?.title} onChange={e => setEditingAttr({...editingAttr, title: e.target.value})} />
                          <Input label="Address" value={editingAttr?.address} onChange={e => setEditingAttr({...editingAttr, address: e.target.value})} />
                          
                          <Input label="Province" value={editingAttr?.province} onChange={e => setEditingAttr({...editingAttr, province: e.target.value})} />
                          <Input label="City" value={editingAttr?.city} onChange={e => setEditingAttr({...editingAttr, city: e.target.value})} />
                          <Input label="County" value={editingAttr?.county} onChange={e => setEditingAttr({...editingAttr, county: e.target.value})} />
                          
                          <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                              <input type="file" onChange={e => setAttrImageFile(e.target.files?.[0] || null)} className="mb-2" />
                              {editingAttr?.imageUrl && <img src={editingAttr.imageUrl} className="h-20 w-auto" alt="preview" />}
                          </div>

                          <div className="md:col-span-2">
                             <Textarea label="Description" value={editingAttr?.description} onChange={e => setEditingAttr({...editingAttr, description: e.target.value})} />
                          </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                          <Button onClick={handleSaveAttraction}>Save</Button>
                          <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                      </div>
                  </Card>
              ) : (
                  <div>
                      <div className="flex justify-end mb-4">
                          <Button onClick={() => openEdit()}><Icons.Plus /> Add Attraction</Button>
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {attractions.map(attr => (
                              <Card key={attr.id} className="relative group">
                                  <img src={attr.imageUrl} className="h-32 w-full object-cover" alt={attr.title} />
                                  <div className="p-4">
                                      <h3 className="font-bold">{attr.title}</h3>
                                      <p className="text-xs text-gray-500">{attr.region}</p>
                                      <div className="flex justify-end gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => openEdit(attr)}>Edit</Button>
                                          <Button variant="danger" className="px-2 py-1 text-xs" onClick={() => handleDeleteAttraction(attr.id)}>Delete</Button>
                                      </div>
                                  </div>
                              </Card>
                          ))}
                      </div>
                  </div>
              )}
          </div>
      )}
    </div>
  );
};

const UserOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (user) API.getOrders(user.id).then(res => res.data && setOrders(res.data));
  }, [user]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Order History</h1>
      <div className="space-y-4">
        {orders.map(o => (
          <Card key={o.id} className="p-4">
            <div className="flex justify-between mb-2 border-b pb-2">
              <span className="font-bold">Order #{o.id}</span>
              <Badge>{o.status}</Badge>
            </div>
            <div className="space-y-1">
              {o.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.name}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-3 pt-2 border-t">
              <div className="text-sm">
                {o.trackingNumber && <span className="text-gray-600">Tracking: <span className="font-mono font-bold">{o.trackingNumber}</span></span>}
              </div>
              <div className="font-bold text-right text-blue-600">
                Total: ${o.total.toFixed(2)}
              </div>
            </div>
          </Card>
        ))}
         {orders.length === 0 && <p className="text-gray-500">You haven't placed any orders yet.</p>}
      </div>
    </div>
  );
};

// --- APP ROOT COMPONENT ---

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: UserRole[] }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (u: User) => {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const addToCart = (p: Product, qty: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === p.id);
      if (existing) return prev.map(i => i.id === p.id ? { ...i, quantity: i.quantity + qty } : i);
      return [...prev, { ...p, quantity: qty }];
    });
  };
  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));
  const clearCart = () => setCart([]);

  // Notification State
  const [toasts, setToasts] = useState<{id: string, message: string, type: 'success' | 'error' | 'info'}[]>([]);
  const [modalState, setModalState] = useState<{isOpen: boolean, message: string, onConfirm: () => void} | null>(null);

  const notify = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    // Auto dismiss
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const confirm = (message: string, onConfirm: () => void) => {
    setModalState({ isOpen: true, message, onConfirm });
  };

  const closeConfirm = () => {
    setModalState(null);
  };

  const handleConfirm = () => {
    if (modalState?.onConfirm) modalState.onConfirm();
    closeConfirm();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
        <NotificationContext.Provider value={{ notify, confirm }}>
          <HashRouter>
            <Layout>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<AuthPage type="login" />} />
                <Route path="/register" element={<AuthPage type="register" />} />
                <Route path="/attractions/:id" element={<AttractionDetail />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                
                {/* Routes accessible by Guests and Travelers, but blocked for Merchant/Admin */}
                <Route path="/cart" element={
                  user && (user.role === UserRole.MERCHANT || user.role === UserRole.ADMIN) 
                    ? <Navigate to="/" replace /> 
                    : <CartPage />
                } />

                {/* Protected Routes */}
                <Route path="/orders" element={
                  <ProtectedRoute roles={[UserRole.TRAVELER]}>
                    <UserOrders />
                  </ProtectedRoute>
                } />
                
                <Route path="/merchant" element={
                  <ProtectedRoute roles={[UserRole.MERCHANT]}>
                    <MerchantDashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/admin" element={
                  <ProtectedRoute roles={[UserRole.ADMIN]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
            
            {/* Global Notification UI */}
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-2">
              {toasts.map(t => (
                <Toast key={t.id} id={t.id} message={t.message} type={t.type} onDismiss={dismissToast} />
              ))}
            </div>
            
            <ConfirmationModal 
              isOpen={!!modalState} 
              message={modalState?.message || ''} 
              onConfirm={handleConfirm} 
              onCancel={closeConfirm} 
            />

          </HashRouter>
        </NotificationContext.Provider>
      </CartContext.Provider>
    </AuthContext.Provider>
  );
};

export default App;