import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ComboBox } from "../components/comboBox";
import { PercentInput } from "../components/percentInput";

const NotifierModal = ({
  title,
  description,
  visible,
  setIsVisible,
  handleSubmit,
  validationError,
  buttonLabel,
  managerOptions,
  vaultOptions,
  onManagerChange,
  onVaultChange,
  initialManagerOption,
  initialVaultOption,
}) => {
  const [manager, setManager] = useState(initialManagerOption);
  const [vault, setVault] = useState(initialVaultOption);
  const [percentTouched, setPercentTouched] = useState(false);
  const cancelButtonRef = useRef(null);
  const percentRef = useRef(null);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const collateralizationRatio = Number(percentRef.current.value);
    if (!collateralizationRatio || collateralizationRatio.length == 0) {
      // @todo show error ?
    }
    handleSubmit({
      collateralizationRatio,
      vaultManagerId: Number(manager.managerId),
      vaultId: Number(vault.vaultId),
    });
  };

  const handleManagerChange = (vault) => {
    setManager(vault);
    onManagerChange(vault);
  };

  const handleVaultChange = (manager) => {
    setVault(manager);
    onVaultChange(manager);
  };

  useEffect(() => {
    if (!manager && initialManagerOption) {
      handleManagerChange(initialManagerOption);
    }
    if (!vault && initialVaultOption) {
      handleVaultChange(initialVaultOption);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialManagerOption, initialVaultOption]);

  return (
    <Transition.Root show={visible} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={() => setIsVisible(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold leading-6 text-gray-900"
                    >
                      {title}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">{description}</p>
                    </div>
                  </div>
                </div>
                <form
                  className="flex-col mt-5 sm:flex sm:items-start sm:ml-4"
                  onSubmit={handleFormSubmit}
                >
                  <div className="w-full sm:max-w-xs mb-2">
                    <ComboBox
                      label="Vault Manager"
                      options={managerOptions || []}
                      valueKey="brand"
                      prelineKey="brand"
                      displayKey="managerKey"
                      onChange={handleManagerChange}
                      initialValue={initialManagerOption}
                    />
                  </div>
                  <div className="w-full sm:max-w-xs mb-2">
                    <ComboBox
                      label="Vault ID"
                      disabled={!manager}
                      options={vaultOptions || []}
                      valueKey="vaultKey"
                      displayKey="vaultKey"
                      onChange={handleVaultChange}
                      initialValue={initialVaultOption}
                    />
                  </div>
                  <div className="w-full sm:max-w-xs mb-2">
                    <PercentInput
                      name="collateralizationRatio"
                      label="Collateralization Ratio"
                      placeholder="0"
                      ref={percentRef}
                      onChange={() =>
                        !percentTouched && setPercentTouched(true)
                      }
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!manager || !vault || !percentTouched}
                    className="mt-4 inline-flex w-48 items-center justify-center rounded-md bg-interPurple px-3 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interPurple"
                  >
                    {buttonLabel}
                  </button>
                </form>
                <div className="mt-2 p-2 text-red-500 text-sm text-center">
                  {validationError ? validationError : ""}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

NotifierModal.defaultProps = {
  visible: true,
  title: "Create Notifier",
  inputLabel: "Email",
  buttonLabel: "Submit",
  description:
    "An email notification will be sent when the vault reaches the specified collateralization ratio.",
};

export { NotifierModal };
