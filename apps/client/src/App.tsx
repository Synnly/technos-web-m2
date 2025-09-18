import { useState } from "react";
import Login from "./Login";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./Registration";

/**
 * Le composant `App` est le point d'entrée principal de l'application React.
 * Il configure le routage de l'application en utilisant `react-router-dom` pour définir
 * les différentes routes et leurs composants associés.
 *
 * @example
 * <App />
 *
 * @remarks
 * - Ce composant utilise `BrowserRouter` pour gérer l'historique de navigation.
 * - Les routes définies incluent :
 *   - `/signin` pour le composant `Login`.
 *   - `/signup` pour le composant `Register`.
 *
 * @dependencies
 * - `react-router-dom` pour la gestion des routes.
 *
 * @requires
 * - Les composants `Login` et `Register` doivent être définis et importés.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<Login />} />
        <Route path="/signup" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;