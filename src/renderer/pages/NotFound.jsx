import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800">404</h1>
        <p className="text-gray-600 mt-2">Page not found.</p>
        <Link to="/" className="text-blue-600 hover:underline mt-4 block">
          Go back to dashboard
        </Link>
      </div>
    </div>
  );
}
