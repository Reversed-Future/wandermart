import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useCart } from '../App';
import { Icons, Button } from './ui';
import { UserRole } from '../types';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-500';

  // Only Guests and Travelers see shopping features
  const showShoppingFeatures = !user || user.role === UserRole.TRAVELER;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600 tracking-tight">WanderMart</Link>
              <nav className="hidden md:ml-8 md:flex space-x-6">
                <Link to="/" className={isActive('/')}>Explore</Link>
                <Link to="/products" className={isActive('/products')}>Marketplace</Link>
                
                {user?.role === UserRole.MERCHANT && (
                  <Link to="/merchant" className={isActive('/merchant')}>Store Dashboard</Link>
                )}
                {user?.role === UserRole.ADMIN && (
                   <Link to="/admin" className={isActive('/admin')}>Admin Panel</Link>
                )}
                {showShoppingFeatures && user && (
                   <Link to="/orders" className={isActive('/orders')}>My Orders</Link>
                )}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {showShoppingFeatures && (
                <Link to="/cart" className="relative text-gray-600 hover:text-blue-600">
                  <Icons.ShoppingBag />
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cart.reduce((a, b) => a + b.quantity, 0)}
                    </span>
                  )}
                </Link>
              )}

              {user ? (
                <div className="hidden md:flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium text-gray-800">{user.username}</span>
                    <span className="text-xs text-gray-500 capitalize">{user.role}</span>
                  </div>
                  <Button variant="secondary" onClick={handleLogout} className="text-sm">Logout</Button>
                </div>
              ) : (
                <div className="hidden md:flex gap-2">
                  <Link to="/login"><Button variant="ghost">Login</Button></Link>
                  <Link to="/register"><Button>Sign Up</Button></Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-gray-600 p-2">
                <Icons.Menu />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
             <Link to="/" className="block text-gray-700" onClick={() => setIsMenuOpen(false)}>Explore</Link>
             <Link to="/products" className="block text-gray-700" onClick={() => setIsMenuOpen(false)}>Marketplace</Link>
             {user?.role === UserRole.MERCHANT && <Link to="/merchant" className="block text-blue-600 font-medium" onClick={() => setIsMenuOpen(false)}>Store Dashboard</Link>}
             {user?.role === UserRole.ADMIN && <Link to="/admin" className="block text-blue-600 font-medium" onClick={() => setIsMenuOpen(false)}>Admin Panel</Link>}
             {showShoppingFeatures && user && <Link to="/orders" className="block text-gray-700" onClick={() => setIsMenuOpen(false)}>My Orders</Link>}
             <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
               {!user ? (
                 <>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full text-center py-2 border rounded">Login</Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)} className="w-full text-center py-2 bg-blue-600 text-white rounded">Sign Up</Link>
                 </>
               ) : (
                 <Button variant="secondary" onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full">Logout</Button>
               )}
             </div>
          </div>
        )}
      </header>
      
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 py-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} WanderMart. All rights reserved.</p>
      </footer>
    </div>
  );
};