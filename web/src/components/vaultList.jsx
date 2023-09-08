import { getFormattedVault } from "../utils/getFormattedVault";
import { capitalize } from "../utils/capitalize";

const VaultList = ({
  vaults,
  handleCreateNotifier,
  brands,
  quotes,
  managerGovParams,
}) => {
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
        "Oracle Price",
        "Collateral Value",
        "Debt Amount",
        "Current Collateral Ratio",
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
      {["Minimum Collateral Ratio", "Liquidation Ratio"].map((label) => (
        <th
          key={label}
          scope="col"
          className="px-3 py-3.5 text-right text-sm font-normal text-gray-500 break-normal max-w-[135px] bg-gray-100"
          valign="bottom"
        >
          {label}
        </th>
      ))}
      <th
        scope="col"
        className="relative py-3.5 pr-4 sm:pr-4 lg:pr-6 min-w-[132px]"
        valign="bottom"
      >
        <span className="sr-only">Create Notifier</span>
      </th>
    </tr>
  );

  const renderRow = (vault) => {
    const formattedVault = getFormattedVault(vault, brands, quotes);
    if (!formattedVault) return null;
    const {
      collateralBrand,
      collateralAmountDisplay,
      collateralValueDisplay,
      debtAmountDisplay,
      collateralizationRatio,
      oraclePrice,
    } = formattedVault;
    const govParams = managerGovParams[`manager${vault.managerId}`];

    return (
      <tr key={`${vault.managerId}-${vault.vaultId}`}>
        <td className="whitespace-nowrap pl-1 px-3 py-4 font-medium text-sm text-center text-gray-900 sm:pl-6 lg:pl-8 max-w-[135px]">
          {vault.vaultId}
        </td>
        {[
          capitalize(vault?.vaultState),
          collateralBrand,
          collateralAmountDisplay,
          oraclePrice,
          collateralValueDisplay,
          debtAmountDisplay,
          collateralizationRatio,
        ].map((value, idx) => (
          <td
            className="whitespace-nowrap px-3 py-4 text-sm font-medium text-right text-gray-900 max-w-[135px]"
            key={`${value}-${idx}`}
          >
            {value}
          </td>
        ))}
        {[govParams.collateralRatio, govParams.liquidationRatio].map(
          (value, idx) => (
            <th
              key={`${value}-${idx}`}
              scope="col"
              className="whitespace-nowrap px-3 py-4 text-sm text-right font-medium text-gray-900 max-w-[135px] bg-gray-100"
              valign="bottom"
            >
              {value}
            </th>
          )
        )}
        <td className="relative whitespace-nowrap py-4 pr-4 text-right text-sm font-medium sm:pr-4 lg:pr-6">
          <button
            onClick={() => handleCreateNotifier(vault)}
            className="text-interPurple hover:opacity-70"
          >
            Create Notifier<span className="sr-only"></span>
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>{renderColumns()}</thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {vaults.map(renderRow)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export { VaultList };
