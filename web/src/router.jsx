import { redirect, createBrowserRouter } from "react-router-dom";
import Layout from "./layout";
import Notifications from "./pages/notifications";
import Vaults from "./pages/vaults";
import Verify from "./pages/verify";
import Error from "./pages/error";
import VerificationSent from "./pages/verification-sent";

const routes = [
  { name: "My Vaults", to: "/vaults" },
  { name: "My Notifications", to: "/notifications" },
];

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        loader: () => redirect("/vaults"),
      },
      {
        path: "verify",
        element: <Verify />,
      },
      {
        path: "vaults",
        element: <Vaults />,
      },
      {
        path: "notifications",
        element: <Notifications />,
      },
      {
        path: "verification-sent",
        element: <VerificationSent />,
      },
      {
        path: "*",
        element: <Error />,
      },
    ],
  },
]);

export { routes, router };
