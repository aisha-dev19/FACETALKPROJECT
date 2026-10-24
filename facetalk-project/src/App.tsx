import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import AboutSection from "./components/AboutSection";
import ServicesSection from "./components/ServicesSection";
import Testimonials from "./components/Testimonials";
import Consultation from "./components/Consultation";
import InstagramFeed from "./components/InstagramFeed";

import Home from "./pages/Home";
import About from "./pages/About";
import ServicesPage from "./pages/servicess";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import Booking from "./pages/Booking";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function App() {
  const { pathname } = useLocation();
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  return (
    <>
      <ScrollToTop />
      <Navbar fixed={isAuthPage} />

      {/* key={pathname} makes the fade play again on every page change */}
      <div key={pathname} className="page-in">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Home />
                <AboutSection />
                <ServicesSection />
                <Testimonials />
                <Consultation />
                <InstagramFeed />
              </>
            }
          />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>

      {!isAuthPage && <Footer />}
    </>
  );
}

export default App;