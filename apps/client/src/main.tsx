import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Register from "./Registration";
import Index from "./Index";
import ProtectedRoute from './ProtectedRoute';
import Dashboard from './Dashboard';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/signin" element={<Login />} />
                <Route path="/signup" element={<Register />} />

                {/* Routes protégées */}
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } 
                />


                <Route path="/" element={<Index />} />


                {/* Route 404 */}
                <Route path="*" element={<div>Page non trouvée</div>} />
            </Routes>
        </BrowserRouter>
    </StrictMode>,
)
