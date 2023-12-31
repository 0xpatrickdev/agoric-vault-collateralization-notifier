import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { BellAlertIcon, EnvelopeIcon } from "@heroicons/react/20/solid";
import Empty from "../components/empty";
import { ConnectedEmailModal } from "../components/connectedEmailModal";
import { ConnectedNotifierModal } from "../components/connectedNotifierModal";
import { NotifierList } from "../components/notifierList";
import { Loading } from "../components/loading";
import { useAuth } from "../hooks/auth";
import { useNotifiers } from "../hooks/notifiers";
import { useChain } from "../hooks/chain";

const Notifiers = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showCreateNotifier, setShowCreateNotifier] = useState(false);
  const [initialNotifierValues, setInitialNotifierValues] = useState(null);
  const { isLoggedIn } = useAuth();
  const { notifiers, remove, fetchNotifiers, isLoading } = useNotifiers();

  const [searchParams] = useSearchParams();
  const { brands, quotes, vaults, managerGovParams } = useChain();
  const navigate = useNavigate();

  const clearSearchParams = () => {
    if (searchParams.has("managerId")) {
      navigate("/notifiers");
    }
  };

  const handleOnModalClose = () => {
    clearSearchParams();
    setInitialNotifierValues(null);
  };

  const handleNotifierCreated = () => {
    fetchNotifiers(true);
    setShowCreateNotifier(false);
    clearSearchParams();
    setInitialNotifierValues(null);
  };

  useEffect(() => {
    if (
      searchParams.has("managerId") &&
      searchParams.has("vaultId") &&
      searchParams.get("action") === "create"
    ) {
      setInitialNotifierValues({
        managerId: searchParams.get("managerId"),
        vaultId: searchParams.get("vaultId"),
      });
      // ...add delay for rpc data to load
      setTimeout(() => setShowCreateNotifier(true), 1500);
    }
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => fetchNotifiers(), 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteNotifier = async ({ id }) => {
    try {
      const res = await remove(id);
      if (res.ok) fetchNotifiers(true);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {isLoggedIn ? (
        <>
          {isLoading || !notifiers ? (
            <Loading />
          ) : notifiers.length > 0 ? (
            <NotifierList
              notifiers={notifiers}
              handleCreateNotifier={() => setShowCreateNotifier(true)}
              handleDeleteNotifier={deleteNotifier}
              brands={brands}
              quotes={quotes}
              managerGovParams={managerGovParams}
              vaults={vaults}
            />
          ) : (
            <Empty
              title="No Notifiers Found"
              description="Create a notifier to get started."
              graphic="notification"
              buttonText="Create Notifier"
              onClick={() => setShowCreateNotifier(true)}
              ButtonIcon={() => (
                <BellAlertIcon
                  className="-ml-0.5 mr-1.5 h-5 w-5"
                  aria-hidden="true"
                />
              )}
            />
          )}
          <ConnectedNotifierModal
            visible={showCreateNotifier}
            setIsVisible={setShowCreateNotifier}
            onSuccess={handleNotifierCreated}
            initialValues={initialNotifierValues}
            onClose={handleOnModalClose}
          />
        </>
      ) : (
        <>
          <Empty
            title="No Notifiers"
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

export default Notifiers;
