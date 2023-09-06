import { useState } from "react";
import { NotifierModal } from "../components/notifierModal";
import { useChain } from "../contexts/chain";
import { useNotifiers } from "../contexts/notifiers";

const ConnectedNotifierModal = ({ visible, setIsVisible, onSuccess }) => {
  const [selectedManager, setSelectedManager] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const { vaultManagerOpts, vaultOptsMap, watchVault } = useChain();
  const { create } = useNotifiers();

  const handleCreateNotifier = async (params) => {
    try {
      const res = await create(params);
      if (res && res.success) onSuccess();
    } catch (e) {
      setValidationError(e.message);
    }
  };

  const handleManagerChange = ({ managerKey }) => {
    if (validationError) setValidationError(null);
    setSelectedManager(managerKey);
  };

  const handleVaultChange = ({ managerId, vaultId }) => {
    if (validationError) setValidationError(null);
    watchVault(managerId, vaultId);
  };

  return (
    <NotifierModal
      handleSubmit={handleCreateNotifier}
      visible={visible}
      setIsVisible={setIsVisible}
      managerOptions={vaultManagerOpts}
      vaultOptions={vaultOptsMap[selectedManager] || []}
      onManagerChange={handleManagerChange}
      onVaultChange={handleVaultChange}
      validationError={validationError}
    />
  );
};

export { ConnectedNotifierModal };
