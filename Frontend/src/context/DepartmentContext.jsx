/**
 * Department Context
 * Provides department information globally to all components
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';

const DepartmentContext = createContext();

export const useDepartment = () => {
  const context = useContext(DepartmentContext);
  if (!context) {
    throw new Error('useDepartment must be used within DepartmentProvider');
  }
  return context;
};

export const DepartmentProvider = ({ children }) => {
  const { user } = useAuth();
  const [currentDepartment, setCurrentDepartment] = useState(null);
  const [canViewAllDepartments, setCanViewAllDepartments] = useState(false);
  const [departmentList, setDepartmentList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Set current department from user
      setCurrentDepartment(user.department);

      // Check if user can view all departments (UIL or Admin)
      const canViewAll = user.is_staff || user.role === 'UIL';
      setCanViewAllDepartments(canViewAll);

      // If user can view all, fetch department list
      if (canViewAll) {
        fetchDepartmentList();
      } else {
        setDepartmentList(user.department ? [user.department] : []);
        setLoading(false);
      }
    } else {
      // Reset when user logs out
      setCurrentDepartment(null);
      setCanViewAllDepartments(false);
      setDepartmentList([]);
      setLoading(false);
    }
  }, [user]);

  const fetchDepartmentList = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/departments/', {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDepartmentList(data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentName = (departmentId) => {
    if (!departmentId) return 'No Department';
    
    const dept = departmentList.find(d => d.id === departmentId);
    return dept ? dept.name : 'Unknown Department';
  };

  const value = {
    currentDepartment,
    canViewAllDepartments,
    departmentList,
    loading,
    getDepartmentName,
  };

  return (
    <DepartmentContext.Provider value={value}>
      {children}
    </DepartmentContext.Provider>
  );
};

export default DepartmentContext;