import { Route, Routes } from "react-router-dom";
import "./App.css";
import IndexPage from "./pages/indexPage";
import Layout from "./Layout";
import RegisterPage from "./pages/register";
import axios from "axios";
import { UserContextProvider } from "./UserContext";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import PlacesPage from "./pages/PlacesPage";

axios.defaults.baseURL = "http://localhost:4000/";
axios.defaults.withCredentials = true;
function App() {
  return (
    <UserContextProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<IndexPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/account" element={<ProfilePage />} />

          <Route path="/account/places" element={<PlacesPage />} />
        </Route>
      </Routes>
    </UserContextProvider>
  );
}

export default App;
