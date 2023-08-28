import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Empty from "../components/empty";
import { useAuth } from "../contexts/auth";

const Verify = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) navigate("/notifications");
  }, [isLoggedIn, navigate]);

  return (
    <Empty
      title="Email Sent"
      description="Please check your email for the verification link."
      graphic="envelopeOpen"
      onClick={undefined}
    />
  );
};

export default Verify;
