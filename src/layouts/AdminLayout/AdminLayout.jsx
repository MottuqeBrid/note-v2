import { Outlet } from "react-router";
import AdminNavbar from "../../components/Admin/AdminNavbar/AdminNavbar";
import { useAuth } from "../../hooks/useAuth";
import Forbidden from "../../components/Forbidden/Forbidden";
import Loading from "../../components/Loading/Loading";

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
      <AdminNavbar />
      <main className="max-w-7xl mx-auto min-h-screen overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
