import { createContext, Fragment, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { publicRoutes } from "~/routes";
import { DefaultLayout } from "~/components/Layout";
import { lookInSession } from "./common/session";
import ScrollToTop from "./common/scrollToTop";
import { SocketProvider } from "./context/SocketContext";
import { Toaster } from "react-hot-toast";
export const UserContext = createContext({});

function App() {
  const [userAuth, setUserAuth] = useState({});

  useEffect(() => {
    let userInSession = lookInSession("user");
    userInSession
      ? setUserAuth(JSON.parse(userInSession))
      : setUserAuth({ accessToken: null });
  }, []);

  return (
    <UserContext.Provider value={{ userAuth, setUserAuth }}>
      <SocketProvider>
        <Router>
          <ScrollToTop />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
              },
            }}
          />
          <div className="App">
            <Suspense
              fallback={
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                  }}
                >
                  Loading...
                </div>
              }
            >
              <Routes>
                {publicRoutes.map((route, index) => {
                  let Layout = DefaultLayout;
                  const Page = route.component;

                  if (route.layout) {
                    Layout = route.layout;
                  } else if (route.layout === null) {
                    Layout = Fragment;
                  }

                  return route.children ? (
                    <Route
                      key={index}
                      path={route.path}
                      element={
                        <Layout>
                          <Page />
                        </Layout>
                      }
                    >
                      {route.children.map((child, idx) => (
                        <Route
                          key={idx}
                          path={child.path}
                          element={<child.component />}
                        />
                      ))}
                    </Route>
                  ) : (
                    <Route
                      key={index}
                      path={route.path}
                      element={
                        <Layout>
                          <Page />
                        </Layout>
                      }
                    />
                  );
                })}
              </Routes>
            </Suspense>
          </div>
        </Router>
      </SocketProvider>
    </UserContext.Provider>
  );
}

export default App;
