"use client";
import React, { useState } from "react";
import WidgetCustomization from "../../components/dashboard/WidgetCustomization";
import PreviewContainer from "../../components/dashboard/PreviewContainer";

const Manage = () => {
  // States
  const [headerText, setHeaderText] = useState("👋 Our team is here for you");
  const [widgetIcon, setWidgetIcon] = useState("chat-bubble");
  const [logo, setLogo] = useState<string | null>(null);
  const [color, setColor] = useState("#1976d2");
  const [collectInfo, setCollectInfo] = useState(true);
  const [faqsEnabled, setFaqsEnabled] = useState(true);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = URL.createObjectURL(e.target.files[0]);
      setLogo(file);
    }
  };

  return (
    <div className="p-3">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <WidgetCustomization />
        </div>
        <div>
          <div className="sticky top-4">
            <PreviewContainer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Manage;
