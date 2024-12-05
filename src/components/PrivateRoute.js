import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
  const isLoggedIn = !!localStorage.getItem('token');

  return isLoggedIn ? children : <Navigate to="/" />;
}

export default PrivateRoute;
