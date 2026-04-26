import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('churchAdmin') === 'true';
  });

  useEffect(() => {
    if (isAdmin) {
      localStorage.setItem('churchAdmin', 'true');
    } else {
      localStorage.removeItem('churchAdmin');
    }
  }, [isAdmin]);

  return (
    <AdminContext.Provider value={{ isAdmin, setIsAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
