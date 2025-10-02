import React from 'react';
import { Link } from 'react-router-dom';
import { HiHome, HiArrowLeft, HiDocumentText } from 'react-icons/hi';
import Button from '../components/UI/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto h-24 w-24 bg-primary-100 rounded-full flex items-center justify-center">
          <HiDocumentText className="h-12 w-12 text-primary-600" />
        </div>
        
        <h1 className="mt-6 text-4xl font-bold text-gray-900">404</h1>
        <h2 className="mt-2 text-2xl font-semibold text-gray-800">Page Not Found</h2>
        
        <p className="mt-4 text-lg text-gray-600">
          Sorry, we couldn't find the page you're looking for.
        </p>
        
        <p className="mt-2 text-sm text-gray-500">
          The page might have been moved, deleted, or you might have entered the wrong URL.
        </p>
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/dashboard">
            <Button variant="primary">
              <HiHome className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
          
          <Button variant="secondary" onClick={() => window.history.back()}>
            <HiArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
        
        <div className="mt-8 text-xs text-gray-400">
          <p>If you believe this is an error, please contact support.</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
