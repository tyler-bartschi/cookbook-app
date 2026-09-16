import "./AppNavbar.css";
import { Link } from "react-router-dom";
import ProfileInfo from "./profileInfo/ProfileInfo";

const AppNavbar = () => {
  return (
    <>
      <div className="navbar-wrapper">
        <div className="app-title-wrapper">
          <Link className="app-title" to="/">
            cookbook
          </Link>
        </div>

        <div className="app-pages-wrapper">
          {/* have a series of Navlinks in here */}
          <div>Home</div>
          <div>Browse</div>
          <div>Search</div>
          <div>Post</div>
          <div>Ask</div>
        </div>
        <div className="profile-box-wrapper">
          <ProfileInfo />
        </div>
      </div>
    </>
  );
};

export default AppNavbar;
