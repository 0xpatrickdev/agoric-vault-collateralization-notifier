import { useState } from "react";
import { EnvelopeIcon } from "@heroicons/react/20/solid";
import Empty from "../components/empty";
import { ConnectedEmailModal } from "../components/connectedEmailModal";
import { useAuth } from "../contexts/auth";

const Notifications = () => {
  const [showLogin, setShowLogin] = useState(false);
  const { isLoggedIn } = useAuth();

  return (
    <>
      {isLoggedIn ? (
        <div>logged in</div>
      ) : (
        <>
          <Empty
            title="No Notifications"
            description="Sign in with email to get started."
            graphic="notification"
            buttonText="Sign In"
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
      )}
    </>
  );
};

export default Notifications;
