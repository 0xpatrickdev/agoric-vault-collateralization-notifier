const NotifierList = ({
  notifiers,
  handleCreateNotifier,
  handleDeleteNotifier,
}) => {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="block rounded-md bg-interPurple px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interPurple"
            onClick={handleCreateNotifier}
          >
            Create Notifier
          </button>
        </div>
      </div>
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
                    Vault Manager Id
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Vault ID
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Collateralization Ratio
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
                {notifiers.map((notifier) => (
                  <tr key={notifier.id}>
                    <td className="whitespace-nowrap pl-4 px-3 py-4 text-sm text-gray-500 sm:pl-6 lg:pl-8">
                      {/* {
                        vault?.locked?.brand
                          ?.toString()
                          ?.split("Alleged: ")[1]
                          ?.split(" brand")[0]
                      } */}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {notifier.vaultManagerId}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {notifier.vaultId}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {/* to do, current collateralizationRatio */}
                      {/* {vault?.locked?.value?.toString()} */}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {notifier.collateralizationRatio}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export { NotifierList };
