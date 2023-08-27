import { WalletIcon } from "@heroicons/react/20/solid";

const NotificationBellGraphic = () => (
  <svg
    className="mx-auto h-12 w-12 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      vectorEffect="non-scaling-stroke"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.143 17.082a24.248 24.248 0 003.844.148m-3.844-.148a23.856 23.856 0 01-5.455-1.31 8.964 8.964 0 002.3-5.542m3.155 6.852a3 3 0 005.667 1.97m1.965-2.277L21 21m-4.225-4.225a23.81 23.81 0 003.536-1.003A8.967 8.967 0 0118 9.75V9A6 6 0 006.53 6.53m10.245 10.245L6.53 6.53M3 3l3.53 3.53"
    />
  </svg>
);

const FolderGraphic = () => (
  <svg
    className="mx-auto h-12 w-12 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      vectorEffect="non-scaling-stroke"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
    />
  </svg>
);

const graphics = {
  vault: FolderGraphic,
  notification: NotificationBellGraphic,
};

const Empty = ({
  title,
  description,
  ButtonIcon,
  buttonText,
  graphic,
  onClick,
}) => {
  const Illustration = graphics[graphic] || graphics.vault;
  return (
    <div className="text-center">
      <div className="mb-6 mt-4">
        <Illustration />
      </div>
      <h3 className="mt-2 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      <div className="mt-6">
        <button
          type="button"
          className="inline-flex w-48 items-center justify-center rounded-md bg-interPurple px-3 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interPurple"
          // className="inline-flex w-32 items-center rounded-md bg-interPurple px-3 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interPurple"
          onClick={onClick}
        >
          <ButtonIcon />
          {buttonText}
        </button>
      </div>
    </div>
  );
};

Empty.defaultProps = {
  title: "No Vaults",
  description: "Connect your wallet to get started.",
  buttonText: "Connect Wallet",
  graphic: "vault",
  ButtonIcon: () => (
    <WalletIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
  ),
  onClick: () => void 0,
};

export default Empty;
