import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Ban as Bank, Clock, Users, LineChart, MessageSquare } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-bkBlue-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <Bank className="h-8 w-8 text-bkGold-500 mr-3" />
            <div>
              <h1 className="text-xl font-bold">Bank of Kigali</h1>
              <p className="text-sm text-bkNeutral-300">International Transfer Queue</p>
            </div>
          </div>
          
          <nav className="flex flex-wrap gap-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive('/') 
                  ? 'bg-bkBlue-700 text-white' 
                  : 'text-bkNeutral-300 hover:bg-bkBlue-800 hover:text-white'
              }`}
            >
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>Queue</span>
              </div>
            </Link>
            
            <Link
              to="/teller"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive('/teller') 
                  ? 'bg-bkBlue-700 text-white' 
                  : 'text-bkNeutral-300 hover:bg-bkBlue-800 hover:text-white'
              }`}
            >
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>Teller</span>
              </div>
            </Link>
            
            <Link
              to="/admin"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive('/admin') 
                  ? 'bg-bkBlue-700 text-white' 
                  : 'text-bkNeutral-300 hover:bg-bkBlue-800 hover:text-white'
              }`}
            >
              <div className="flex items-center">
                <LineChart className="h-4 w-4 mr-1" />
                <span>Admin</span>
              </div>
            </Link>

            <Link
              to="/feedback"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive('/feedback') 
                  ? 'bg-bkBlue-700 text-white' 
                  : 'text-bkNeutral-300 hover:bg-bkBlue-800 hover:text-white'
              }`}
            >
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>Feedback</span>
              </div>
            </Link>
          </nav>
        </div>
      </div>
      
      <div className="h-1 bg-gradient-to-r from-bkRed-600 via-bkRed-600 to-bkGold-600"></div>
    </header>
  );
};

export default Header;