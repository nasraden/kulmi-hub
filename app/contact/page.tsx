import React from "react";
import Navbar from "@/components/Navbar";
import ContactForm from "./contact-form"; // 👈 Waxaan soo xiganay foomkii madax-bannaan

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-[#404145]">
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 py-16">
        {/* Header-ka Sare */}
        <div className="rounded-2xl bg-[#04277c] px-6 py-12 text-center shadow-sm sm:px-12">
          <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
            Get in Touch
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-blue-100">
            Have questions? We are here to support your talent and business journey.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-5">
          {/* DHANCA BIDIX: Xogta Xiriirka */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm md:col-span-2">
            <h2 className="font-display text-xl font-bold text-[#222325]">
              Contact Information
            </h2>
            <div className="mt-6 space-y-4">
              <p className="text-sm"><strong>📍 Location:</strong> Hargeisa, Somaliland</p>
              <p className="text-sm"><strong>✉️ Email:</strong> admin@kulmihub.com</p>
              <p className="text-sm"><strong>📞 Phone:</strong> 0639092630</p>
            </div>
          </div>

          {/* DHANCA MIDIG: Waxaan toos u ruxnay foomka Dynamic-ga ah */}
          <ContactForm />
        </div>
      </main>
    </div>
  );
}
