"use client";

import React, { useState } from "react";

export default function ContactForm() {
  const [pending, setPending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setTimeout(() => setPending(false), 1500);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm md:col-span-3">
      <h2 className="font-display text-xl font-bold text-[#222325]">
        Send us a Message
      </h2>
      
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
            <input 
              type="text" 
              required 
              placeholder="John Doe"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#04277c] focus:border-[#04277c] text-[#222325]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
            <input 
              type="email" 
              required 
              placeholder="you@example.com"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#04277c] focus:border-[#04277c] text-[#222325]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Subject</label>
          <input 
            type="text" 
            required 
            placeholder="Partnership Inquiries"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#04277c] focus:border-[#04277c] text-[#222325]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Message</label>
          <textarea 
            rows={4} 
            required 
            placeholder="How can we help your business or talent journey?"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#04277c] focus:border-[#04277c] text-[#222325]"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full py-2.5 bg-[#04277c] hover:bg-[#008291] text-white font-bold text-sm rounded-lg shadow-sm transition-all disabled:opacity-70"
        >
          {pending ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}
