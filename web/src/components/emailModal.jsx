import { Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { EnvelopeOpenIcon } from "@heroicons/react/24/outline";

const EmailModal = ({
  title,
  description,
  visible,
  setIsVisible,
  handleSubmit,
  validationError,
  onFocus,
  inputLabel,
  buttonLabel,
}) => {
  const cancelButtonRef = useRef(null);
  const emailRef = useRef(null);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const emailValue = emailRef.current.value;
    handleSubmit(emailValue);
  };

  return (
    <Transition.Root show={visible} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={() => setIsVisible(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-interPurple bg-opacity-40 sm:mx-0 sm:h-10 sm:w-10">
                    <EnvelopeOpenIcon
                      className="h-6 w-6 text-interPurple"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold leading-6 text-gray-900"
                    >
                      {title}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">{description}</p>
                    </div>
                  </div>
                </div>
                <form
                  className="mt-5 sm:flex sm:items-center sm:ml-10"
                  onSubmit={handleFormSubmit}
                >
                  <div className="w-full sm:max-w-xs">
                    <label htmlFor="email" className="sr-only">
                      {inputLabel}
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      ref={emailRef}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-interPurple sm:text-sm sm:leading-6"
                      placeholder="you@example.com"
                      onFocus={onFocus}
                    />
                  </div>
                  <button
                    type="submit"
                    className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-interPurple px-3 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interPurple sm:ml-3 sm:mt-0 sm:w-auto"
                  >
                    {buttonLabel}
                  </button>
                </form>
                <div className="mt-2 p-2 text-red-500 text-sm text-center">
                  {validationError ? validationError : ""}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

EmailModal.defaultProps = {
  visible: true,
  title: undefined,
  inputLabel: "Email",
  buttonLabel: "Submit",
  description:
    "Your email address is only used to send notifications configured in the next step. A magic link will be sent to your email for verifcation and passwordless authentication.",
};

export { EmailModal };
