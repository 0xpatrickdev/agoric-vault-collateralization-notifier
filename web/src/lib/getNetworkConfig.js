/**
 * @param {import('@shared/types').NetName} netName
 * @returns {Promise<{ rpc: string, chainName: string }>}
 */
const getNetworkConfig = async (netName = "main") => {
  const response = await fetch(`https://${netName}.agoric.net/network-config`, {
    headers: { accept: "application/json" },
  });
  const networkConfig = await response.json();
  if (!networkConfig?.chainName || !networkConfig?.rpcAddrs?.[0])
    throw new Error("Error fetching network config");

  return {
    rpc: networkConfig.rpcAddrs[0],
    chainName: networkConfig.chainName,
    netName,
  };
};

export { getNetworkConfig };
