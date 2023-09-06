import { useState } from "react";
import { NotifierModal } from "../components/notifierModal";
import { useChain } from "../hooks/chain";
import { useNotifiers } from "../hooks/notifiers";

const ConnectedNotifierModal = ({
  visible,
  setIsVisible,
  onSuccess,
  initialValues,
}) => {
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

  const initialManagerValue = initialValues?.managerId
    ? vaultManagerOpts.find(
        ({ managerId }) => managerId === initialValues.managerId
      )
    : null;

  const initialVaultValue =
    initialManagerValue && initialValues?.vaultId
      ? vaultOptsMap[initialManagerValue.managerKey].find(
          ({ vaultId }) => vaultId === initialValues.vaultId
        )
      : null;

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
      initialManagerOption={initialManagerValue}
      initialVaultOption={initialVaultValue}
    />
  );
};

export { ConnectedNotifierModal };
