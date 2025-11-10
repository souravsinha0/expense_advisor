import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, userAPI } from '../services/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const response = await userAPI.getProfile();
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: response.data, token },
        });
      }
    } catch (error) {
      await AsyncStorage.removeItem('token');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { access_token } = response.data;
      
      await AsyncStorage.setItem('token', access_token);
      
      const userResponse = await userAPI.getProfile();
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: userResponse.data, token: access_token },
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Login failed' };
    }
  };

  const signup = async (email, password) => {
    try {
      console.log('AuthContext signup called with:', { email });
      const response = await authAPI.signup({ email, password });
      console.log('Signup API response:', response.data);
      
      const { access_token } = response.data;
      
      await AsyncStorage.setItem('token', access_token);
      
      const userResponse = await userAPI.getProfile();
      console.log('User profile response:', userResponse.data);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: userResponse.data, token: access_token },
      });
      
      return { success: true };
    } catch (error) {
      console.error('Signup error in AuthContext:', error);
      console.error('Error response:', error.response?.data);
      return { success: false, error: error.response?.data?.detail || 'Signup failed' };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const value = {
    ...state,
    login,
    signup,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};