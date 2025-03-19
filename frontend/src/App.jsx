import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CampaignDetails, Home, Profile, CreateCampaign } from "./pages";
import {Sidebar, Navbar} from './components'

function App() {
  return (
    <BrowserRouter>
      <div className="relative sm:-8 p-4 bg-[#13131a] min-h-screen flex flex-row">
        <div className="sm:flex hidden mr-10 relative">
          {/* Sidebar component should go here */}
          <Sidebar />
        </div>
        <div className="flex max-sm:w-full max-w-[1280px] mx-auto sm:pr-5">
          {/* Navbar component should go here */}
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/create-campaign" element={<CreateCampaign />} />
            <Route path="/campaign-details/:id" element={<CampaignDetails />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
