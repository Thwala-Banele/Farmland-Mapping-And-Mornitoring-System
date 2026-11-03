import { Routes, Route, NavLink } from "react-router-dom";
import Home from "./pages/Home";
import KPI from "./pages/KPI";
import Descriptive from "./pages/Descriptive";
import Exploratory from "./pages/Exploratory";
import Confirmatory from "./pages/Confirmatory";
import MapExplorer from "./pages/MapExplorer";
import Manual from "./pages/Manual";

function App() {
  return (
    <div className="app-container">
      <aside className="sidebar">
        <h2>FieldSense</h2>
        <nav>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Home
          </NavLink>
          <NavLink
            to="/kpi"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            KPIs
          </NavLink>
          <NavLink
            to="/descriptive"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Descriptive Analytics
          </NavLink>
          <NavLink
            to="/exploratory"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Exploratory Analytics
          </NavLink>
          <NavLink
            to="/confirmatory"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Confirmatory Analytics
          </NavLink>
          <NavLink
            to="/MapExplorer"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Map Explorer
          </NavLink>
          <NavLink
            to="/manual"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Manual
          </NavLink>
        </nav>
      </aside>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/kpi" element={<KPI />} />
          <Route path="/descriptive" element={<Descriptive />} />
          <Route path="/exploratory" element={<Exploratory />} />
          <Route path="/confirmatory" element={<Confirmatory />} />
          <Route path="/MapExplorer" element={<MapExplorer />} />
          <Route path="/manual" element={<Manual />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;