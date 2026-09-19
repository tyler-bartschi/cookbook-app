import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <>
      <div className="footer-wrapper">
        <div className="footer-links">
          Useful Links
          <Link to="/" className="footer-link" >Privacy Policy</Link>
          {/* eventually replace above with an actual privacy policy page */}
          <a className="footer-link" href="https://github.com/tyler-bartschi/cookbook-app" target="_blank" rel="noreferrer noopener">GitHub</a>
        </div>
      </div>
    </>
  );
};

export default Footer;
