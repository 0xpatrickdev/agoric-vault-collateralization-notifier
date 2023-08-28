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

const LockOpen = () => (
  <svg
    className="mx-auto h-12 w-12 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
    />
  </svg>
);

const LockClosed = () => (
  <svg
    className="mx-auto h-12 w-12 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
    />
  </svg>
);

const EnvelopeOpen = () => (
  <svg
    className="mx-auto h-12 w-12 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z"
    />
  </svg>
);

const graphics = {
  vault: FolderGraphic,
  notification: NotificationBellGraphic,
  lockOpen: LockOpen,
  lockClosed: LockClosed,
  envelopeOpen: EnvelopeOpen,
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
      {title ? (
        <h3 className="mt-2 text-sm font-semibold text-gray-900">{title}</h3>
      ) : null}
      {description ? (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      ) : null}
      <div className="mt-6">
        {onClick ? (
          <button
            type="button"
            className="inline-flex w-48 items-center justify-center rounded-md bg-interPurple px-3 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interPurple"
            // className="inline-flex w-32 items-center rounded-md bg-interPurple px-3 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interPurple"
            onClick={onClick}
          >
            <ButtonIcon />
            {buttonText}
          </button>
        ) : null}
      </div>
    </div>
  );
};

Empty.defaultProps = {
  title: undefined,
  description: undefined,
  buttonText: "Connect Wallet",
  graphic: "vault",
  ButtonIcon: () => (
    <WalletIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
  ),
  onClick: undefined,
};

export default Empty;
