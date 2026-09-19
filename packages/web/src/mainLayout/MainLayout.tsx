import "./MainLayout.css";
import { Outlet } from "react-router-dom";
import AppNavbar from "../appNavbar/AppNavbar";
import Footer from "../footer/Footer";

const MainLayout = () => {
  return (
    <>
      <AppNavbar />
      <div className="main-content">
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default MainLayout;
