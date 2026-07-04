import { Outlet } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import Forbidden from "../../components/Forbidden/Forbidden";
import Loading from "../../components/Loading/Loading";
import Navbar from "../../components/Navbar/Navbar";
import ScrollToTop from "../../components/ScrollToTop/ScrollToTop";
import AdminNavbar from "../../pages/AdminPage/AdminNavbar/AdminNavbar";

const AdminLayout = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return <Loading />;
  }
  if (!user || !user.role?.includes("admin")) {
    return <Forbidden />;
  }
  return (
    <div className="">
      <Navbar page="admin" />
      <AdminNavbar />
      <main className="max-w-7xl mx-auto min-h-screen overflow-hidden">
        <Outlet />
      </main>
      <ScrollToTop />
    </div>
  );
};

export default AdminLayout;
