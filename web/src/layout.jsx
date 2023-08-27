import { useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { routes } from "./router";

import Nav from "./components/nav";

const Layout = () => {
  const { pathname } = useLocation();
  const title = useMemo(
    () => (routes.find(({ to }) => to === pathname) || routes[0]).name,
    [pathname]
  );

  return (
    <>
      <div className="bg-interYellow pb-32">
        <Nav routes={routes} />
        <header className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              {title}
            </h1>
          </div>
        </header>
      </div>

      <main className="-mt-32">
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6">
            <div className="relative h-[calc(100vh-18rem)] overflow-hidden">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Layout;
