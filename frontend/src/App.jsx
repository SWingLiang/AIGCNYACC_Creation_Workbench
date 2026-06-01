
import React, { useState } from "react";
import V1Page from "./pages/V1Page.jsx";

export default function App() {
  const [profile, setProfile] = useState({
    username: "Wing",
    gradeKey: "primary",
    gradeNumber: 1,
    eventId: "P1",
    beans: 365
  });

  return <V1Page profile={profile} setProfile={setProfile} />;
}
