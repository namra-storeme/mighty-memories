"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle } from "lucide-react";
import { updateEmailTemplate } from "../actions";

interface TemplateFormProps {
  tpl: {
    id: string;
    title: string;
    desc: string;
    icon: React.ReactNode;
    bg: string;
    defaultSub: string;
    defaultBody: string;
  };
  currentSubject: string;
  currentBody: string;
}

export default function TemplateForm({ tpl, currentSubject, currentBody }: TemplateFormProps) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaved(false);
    
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateEmailTemplate(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
      <input type="hidden" name="templateId" value={tpl.id} />
      
      {/* Success Overlay Flash */}
      <div className={`absolute top-0 left-0 w-full h-1 transition-all duration-500 ${saved ? "bg-green-500" : "bg-transparent"}`} />

      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tpl.bg}`}>
          {tpl.icon}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900">{tpl.title}</h3>
          <p className="text-xs text-gray-500">{tpl.desc}</p>
        </div>
        
        <button 
          type="submit" 
          disabled={isPending}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm ${
            saved 
              ? "bg-green-50 text-green-700 border border-green-200" 
              : "bg-gray-100 text-gray-700 hover:bg-indigo-600 hover:text-white"
          } ${isPending ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          ) : saved ? (
            <><CheckCircle className="w-4 h-4" /> Saved!</>
          ) : (
            "Save"
          )}
        </button>
      </div>
      
      <div className="space-y-4 pl-14">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Subject Line</label>
          <input
            type="text"
            name={`${tpl.id}Subject`}
            defaultValue={currentSubject || tpl.defaultSub}
            required
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 focus:bg-white transition text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Email Body</label>
          <textarea
            name={`${tpl.id}Body`}
            rows={3}
            defaultValue={currentBody || tpl.defaultBody}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 focus:bg-white transition resize-y text-sm leading-relaxed"
          />
        </div>
      </div>
    </form>
  );
}
