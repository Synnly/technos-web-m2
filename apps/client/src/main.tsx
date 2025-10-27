import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Registration";
import Index from "./pages/Index";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "./Dashboard";
import Prediction from "./pages/Prediction";
import Shop from "./Shop";
import AllPredictions from "./pages/AllPredictions";
import "./App.css";
import ValidatePrediction from "./pages/ValidatePrediction";
import "@ant-design/v5-patch-for-react-19";
import ConfirmResults from "./pages/confirmResults";

createRoot(document.getElementById("root")!).render(
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
				<Route
					path="/prediction/:id"
					element={
						<ProtectedRoute>
							<Prediction />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/shop"
					element={
						<ProtectedRoute>
							<Shop />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/predictions"
					element={
						<ProtectedRoute>
							<AllPredictions />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/validate-prediction"
					element={
						<ProtectedRoute>
							<ValidatePrediction />
						</ProtectedRoute>
					}
				/>

				<Route 
					path="/confirm-results" 
					element={
						<ProtectedRoute>
							<ConfirmResults />
						</ProtectedRoute>
					}
				/>
				<Route path="/" element={<Index />} />

				{/* Route 404 */}
				<Route path="*" element={<div>Page non trouvée</div>} />
			</Routes>
		</BrowserRouter>
	</StrictMode>,
);
