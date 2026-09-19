import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./mainLayout/MainLayout";
import Home from "./mainPages/Home";
import Browse from "./mainPages/Browse";
import Search from "./mainPages/Search";
import Post from "./mainPages/Post";
import Ask from "./mainPages/Ask";
import Login from "./authentication/login/Login";
import Register from "./authentication/register/Register";
import { useState } from "react";

const App = () => {
  const [authenticated] = useState<boolean>(false);

  return (
    <div id="root">
      {/* add a Toaster here probably */}
      <BrowserRouter>
        {authenticated ? <AuthenticatedRoutes /> : <UnauthenticatedRoutes />}
      </BrowserRouter>
    </div>
  );
};

const AuthenticatedRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="home" element={<Home />} />
        <Route path="browse" element={<Browse />} />
        <Route path="search" element={<Search />} />
        <Route path="post" element={<Post />} />
        <Route path="ask" element={<Ask />} />
        <Route path="logout" element={<Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/home" />} />
        {/* switch the above to 404? */}
      </Route>
    </Routes>
  );
};

const UnauthenticatedRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="home" element={<Home />} />
        <Route path="browse" element={<Browse />} />
        <Route path="search" element={<Search />} />
        <Route path="post" element={<Post />} />
        <Route path="ask" element={<Ask />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="*" element={<Navigate to="/home" />} />
      </Route>
    </Routes>
  );
};

export default App;
