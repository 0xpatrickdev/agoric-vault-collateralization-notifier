import { useMemo, useState } from "react";
import { NotifierModal } from "../components/notifierModal";
import { useChain } from "../hooks/chain";
import { useNotifiers } from "../hooks/notifiers";
import { getFormattedVault } from "../utils/getFormattedVault";

const ConnectedNotifierModal = ({
  visible,
  setIsVisible,
  onSuccess,
  initialValues,
  onClose,
}) => {
  const [selectedManager, setSelectedManager] = useState(null);
  const [selectedVaultId, setSelectedVaultId] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const {
    vaultManagerOpts,
    vaultOptsMap,
    watchVault,
    vaults,
    brands,
    quotes,
    managerGovParams,
  } = useChain();
  const { create } = useNotifiers();

  const handleCreateNotifier = async (params) => {
    try {
      const res = await create(params);
      if (res && res.ok) {
        onSuccess();
        setSelectedManager(null);
        setSelectedVaultId(null);
      }
    } catch (e) {
      setValidationError(e.message);
    }
  };

  const handleManagerChange = ({ managerKey }) => {
    if (validationError) setValidationError(null);
    setSelectedManager(managerKey);
    if (selectedVaultId) setSelectedVaultId(null);
  };

  const handleVaultChange = ({ managerId, vaultId }) => {
    if (validationError) setValidationError(null);
    watchVault(managerId, vaultId);
    setSelectedVaultId(vaultId);
  };

  const handleModalClose = () => {
    if (onClose && typeof onClose === "function") {
      onClose();
    }
    setTimeout(() => {
      setSelectedManager(null);
      setSelectedVaultId(null);
    }, 500);
  };

  const initialManagerValue = useMemo(
    () =>
      initialValues?.managerId
        ? vaultManagerOpts.find(
            ({ managerId }) => managerId === initialValues.managerId
          )
        : null,
    [initialValues?.managerId, vaultManagerOpts]
  );

  const initialVaultValue = useMemo(
    () =>
      initialManagerValue && initialValues?.vaultId
        ? vaultOptsMap[initialManagerValue.managerKey].find(
            ({ vaultId }) => vaultId === initialValues.vaultId
          )
        : null,
    [initialValues?.vaultId, initialManagerValue, vaultOptsMap]
  );

  const selectedManagerStats = useMemo(() => {
    if (!selectedManager || Object.keys(managerGovParams).length == 0)
      return null;
    const govParams = managerGovParams[`manager${selectedManager.slice(7)}`];
    if (!govParams) return null;
    return [
      {
        label: "Minimum Collateralization Ratio",
        value: govParams.minimumCollateralRatio,
      },
      { label: "Liquidation Ratio", value: govParams.liquidationRatio },
    ];
  }, [selectedManager, managerGovParams]);

  const selectedVaultStats = useMemo(() => {
    if (!vaults.length || !selectedVaultId) return null;
    const formattedVault = getFormattedVault(
      vaults.find((x) => x.vaultId === selectedVaultId),
      brands,
      quotes
    );
    if (!formattedVault) return null;
    return [
      { label: "Vault Status", value: formattedVault.vaultStatus },
      {
        label: "Collateral Value",
        value: formattedVault.collateralValueDisplay,
      },
      {
        label: "Collateralization Ratio",
        value: formattedVault.collateralizationRatio,
      },
    ];
  }, [selectedVaultId, vaults, brands, quotes]);

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
      selectedManagerStats={selectedManagerStats}
      selectedVaultStats={selectedVaultStats}
      onClose={handleModalClose}
    />
  );
};

export { ConnectedNotifierModal };
