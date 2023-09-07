import { WalletIcon } from "@heroicons/react/20/solid";
import {
  FolderGraphic,
  NotificationBellGraphic,
  LockClosed,
  LockOpen,
  EnvelopeOpen,
} from "./svgGraphics";

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
    <WalletIcon className="mr-1.5 h-5 w-5" aria-hidden="true" />
  ),
  onClick: undefined,
};

export default Empty;
