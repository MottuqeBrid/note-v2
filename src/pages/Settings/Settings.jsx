import { useNavigate } from "react-router";
import ChangePassword from "../../components/ChangePassword/ChangePassword";
import { useAuth } from "../../hooks/useAuth";
import Loading from "../../components/Loading/Loading";
import { useEffect } from "react";

const Settings = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!user && !loading) navigate("/login");
  }, [user, loading, navigate]);

  if (loading) return <Loading />;
  return (
    <div>
      <ChangePassword />
    </div>
  );
};

export default Settings;
