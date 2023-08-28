import { useNavigate } from "react-router-dom";
import Empty from "../components/empty";
import { VaultList } from "../components/vaultList";
import { useWallet } from "../contexts/wallet";
import { useChain } from "../contexts/chain";

const Vaults = () => {
  const { connectWallet, wallet } = useWallet();
  const { vaults } = useChain();
  const navigate = useNavigate();

  const connectHandler = () => {
    connectWallet()
      .then(console.log)
      .catch(console.error)
      .finally(() => console.log("connect wallet finished"));
  };

  const handleCreateNotifier = ({ managerId, vaultId }) => {
    navigate(
      `/notifications?action=create&managerId=${managerId}&vaultId=${vaultId}`
    );
  };

  return (
    <>
      {!wallet ? (
        <Empty
          title="No Wallet Connection"
          description="Connect your wallet to get started."
          buttonText="Connect Wallet"
          graphic="vault"
          onClick={connectHandler}
        />
      ) : vaults.length ? (
        <VaultList
          vaults={vaults}
          handleCreateNotifier={handleCreateNotifier}
        />
      ) : (
        <Empty
          title="No Vaults Found"
          description="Notifications can be created without a wallet connection."
          buttonText="Create Notification"
          graphic="vault"
          onClick={() => navigate("/notifications")}
        />
      )}
    </>
  );
};

export default Vaults;
