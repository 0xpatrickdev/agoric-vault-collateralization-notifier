import { createBrowserRouter } from "react-router-dom";
import Layout from "./layout";
import Notifications from "./pages/notifications";
import Vaults from "./pages/vaults";
import Error from "./pages/error";

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
        element: <Vaults />,
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
        path: "*",
        element: <Error />,
      },
    ],
  },
]);

export { routes, router };
