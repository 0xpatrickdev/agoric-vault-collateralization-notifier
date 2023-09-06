import { useChain } from "../hooks/chain";
import { getFormattedVault } from "../utils/getFormattedVault";

const VaultList = ({ vaults, handleCreateNotifier }) => {
  const { brands, quotes } = useChain();
  const renderColumns = () => (
    <tr>
      <th
        scope="col"
        className="py-3.5 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6 lg:pl-8"
      >
        Vault Id
      </th>
      <th
        scope="col"
        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
      >
        Status
      </th>
      <th
        scope="col"
        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
      >
        Collateral Brand
      </th>
      <th
        scope="col"
        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
      >
        Collateral Amount
      </th>
      <th
        scope="col"
        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
      >
        Oracle Price
      </th>
      <th
        scope="col"
        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
      >
        Collateral Value
      </th>
      <th
        scope="col"
        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
      >
        Debt Amount
      </th>
      <th
        scope="col"
        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
      >
        Collateralization Ratio
      </th>
      <th scope="col" className="relative py-3.5 pr-4 sm:pr-4 lg:pr-6">
        <span className="sr-only">Edit</span>
      </th>
    </tr>
  );

  const renderRow = (vault) => {
    const {
      collateralBrand,
      collateralAmountDisplay,
      collateralValueDisplay,
      debtAmountDisplay,
      collateralizationRatio,
      oraclePrice,
    } = getFormattedVault(vault, brands, quotes);

    return (
      <tr key={`${vault.managerId}-${vault.vaultId}`}>
        <td className="whitespace-nowrap pl-4 px-3 py-4 text-sm text-gray-500 sm:pl-6 lg:pl-8">
          {vault.vaultId}
        </td>
        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
          {vault.vaultState}
        </td>
        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
          {collateralBrand}
        </td>
        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
          {collateralAmountDisplay}
        </td>
        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
          {oraclePrice}
        </td>
        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
          {collateralValueDisplay}
        </td>
        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
          {debtAmountDisplay}
        </td>
        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
          {collateralizationRatio}
        </td>
        <td className="relative whitespace-nowrap py-4 pr-4 text-right text-sm font-medium sm:pr-4 lg:pr-6">
          <button
            onClick={() => handleCreateNotifier(vault)}
            className="text-indigo-600 hover:text-indigo-900"
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
