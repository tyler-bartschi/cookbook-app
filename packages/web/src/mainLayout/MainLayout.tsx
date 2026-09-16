import { Outlet } from "react-router-dom";
import AppNavbar from "../appNavbar/AppNavbar";

const MainLayout = () => {
  return (
    <>
      <AppNavbar />
      <p>test</p>
      <Outlet />
    </>
  );
};

export default MainLayout;
