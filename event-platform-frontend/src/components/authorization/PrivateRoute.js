import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import ROTER_PATH from '../../navigation/path';

const PrivateRoute = ({ element }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return isAuthenticated ? element : <Navigate to={ROTER_PATH.registration} replace />;
};

export default PrivateRoute;