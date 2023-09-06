import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { EnvelopeIcon } from "@heroicons/react/20/solid";
import { useAuth } from "../hooks/auth";
import Empty from "../components/empty";
import { ConnectedEmailModal } from "../components/connectedEmailModal";

const Verify = () => {
  const { verifyToken } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [error, setError] = useState(null);
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  /** @param {string} token */
  const verify = async (token) => {
    setSubmittedOnce(true);
    try {
      await verifyToken(token);
      setTimeout(() => navigate("/notifications"), 500);
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    let timer;
    if (searchParams?.has("token") && !submittedOnce) {
      timer = setInterval(() => verify(searchParams.get("token")), 500);
    }
    // timer is used to prevent issues with StrictMode in development mode
    return () => {
      if (timer) clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, submittedOnce]);

  return (
    <>
      {error ? (
        <>
          <Empty
            title="Error"
            description={error}
            graphic="lockClosed"
            buttonText="Request New Link"
            onClick={() => setShowLogin(true)}
            ButtonIcon={() => (
              <EnvelopeIcon
                className="-ml-0.5 mr-1.5 h-5 w-5"
                aria-hidden="true"
              />
            )}
          />
          <ConnectedEmailModal
            visible={showLogin}
            setIsVisible={setShowLogin}
          />
        </>
      ) : (
        <Empty
          description="Verifying..."
          graphic="lockOpen"
          onClick={undefined}
        />
      )}
    </>
  );
};

export default Verify;
