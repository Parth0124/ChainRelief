import React from "react";
import { Route, Routes } from "react-router-dom";
import { Sidebar, Navbar } from "./components";
import {
  CampaignDetails,
  CreateCampaign,
  Home,
  Profile,
  DonateMaterials,
} from "./pages";
import { StateContextProvider } from "./context/index";
import { ThemeProvider } from "./context/ThemeProvider"; // Import ThemeProvider

const App = () => {
  return (
    <StateContextProvider>
      <ThemeProvider>
        {" "}
        {/* Wrap everything in ThemeProvider */}
        <div className="relative sm:-8 p-4 bg-[#13131a] min-h-screen flex flex-row">
          <div className="sm:flex hidden mr-10 relative">
            <Sidebar />
          </div>
          <div className="flex-1 max-sm:w-full max-w-[1280px] mx-auto sm:pr-5">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/create-campaign" element={<CreateCampaign />} />
              <Route
                path="/campaign-details/:id"
                element={<CampaignDetails />}
              />
              <Route
                path="/donate-materials/:id"
                element={<DonateMaterials />}
              />
            </Routes>
          </div>
        </div>
      </ThemeProvider>
    </StateContextProvider>
  );
};

export default App;
