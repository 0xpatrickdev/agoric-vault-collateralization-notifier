import { useChain } from "../hooks/chain";
import { getFormattedVault } from "../utils/getFormattedVault";
import { capitalize } from "../utils/capitalize";
import { PlusCircleIcon } from "@heroicons/react/20/solid";

const NotifierList = ({
  notifiers,
  handleCreateNotifier,
  handleDeleteNotifier,
}) => {
  const { brands, quotes, vaults, managerGovParams } = useChain();

  const renderColumns = () => (
    <tr>
      <th
        scope="col"
        className="py-3.5 pl-1 text-center text-sm font-normal text-gray-500 sm:pl-6 lg:pl-8 break-normal w-[135px]"
        valign="bottom"
      >
        Vault Id
      </th>
      {[
        "Status",
        "Collateral Brand",
        "Collateral Amount",
        "Collateral Value",
        "Debt Amount",
        "Current Collateral Ratio",
        "Minimum Collateral Ratio",
        "Liquidation Ratio",
      ].map((label) => (
        <th
          key={label}
          scope="col"
          className="px-3 py-3.5 text-right text-sm font-normal text-gray-500 break-normal max-w-[135px]"
          valign="bottom"
        >
          {label}
        </th>
      ))}
      <th
        scope="col"
        className="px-3 py-3.5 text-right text-sm font-normal text-gray-500 break-normal max-w-[135px] bg-gray-100"
        valign="bottom"
      >
        Notifier Collateral Ratio
      </th>
      <th
        scope="col"
        className="relative py-3.5 pr-4 sm:pr-4 lg:pr-6 min-w-[132px]"
        valign="bottom"
      >
        <span className="sr-only">Delete Notifier</span>
      </th>
    </tr>
  );

  const renderRow = (notifier) => {
    const vault = vaults.find(
      (vault) =>
        vault.vaultId === String(notifier.vaultId) &&
        vault.managerId === String(notifier.vaultManagerId)
    );
    if (!vault) return null;

    const govParams = managerGovParams[`manager${vault.managerId}`];

    const {
      collateralBrand,
      collateralAmountDisplay,
      collateralValueDisplay,
      debtAmountDisplay,
      collateralizationRatio,
    } = getFormattedVault(vault, brands, quotes);

    return (
      <tr key={notifier.id}>
        <td className="whitespace-nowrap pl-1 px-3 py-4 font-medium text-sm text-center text-gray-900 sm:pl-6 lg:pl-8 max-w-[135px]">
          {vault.vaultId}
        </td>
        {[
          capitalize(vault?.vaultState),
          collateralBrand,
          collateralAmountDisplay,
          collateralValueDisplay,
          debtAmountDisplay,
          collateralizationRatio,
          govParams.collateralRatio,
          govParams.liquidationRatio,
        ].map((value, idx) => (
          <td
            className="whitespace-nowrap px-3 py-4 text-sm font-medium text-right text-gray-900 max-w-[135px]"
            key={`${value}-${idx}`}
          >
            {value}
          </td>
        ))}
        <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-medium text-gray-900 max-w-[135px] bg-gray-100">
          {`${notifier.collateralizationRatio}%`}
        </td>
        <td className="relative whitespace-nowrap py-4 pr-4 text-right text-sm font-medium sm:pr-4 lg:pr-6">
          <button
            onClick={() => handleDeleteNotifier(notifier)}
            className="text-interPurple hover:text-opacity-70"
          >
            Delete Notifier<span className="sr-only"></span>
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:justify-end">
        <div className="mt-4 pt-2 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="inline-flex w-48 items-center justify-center rounded-full bg-interPurple px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interPurple"
            onClick={handleCreateNotifier}
          >
            <PlusCircleIcon className="mr-1.5 h-5 w-5" aria-hidden="true" />
            Create Notifier
          </button>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>{renderColumns()}</thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {notifiers.map(renderRow)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export { NotifierList };
