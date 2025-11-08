"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Avatar } from "@/components/ui/avatar";
import { IconButton } from "@/components/ui/icon-button";
import { Upload, Trash2 } from "lucide-react";


// 🔹 Reusable Section Card
function SectionCard({
  title,
  description,
  onConfigure,
}: {
  title: string;
  description: string;
  onConfigure: () => void;
}) {
  return (
    <div className="border border-[#333] rounded-lg mb-3">
      <div className="p-4 flex items-center justify-between">
        <div>
          <div className="text-white font-semibold">{title}</div>
          <div className="text-sm text-gray-400">{description}</div>
        </div>
        <Button variant="outlined" onClick={onConfigure} className="border-gray-600 text-gray-200 hover:bg-white/5">Configure</Button>
      </div>
    </div>
  );
}


// 🔹 Additional Customization Sections (popups)
function AdvancedCustomization() {
  const [openDialog, setOpenDialog] = useState<null | string>(null);
  const handleOpen = (section: string) => setOpenDialog(section);
  const handleClose = () => setOpenDialog(null);

  return (
    <div className="space-y-3 mt-4">
      <div className="text-white font-semibold text-lg">Advanced Customization</div>

      <SectionCard
        title="Collect Visitor's Info"
        description="Choose which fields you want to collect from visitors."
        onConfigure={() => handleOpen("collectInfo")}
      />

      <SectionCard
        title="Select Fields"
        description="Customize which form fields are visible to users."
        onConfigure={() => handleOpen("selectFields")}
      />

      <SectionCard
        title="Frequently Asked Questions"
        description="Enable or disable quick FAQs for your visitors."
        onConfigure={() => handleOpen("faqs")}
      />

      <SectionCard
        title="Social Chat Channels"
        description="Add buttons for WhatsApp, Messenger, and more."
        onConfigure={() => handleOpen("social")}
      />

      <SectionCard
        title="Custom Visibility"
        description="Set rules for when and where the widget is visible."
        onConfigure={() => handleOpen("visibility")}
      />

      {/* ===================== Modals ===================== */}

      {openDialog === "collectInfo" && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={handleClose} />
          <div className="relative max-w-md mx-auto mt-24 rounded-lg border border-[#333] bg-[#2a2a2a] shadow-lg">
            <div className="p-4 border-b border-[#333] text-white font-semibold">Collect Visitor's Info</div>
            <div className="p-4 space-y-2 text-sm text-gray-200">
              {["Name", "Email", "Phone", "Company"].map((field) => (
                <label key={field} className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#EE66AA]" />
                  <span>{field}</span>
                </label>
              ))}
            </div>
            <div className="p-3 pt-0 flex justify-end gap-2">
              <Button onClick={handleClose} className="bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white">Cancel</Button>
              <Button onClick={handleClose} className="bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white">Save</Button>
            </div>
          </div>
        </div>
      )}

      {openDialog === "selectFields" && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={handleClose} />
          <div className="relative max-w-md mx-auto mt-24 rounded-lg border border-[#333] bg-[#2a2a2a] shadow-lg">
            <div className="p-4 border-b border-[#333] text-white font-semibold">Select Fields</div>
            <div className="p-4 space-y-3">
              <Input placeholder="Custom Field Name" />
              <Input placeholder="Placeholder" />
              <label className="flex items-center gap-2 text-sm text-gray-200">
                <Switch checked={true} onChange={() => {}} />
                <span>Required</span>
              </label>
            </div>
            <div className="p-3 pt-0 flex justify-end gap-2">
              <Button onClick={handleClose} className="bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white">Cancel</Button>
              <Button onClick={handleClose} className="bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white">Save</Button>
            </div>
          </div>
        </div>
      )}

      {openDialog === "faqs" && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={handleClose} />
          <div className="relative max-w-md mx-auto mt-24 rounded-lg border border-[#333] bg-[#2a2a2a] shadow-lg">
            <div className="p-4 border-b border-[#333] text-white font-semibold">Frequently Asked Questions</div>
            <div className="p-4 space-y-3 text-sm text-gray-200">
              <label className="flex items-center gap-2">
                <Switch checked={true} onChange={() => {}} />
                <span>Enable FAQs</span>
              </label>
              <Input placeholder="Question" />
              <textarea rows={3} placeholder="Answer" className="w-full px-4 py-2 rounded-lg bg-[#1e1e1e] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#EE66AA] focus:border-transparent" />
            </div>
            <div className="p-3 pt-0 flex justify-end gap-2">
              <Button onClick={handleClose} className="bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white">Cancel</Button>
              <Button onClick={handleClose} className="bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white">Save</Button>
            </div>
          </div>
        </div>
      )}

      {openDialog === "social" && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={handleClose} />
          <div className="relative max-w-md mx-auto mt-24 rounded-lg border border-[#333] bg-[#2a2a2a] shadow-lg">
            <div className="p-4 border-b border-[#333] text-white font-semibold">Social Chat Channels</div>
            <div className="p-4 space-y-2 text-sm text-gray-200">
              {["WhatsApp","Messenger","Telegram","Instagram"].map((name) => (
                <label key={name} className="flex items-center gap-2">
                  <Switch checked={false} onChange={() => {}} />
                  <span>{name}</span>
                </label>
              ))}
            </div>
            <div className="p-3 pt-0 flex justify-end gap-2">
              <Button onClick={handleClose} className="bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white">Cancel</Button>
              <Button onClick={handleClose} className="bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white">Save</Button>
            </div>
          </div>
        </div>
      )}

      {openDialog === "visibility" && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={handleClose} />
          <div className="relative max-w-md mx-auto mt-24 rounded-lg border border-[#333] bg-[#2a2a2a] shadow-lg">
            <div className="p-4 border-b border-[#333] text-white font-semibold">Custom Visibility</div>
            <div className="p-4 space-y-3">
              <label className="flex items-center gap-2 text-sm text-gray-200">
                <Switch checked={true} onChange={() => {}} />
                <span>Show on Desktop</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-200">
                <Switch checked={true} onChange={() => {}} />
                <span>Show on Mobile</span>
              </label>
              <Input placeholder="Pages to Include (comma separated)" />
              <Input placeholder="Pages to Exclude (comma separated)" />
            </div>
            <div className="p-3 pt-0 flex justify-end gap-2">
              <Button onClick={handleClose} className="bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white">Cancel</Button>
              <Button onClick={handleClose} className="bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white">Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// 🔹 Main Widget Customization Page
export default function WidgetCustomization() {
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
    <>
      {/* 🔹 Basic Customization */}
      <div className="mt-4 border border-[#333] rounded-lg">
        <div className="p-4">
          <div className="text-white font-semibold text-lg mb-4">Widget Customization</div>
          <div className="space-y-4">
            {/* Header Text */}
            <div className="space-y-1">
              <div className="text-sm text-gray-300">Header Text</div>
              <textarea rows={2} value={headerText} onChange={(e) => setHeaderText(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-[#1e1e1e] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#EE66AA] focus:border-transparent" />
            </div>

            {/* Widget Icon */}
            <div className="space-y-2">
              <div className="text-sm text-gray-300">Widget Icon</div>
              <div className="flex flex-wrap gap-2">
                {["chat-smile", "chat-base", "chat-bubble", "chat-db"].map((icon) => (
                  <button key={icon} onClick={() => setWidgetIcon(icon)} className={`w-14 h-14 rounded-md flex items-center justify-center ${widgetIcon === icon ? 'bg-white text-black' : 'bg-white/10 text-white'}`}>
                    <div className="w-8 h-8 rounded-full bg-gray-200 text-black flex items-center justify-center">{icon.slice(-1)}</div>
                  </button>
                ))}
              </div>
              <label className="inline-flex items-center gap-2 text-gray-200 border border-gray-600 px-3 py-2 rounded-md hover:bg-white/5 cursor-pointer">
                <Upload className="w-4 h-4" /> Upload Custom Icon
                <input hidden accept="image/*" type="file" onChange={handleLogoUpload} />
              </label>
            </div>

            {/* Company Logo */}
            <div className="space-y-2">
              <div className="text-sm text-gray-300">Company Logo</div>
              {logo ? (
                <div className="flex items-center gap-3">
                  <Avatar src={logo} size={48 as any} />
                  <IconButton onClick={() => setLogo(null)} className="text-red-400"><Trash2 className="w-4 h-4" /></IconButton>
                </div>
              ) : (
                <label className="inline-flex items-center gap-2 text-gray-200 border border-gray-600 px-3 py-2 rounded-md hover:bg-white/5 cursor-pointer">
                  <Upload className="w-4 h-4" /> Upload Logo
                  <input hidden accept="image/*" type="file" onChange={handleLogoUpload} />
                </label>
              )}
            </div>

            {/* Widget Colors */}
            <div className="space-y-2">
              <div className="text-sm text-gray-300">Widget Color</div>
              <div className="flex items-center gap-3">
                {["#1976d2", "#f44336", "#4caf50", "#ff9800"].map((c) => (
                  <button key={c} onClick={() => setColor(c)} className={`w-9 h-9 rounded-full border ${c === color ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                ))}
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-10 p-0 border-none cursor-pointer" />
              </div>
            </div>

            {/* Collect Visitor Info */}
            <label className="flex items-center gap-2 text-sm text-gray-200">
              <Switch checked={collectInfo} onChange={(v) => setCollectInfo(v)} />
              <span>Collect Visitor Info</span>
            </label>

            {/* FAQs */}
            <label className="flex items-center gap-2 text-sm text-gray-200">
              <Switch checked={faqsEnabled} onChange={(v) => setFaqsEnabled(v)} />
              <span>Enable FAQs</span>
            </label>

            {/* Save Button */}
            <Button className="bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white w-fit">Save Customizations</Button>
          </div>
        </div>
      </div>

      {/* 🔹 Advanced Customization Sections */}
      <AdvancedCustomization />
    </>
  );
}
