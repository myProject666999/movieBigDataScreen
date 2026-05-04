import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Spin } from 'antd'
import Login from './pages/Login'
import Register from './pages/Register'
import MainLayout from './components/MainLayout'
import Home from './pages/Home'
import Production from './pages/Production'
import RatingAnalysis from './pages/RatingAnalysis'
import LocationLanguage from './pages/LocationLanguage'
import Rankings from './pages/Rankings'

function App() {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a' }}>
        <Spin size="large" />
      </div>
    )
  }

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" /> : <Login />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/" /> : <Register />
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Home />} />
          <Route path="production" element={<Production />} />
          <Route path="rating" element={<RatingAnalysis />} />
          <Route path="location" element={<LocationLanguage />} />
          <Route path="rankings" element={<Rankings />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
