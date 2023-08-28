const VaultList = ({ vaults, handleCreateNotifier }) => {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6 lg:pl-8"
                  >
                    Collateral
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
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
                    Locked
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Debt
                  </th>
                  <th
                    scope="col"
                    className="relative py-3.5 pr-4 sm:pr-4 lg:pr-6"
                  >
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {vaults.map((vault) => (
                  <tr key={`${vault.managerId}-${vault.vaultId}`}>
                    <td className="whitespace-nowrap pl-4 px-3 py-4 text-sm text-gray-500 sm:pl-6 lg:pl-8">
                      {
                        vault?.locked?.brand
                          ?.toString()
                          ?.split("Alleged: ")[1]
                          ?.split(" brand")[0]
                      }
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {vault.vaultId}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {vault.vaultState}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {vault?.locked?.value?.toString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {vault?.debtSnapshot?.debt?.value?.toString()}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export { VaultList };
