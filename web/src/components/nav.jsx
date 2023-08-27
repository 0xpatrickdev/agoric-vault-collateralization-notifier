import { NavLink } from "react-router-dom";
import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { classNames } from "../utils/classNames";
import interLogo from "/inter.svg";

/**
 * @typedef {object} RouteConfig
 * @property {string} name header display title
 * @property {string} to pathname
 */

/**
 * @typedef {object} NavProps
 * @property {RouteConfig[]} routes list of navigation routes
 */

/**
 * @param {NavProps} props
 * @returns {import('@types/react').JSX.Element}
 */
const Nav = ({ routes }) => (
  <Disclosure
    as="nav"
    className="border-b border-interYellow3 border-opacity-25 bg-600 lg:border-none"
  >
    {({ open }) => (
      <>
        <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
          <div className="relative flex h-16 items-center justify-between lg:border-b lg:border-interYellow4 lg:border-opacity-25">
            <div className="flex items-center px-2 lg:px-0">
              <div className="flex-shrink-0">
                <img
                  className="block h-8 w-24"
                  src={interLogo}
                  alt="Inter Protocol"
                />
              </div>
              <div className="hidden lg:ml-10 lg:block">
                <div className="flex space-x-4">
                  {routes.map((item) => (
                    <NavLink
                      to={item.to}
                      key={item.name}
                      className={({ isActive }) =>
                        classNames(
                          isActive
                            ? "bg-interYellow7 text-slate-950"
                            : "text-slate-950 hover:bg-interYellow5 hover:bg-opacity-75",
                          "rounded-md py-2 px-3 text-sm font-medium"
                        )
                      }
                      aria-current={item.current ? "page" : undefined}
                    >
                      {item.name}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex lg:hidden">
              {/* Mobile menu button */}
              <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md bg-interYellow p-2 text-interYellow2 hover:bg-interYellow5 hover:bg-opacity-75 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-interYellow">
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open main menu</span>
                {open ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </Disclosure.Button>
            </div>
          </div>
        </div>

        <Disclosure.Panel className="lg:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {routes.map((item) => (
              <NavLink
                key={item.name}
                as={Disclosure.Button}
                to={item.to}
                className={({ isActive }) =>
                  classNames(
                    isActive
                      ? "bg-interYellow7 text-slate-950"
                      : "text-slate-950 hover:bg-interYellow5 hover:bg-opacity-75",
                    "block rounded-md py-2 px-3 text-base font-medium"
                  )
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>
        </Disclosure.Panel>
      </>
    )}
  </Disclosure>
);

export default Nav;
