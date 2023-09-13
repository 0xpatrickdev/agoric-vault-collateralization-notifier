import { Transition } from "@headlessui/react";
/**
 * @param {object} props
 * @param {boolean} props.visible
 * @param {{label: string, value: string}[] | null} props.items
 * @returns {import('@types/react').JSX.Element}
 */
export const InfoBanner = ({ visible, items }) => {
  return (
    <Transition
      as="div"
      appear={true}
      show={visible}
      enter="transition-opacity ease-in-out duration-700"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity ease-in-out duration-700"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="w-100 flex flex-col justify-between bg-gray-100 opacity-90 px-4 py-1.5 sm:rounded-xl my-2">
        {items?.map(({ label, value }) => (
          <span key={label} className="text-sm leading-6 text-gray-500">
            <span className="font-medium">{label}</span>
            <span className="float-right">{value}</span>
          </span>
        ))}
      </div>
    </Transition>
  );
};
