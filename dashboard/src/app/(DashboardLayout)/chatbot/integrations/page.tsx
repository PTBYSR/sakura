"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Info, ChevronRight } from "lucide-react";
import Image from "next/image";

interface IntegrationCardProps {
  name: string;
  desc: string;
  icon: string; // image URL
  disabled?: boolean;
}

const integrations = [
  {
    name: "WhatsApp",
    desc: "Connect your WhatsApp and chat with visitors directly",
    icon: "/images/integration-logo/whatsapp.png",
    disabled: false,
  },
  {
    name: "Facebook Messenger",
    desc: "Streamline your conversations, all in one place",
    icon: "/images/integration-logo/facebook.png",
    disabled: false,
  },
  {
    name: "Instagram",
    desc: "Streamline your conversations, all in one place",
    icon: "/images/integration-logo/instagram.png",
    disabled: true,
  },
  {
    name: "Email",
    desc: "Manage all customer emails within Chatway inbox",
    icon: "/images/integration-logo/email.png",
    disabled: true,
  },
  {
    name: "Shopify",
    desc: "Get Chatway up and running on your Shopify store",
    icon: "/images/integration-logo/whatsapp.png",
    disabled: true,
  },

];



const IntegrationCard: React.FC<IntegrationCardProps> = ({ name, desc, icon, disabled }) => {
  return (
    <div className="flex flex-col gap-3 border border-[#333] rounded-lg p-4 bg-[#1d1d1d]">
      <Image src={icon} alt={name} width={30} height={30} />
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="text-white font-semibold">{name}</div>
          <IconButton className="text-gray-300">
            <Info className="h-4 w-4" />
          </IconButton>
        </div>
        <div className="text-sm text-gray-300 leading-snug">{desc}</div>
      </div>
      <div>
        <Button
          disabled={disabled}
          className={`${disabled ? 'border border-gray-600 text-gray-300 bg-transparent' : 'bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white'} px-4 py-2 inline-flex items-center gap-2`}
        >
          {disabled ? 'Coming Soon' : 'Connect Now'}
          {!disabled && <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};


export default function IntegrationSettingsPage() {
  const [iosUrl, setIosUrl] = useState("");
  const [androidUrl, setAndroidUrl] = useState("");

  return (
    <div className="p-4 space-y-4">
      <div className="text-white font-semibold text-xl">Integration Settings</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((app) => (
          <IntegrationCard
            key={app.name}
            name={app.name}
            desc={app.desc}
            icon={app.icon}
            disabled={true}
          />
        ))}

        <div className="border border-[#333] rounded-lg p-4 bg-[#1d1d1d]">
          <div className="text-white font-semibold text-lg mb-1">Couldn’t find what you’re looking for?</div>
          <div className="text-sm text-gray-300 mb-3">Contact us for more integrations and support.</div>
          <Button className="bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white">Contact Us</Button>
        </div>
      </div>
    </div>
  );
}
