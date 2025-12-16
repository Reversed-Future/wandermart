import { Attraction, Post, Product, User, UserRole, Order, ApiResponse } from '../types';

/**
 * CONFIGURATION
 * 
 * Base URL for the future backend API.
 * Currently, all functions below use a MOCK implementation using LocalStorage
 * to simulate a working backend.
 */
const API_BASE = '/api/v1';
const DELAY_MS = 600; // Simulate network latency

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Helper to get/set from localStorage for persistence during demo
const getStorage = <T>(key: string, defaultVal: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultVal;
};

const setStorage = (key: string, val: any) => {
  localStorage.setItem(key, JSON.stringify(val));
};

// --- MOCK DATA INITIALIZATION ---
const MOCK_ATTRACTIONS: Attraction[] = [
  {
    id: '1',
    title: 'Chengdu Research Base of Giant Panda Breeding',
    description: 'A world-renowned breeding and research center for giant pandas.',
    address: '1375 Panda Rd, Chenghua District, Chengdu',
    province: '四川省',
    city: '成都市',
    county: '成华区',
    region: '四川省 成都市',
    tags: ['Nature', 'Animals', 'Family'],
    imageUrl: 'https://picsum.photos/800/600?random=1',
    gallery: [
      'https://picsum.photos/800/600?random=101',
      'https://picsum.photos/800/600?random=102',
      'https://picsum.photos/800/600?random=103'
    ],
    openHours: '07:30 - 18:00',
    drivingTips: 'Accessible by Metro Line 3. Parking available at South Gate.'
  },
  {
    id: '2',
    title: 'The Palace Museum (Forbidden City)',
    description: 'Imperial palace of the Ming and Qing dynasties. A masterpiece of Chinese architecture.',
    address: '4 Jingshan Front St, Dongcheng District, Beijing',
    province: '北京市',
    city: '北京市',
    county: '东城区',
    region: '北京市 东城区',
    tags: ['History', 'Culture', 'Architecture'],
    imageUrl: 'https://picsum.photos/800/600?random=2',
    gallery: [
      'https://picsum.photos/800/600?random=201',
      'https://picsum.photos/800/600?random=202'
    ],
    openHours: '08:30 - 17:00',
    drivingTips: 'No public parking. Use public transport (Metro Line 1).'
  },
  {
    id: '3',
    title: 'West Lake Cultural Landscape',
    description: 'Freshwater lake divided by causeways, famous for its scenic beauty and temples.',
    address: 'Xihu District, Hangzhou, Zhejiang',
    province: '浙江省',
    city: '杭州市',
    county: '西湖区',
    region: '浙江省 杭州市',
    tags: ['Nature', 'History', 'Water'],
    imageUrl: 'https://picsum.photos/800/600?random=3',
    gallery: ['https://picsum.photos/800/600?random=301'],
    openHours: '24 Hours',
    drivingTips: 'Traffic restrictions on weekends based on license plates.'
  },
  {
    id: '4',
    title: 'Jiuzhaigou Valley',
    description: 'Nature reserve and national park known for its many multi-level waterfalls and colorful lakes.',
    address: 'Jiuzhaigou County, Ngawa Tibetan and Qiang Autonomous Prefecture, Sichuan',
    province: '四川省',
    city: '阿坝藏族羌族自治州',
    county: '九寨沟县',
    region: '四川省 阿坝州',
    tags: ['Nature', 'Hiking', 'Photography'],
    imageUrl: 'https://picsum.photos/800/600?random=4',
    gallery: [
      'https://picsum.photos/800/600?random=401',
      'https://picsum.photos/800/600?random=402',
      'https://picsum.photos/800/600?random=403',
      'https://picsum.photos/800/600?random=404'
    ],
    openHours: '08:00 - 17:00',
    drivingTips: 'Mountain roads. Careful driving required in winter.'
  },
  {
    id: '5',
    title: 'Mount Qingcheng',
    description: 'One of the birthplaces of Taoism, featuring lush forests and ancient temples.',
    address: 'Dujiangyan, Chengdu, Sichuan',
    province: '四川省',
    city: '成都市',
    county: '都江堰市',
    region: '四川省 成都市',
    tags: ['Culture', 'Hiking', 'Mountain'],
    imageUrl: 'https://picsum.photos/800/600?random=5',
    openHours: '08:00 - 17:30',
    drivingTips: 'Take Chengguan Expressway. Parking lot is 2km from gate (shuttle available).'
  }
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    merchantId: 'm1',
    merchantName: 'Panda Souvenirs',
    attractionId: '1', // Linked to Panda Base
    attractionName: 'Chengdu Research Base of Giant Panda Breeding',
    name: 'Plush Panda Toy',
    description: 'Soft and cuddly panda plush.',
    price: 25.00,
    stock: 100,
    imageUrl: 'https://picsum.photos/400/400?random=10'
  },
  {
    id: 'p2',
    merchantId: 'm1',
    merchantName: 'Panda Souvenirs',
    attractionId: '5', // Linked to Mt Qingcheng for variety
    attractionName: 'Mount Qingcheng',
    name: 'Bamboo Fan',
    description: 'Traditional hand fan made of bamboo.',
    price: 12.50,
    stock: 50,
    imageUrl: 'https://picsum.photos/400/400?random=11'
  }
];

// Seed some initial users if not present
const INITIAL_USERS: User[] = [
  { id: 'admin1', username: 'Admin User', email: 'admin@test.com', role: UserRole.ADMIN, status: 'active' },
  { id: 'm1', username: 'Merchant User', email: 'merchant@test.com', role: UserRole.MERCHANT, status: 'active', qualificationUrl: 'https://picsum.photos/200/300' },
  { id: 'u1', username: 'Traveler User', email: 'user@test.com', role: UserRole.TRAVELER, status: 'active' },
];

// --- AUTH SERVICES ---

export const login = async (email: string, password: string): Promise<ApiResponse<User>> => {
  await delay(DELAY_MS);
  
  const users = getStorage<User[]>('mock_users', INITIAL_USERS);
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (user) {
    return { success: true, data: { ...user, token: `mock-jwt-${user.id}` } };
  }
  
  return { success: false, message: 'Invalid credentials. Try user@test.com, merchant@test.com, or admin@test.com' };
};

export const register = async (userData: Partial<User>, password: string): Promise<ApiResponse<User>> => {
  await delay(DELAY_MS);
  const users = getStorage<User[]>('mock_users', INITIAL_USERS);

  if (users.find(u => u.email === userData.email)) {
    return { success: false, message: 'Email already exists' };
  }

  // Merchants start as pending, others as active
  const status = userData.role === UserRole.MERCHANT ? 'pending' : 'active';

  const newUser: User = {
    id: `u-${Date.now()}`,
    username: userData.username || userData.email!.split('@')[0],
    email: userData.email!,
    role: userData.role || UserRole.TRAVELER,
    status: status,
    qualificationUrl: userData.qualificationUrl, // Store the license image URL
    token: `mock-jwt-new`
  };

  setStorage('mock_users', [...users, newUser]);
  return { success: true, data: newUser };
};

export const getPendingMerchants = async (): Promise<ApiResponse<User[]>> => {
  await delay(DELAY_MS);
  const users = getStorage<User[]>('mock_users', INITIAL_USERS);
  const pending = users.filter(u => u.role === UserRole.MERCHANT && u.status === 'pending');
  return { success: true, data: pending };
};

export const updateUserStatus = async (userId: string, status: 'active' | 'rejected'): Promise<ApiResponse<boolean>> => {
  await delay(DELAY_MS);
  const users = getStorage<User[]>('mock_users', INITIAL_USERS);
  const updatedUsers = users.map(u => u.id === userId ? { ...u, status } : u);
  setStorage('mock_users', updatedUsers);
  return { success: true, data: true };
};

// --- ATTRACTION SERVICES ---

interface AttractionFilters {
  province?: string;
  city?: string;
  county?: string;
  query?: string;
  tag?: string;
}

export const getAttractions = async (filters: AttractionFilters = {}): Promise<ApiResponse<Attraction[]>> => {
  await delay(DELAY_MS);
  // Use getStorage to ensure persistence for admin edits
  let data = getStorage<Attraction[]>('mock_attractions', MOCK_ATTRACTIONS);
  
  if (filters.province) data = data.filter(a => a.province === filters.province);
  if (filters.city) data = data.filter(a => a.city === filters.city);
  if (filters.county) data = data.filter(a => a.county === filters.county);
  
  if (filters.tag) data = data.filter(a => a.tags.includes(filters.tag!));
  
  if (filters.query) {
    const q = filters.query.toLowerCase();
    data = data.filter(a => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
  }
  return { success: true, data };
};

export const getAttractionById = async (id: string): Promise<ApiResponse<Attraction>> => {
  await delay(DELAY_MS);
  const data = getStorage<Attraction[]>('mock_attractions', MOCK_ATTRACTIONS);
  const attraction = data.find(a => a.id === id);
  return attraction ? { success: true, data: attraction } : { success: false, message: 'Not found' };
};

export const createAttraction = async (attractionData: Partial<Attraction>): Promise<ApiResponse<Attraction>> => {
    await delay(DELAY_MS);
    const attractions = getStorage<Attraction[]>('mock_attractions', MOCK_ATTRACTIONS);
    const newAttraction: Attraction = {
        id: `attr-${Date.now()}`,
        title: attractionData.title!,
        description: attractionData.description!,
        address: attractionData.address!,
        province: attractionData.province!,
        city: attractionData.city!,
        county: attractionData.county!,
        region: `${attractionData.province} ${attractionData.city}`,
        tags: attractionData.tags || [],
        imageUrl: attractionData.imageUrl || 'https://picsum.photos/800/600?random=99',
        gallery: attractionData.gallery || [],
        openHours: attractionData.openHours,
        drivingTips: attractionData.drivingTips
    };
    setStorage('mock_attractions', [newAttraction, ...attractions]);
    return { success: true, data: newAttraction };
};

export const updateAttraction = async (id: string, updates: Partial<Attraction>): Promise<ApiResponse<Attraction>> => {
    await delay(DELAY_MS);
    const attractions = getStorage<Attraction[]>('mock_attractions', MOCK_ATTRACTIONS);
    const index = attractions.findIndex(a => a.id === id);
    if (index === -1) return { success: false, message: 'Attraction not found' };
    
    const updatedAttraction = { ...attractions[index], ...updates };
    attractions[index] = updatedAttraction;
    setStorage('mock_attractions', attractions);
    return { success: true, data: updatedAttraction };
};

export const deleteAttraction = async (id: string): Promise<ApiResponse<boolean>> => {
    await delay(DELAY_MS);
    let attractions = getStorage<Attraction[]>('mock_attractions', MOCK_ATTRACTIONS);
    attractions = attractions.filter(a => a.id !== id);
    setStorage('mock_attractions', attractions);
    return { success: true, data: true };
};


// --- POST SERVICES ---

export const getPosts = async (attractionId?: string): Promise<ApiResponse<Post[]>> => {
  await delay(DELAY_MS);
  const allPosts = getStorage<Post[]>('mock_posts', []);
  
  // Filter out reported posts for public view. 
  // Reported posts are only visible to Admins via getReportedContent.
  const visiblePosts = allPosts.filter(p => p.status === 'active');
  
  const filtered = attractionId ? visiblePosts.filter(p => p.attractionId === attractionId) : visiblePosts;
  return { success: true, data: filtered };
};

export const createPost = async (postData: Partial<Post>): Promise<ApiResponse<Post>> => {
  await delay(DELAY_MS);
  const newPost: Post = {
    id: `post-${Date.now()}`,
    attractionId: postData.attractionId!,
    userId: postData.userId!,
    username: postData.username!,
    content: postData.content!,
    imageUrl: postData.imageUrl,
    rating: postData.rating,
    likes: 0,
    comments: [],
    createdAt: new Date().toISOString(),
    status: 'active'
  };
  const posts = getStorage<Post[]>('mock_posts', []);
  setStorage('mock_posts', [newPost, ...posts]);
  return { success: true, data: newPost };
};

export const reportPost = async (postId: string): Promise<ApiResponse<boolean>> => {
  await delay(DELAY_MS);
  // Updates status to 'reported', which removes it from getPosts() view but adds it to getReportedContent()
  const posts = getStorage<Post[]>('mock_posts', []);
  const updated = posts.map(p => p.id === postId ? { ...p, status: 'reported' as const } : p);
  setStorage('mock_posts', updated);
  return { success: true, data: true };
};

// --- MERCHANT & PRODUCT SERVICES ---

export const getProducts = async (merchantId?: string, attractionId?: string): Promise<ApiResponse<Product[]>> => {
  await delay(DELAY_MS);
  let allProducts = getStorage<Product[]>('mock_products', MOCK_PRODUCTS);
  
  if (merchantId) allProducts = allProducts.filter(p => p.merchantId === merchantId);
  if (attractionId) allProducts = allProducts.filter(p => p.attractionId === attractionId);
  
  return { success: true, data: allProducts };
};

export const getProductById = async (id: string): Promise<ApiResponse<Product>> => {
  await delay(DELAY_MS);
  const allProducts = getStorage<Product[]>('mock_products', MOCK_PRODUCTS);
  const product = allProducts.find(p => p.id === id);
  return product ? { success: true, data: product } : { success: false, message: 'Not found' };
};

export const createProduct = async (product: Partial<Product>): Promise<ApiResponse<Product>> => {
  await delay(DELAY_MS);

  // Auto-populate attraction name if ID is provided
  let attractionName = undefined;
  if (product.attractionId) {
      const attractions = getStorage<Attraction[]>('mock_attractions', MOCK_ATTRACTIONS);
      const attr = attractions.find(a => a.id === product.attractionId);
      if (attr) attractionName = attr.title;
  }

  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    merchantId: product.merchantId!,
    merchantName: product.merchantName || 'My Store',
    attractionId: product.attractionId,
    attractionName: attractionName,
    name: product.name!,
    description: product.description!,
    price: product.price!,
    stock: product.stock!,
    imageUrl: product.imageUrl || `https://picsum.photos/400/400?random=${Date.now()}`
  };
  const products = getStorage<Product[]>('mock_products', MOCK_PRODUCTS);
  setStorage('mock_products', [...products, newProduct]);
  return { success: true, data: newProduct };
};

// --- ORDER SERVICES ---

export const createOrder = async (orderData: Partial<Order>): Promise<ApiResponse<Order>> => {
  await delay(DELAY_MS);
  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    userId: orderData.userId!,
    items: orderData.items!,
    total: orderData.total!,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  const orders = getStorage<Order[]>('mock_orders', []);
  setStorage('mock_orders', [newOrder, ...orders]);
  return { success: true, data: newOrder };
};

export const getOrders = async (userId?: string, merchantId?: string): Promise<ApiResponse<Order[]>> => {
  await delay(DELAY_MS);
  let orders = getStorage<Order[]>('mock_orders', []);
  if (userId) orders = orders.filter(o => o.userId === userId);
  if (merchantId) {
    orders = orders.filter(o => o.items.some(i => i.merchantId === merchantId));
  }
  return { success: true, data: orders };
};

export const updateOrderStatus = async (orderId: string, status: Order['status'], trackingNumber?: string): Promise<ApiResponse<Order>> => {
  await delay(DELAY_MS);
  const orders = getStorage<Order[]>('mock_orders', []);
  let updatedOrder: Order | null = null;
  
  const updatedOrders = orders.map(o => {
      if (o.id === orderId) {
          updatedOrder = { ...o, status, trackingNumber: trackingNumber || o.trackingNumber };
          return updatedOrder;
      }
      return o;
  });
  
  if (!updatedOrder) return { success: false, message: 'Order not found' };
  
  setStorage('mock_orders', updatedOrders);
  return { success: true, data: updatedOrder };
};

// --- ADMIN SERVICES ---

export const getReportedContent = async (): Promise<ApiResponse<Post[]>> => {
  await delay(DELAY_MS);
  // Fetch raw posts to find 'reported' ones, as getPosts() filters them out
  const posts = getStorage<Post[]>('mock_posts', []);
  return { success: true, data: posts.filter(p => p.status === 'reported') };
};

export const moderateContent = async (id: string, action: 'approve' | 'delete'): Promise<ApiResponse<boolean>> => {
  await delay(DELAY_MS);
  let posts = getStorage<Post[]>('mock_posts', []);
  if (action === 'delete') {
    posts = posts.filter(p => p.id !== id);
  } else {
    // Approve means ignoring the report and setting it back to active
    posts = posts.map(p => p.id === id ? { ...p, status: 'active' as const } : p);
  }
  setStorage('mock_posts', posts);
  return { success: true, data: true };
};

export const uploadFile = async (file: File): Promise<string> => {
    // Return Base64 to persist images in LocalStorage for the demo
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
}