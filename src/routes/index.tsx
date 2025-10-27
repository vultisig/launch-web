import { ReactNode, Suspense, lazy } from "react";
import {
  RouteObject,
  RouterProvider,
  Navigate,
  createBrowserRouter,
} from "react-router-dom";

import constantPaths from "routes/constant-paths";

const DefaultLayout = lazy(() => import("layouts/default"));

const SwapPage = lazy(() => import("pages/swap"));

interface RouteConfig {
  path: string;
  element?: ReactNode;
  children?: RouteConfig[];
  redirect?: string;
}

const Component = () => {
  const processRoutes = (routes: RouteConfig[]): RouteObject[] => {
    return routes.reduce<RouteObject[]>(
      (acc, { children, element, path, redirect }) => {
        if (redirect) {
          const processedRoute: RouteObject = {
            path,
            element: <Navigate to={redirect} replace />,
          };
          acc.push(processedRoute);
        } else if (element) {
          const processedRoute: RouteObject = {
            path,
            element,
            children: children ? processRoutes(children) : undefined,
          };
          acc.push(processedRoute);
        }

        return acc;
      },
      []
    );
  };

  const routes: RouteConfig[] = [
    {
      path: constantPaths.root,
      element: (
        <Suspense>
          <DefaultLayout />
        </Suspense>
      ),
      children: [
        {
          path: constantPaths.root,
          redirect: constantPaths.swap,
        },
        {
          path: constantPaths.swap,
          element: (
            <Suspense>
              <SwapPage />
            </Suspense>
          ),
        },
        {
          path: "*",
          redirect: constantPaths.root,
        },
      ],
    },
    {
      path: "*",
      redirect: constantPaths.root,
    },
  ];

  const router = createBrowserRouter(processRoutes(routes), {
    basename: constantPaths.basePath,
  });

  return <RouterProvider router={router} />;
};

export type { RouteConfig };

export default Component;
