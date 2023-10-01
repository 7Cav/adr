import { Outlet } from "react-router-dom";

//This will be used in future implementations for an overall Nav Bar. For now this code is set to solely disply the contents of the page you are currently on.
//so for the love of god, dont delete the Outlet return.

const Layout = () => {
  return (
    <>
      <Outlet/>
    </>
  )
};

export default Layout;
