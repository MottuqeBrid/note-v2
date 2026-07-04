import { Outlet } from "react-router";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import ScrollToTop from "../../components/ScrollToTop/ScrollToTop";

const HomeLayout = () => {
  return (
    <div>
      <Navbar />
      <main className="max-w-7xl mx-auto min-h-screen overflow-hidden">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default HomeLayout;
