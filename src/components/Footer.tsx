import React from 'react';
import { MapPin, PhoneCall, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-bkBlue-900 text-white">
      <div className="h-1 bg-gradient-to-r from-bkGold-600 via-bkRed-600 to-bkRed-600"></div>
      
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap justify-between items-center">
          <div className="text-sm text-bkNeutral-300">
            <p>© {new Date().getFullYear()} Bank of Kigali. All rights reserved.</p>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-bkNeutral-300">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              <span>KN 4 Ave, Kigali</span>
            </div>
            <div className="flex items-center">
              <PhoneCall className="h-4 w-4 mr-2" />
              <span>+250 788 143 000</span>
            </div>
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              <span>info@bk.rw</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;