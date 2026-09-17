import React from "react";

export default function ServicesPage() {
  const services = [
    {
      title: "6.1 Talent & Recruitment Services",
      subtitle: "AI-Powered Talent Matching",
      desc: "Businesses post a role or project and the system matches the best-fit verified professionals. This AI matching reduces hiring time from weeks to minutes, changing how recruitment works.",
      icon: "🤖",
    },
    {
      title: "Freelancer Hiring",
      subtitle: "On-Demand Professional Access",
      desc: "Get on-demand access to vetted freelance talent across design, development, writing, and digital marketing. Professionals own their skills story and build their own reputation directly on the platform.",
      icon: "💼",
    },
    {
      title: "Outsourcing & Recruitment",
      subtitle: "Structured Hiring Support",
      desc: "Structured hiring support for businesses building out entire teams or remote functions, closing the gap between skilled talent and real local or international business opportunities.",
      icon: "🌐",
    },
  ];

  const products = [
    {
      name: "Kulmi Hub Platform",
      desc: "The core AI-matching web platform connecting freelancers and companies.",
      target: "Businesses, freelancers, and job seekers",
    },
    {
      name: "Kulmi Certify",
      desc: "Skills verification badges that increase a freelancer's trust and visibility.",
      target: "Freelancers & job seekers",
    },
    {
      name: "Company Talent Pools",
      desc: "A subscription plan giving businesses ongoing access to a dedicated pool of vetted talent.",
      target: "SMEs, startups & growing businesses",
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen text-[#404145]">
      {/* Header */}
      <div className="bg-[#0e2238] text-white py-16 px-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Our Services & Products</h1>
        <p className="text-base max-w-xl mx-auto text-gray-300">
          Intelligent matching, verified skills, and digital professional solutions built for the Somali market.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col gap-12">
        {/* Core Services Section */}
        <section>
          <h2 className="text-2xl font-bold text-[#222325] mb-6 border-b border-gray-200 pb-2">Our Services</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {services.map((srv, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3">
                <span className="text-3xl">{srv.icon}</span>
                <div>
                  <span className="text-xs text-blue-600 font-bold uppercase tracking-wider block mb-1">{srv.subtitle}</span>
                  <h3 className="text-lg font-bold text-[#222325] leading-snug">{srv.title}</h3>
                </div>
                <p className="text-sm text-[#74767e] leading-relaxed mt-2">{srv.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Products Table Section */}
        <section className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-bold text-[#222325] mb-2">7. Our Products / Solutions</h2>
          <p className="text-sm text-[#74767e] mb-6">Innovative digital tools designed to increase transparency and merit-based hiring.</p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#0e2238] text-white font-medium">
                  <th className="p-3 rounded-tl-lg">Product / Solution</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 rounded-tr-lg">Target Customers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((prod, index) => (
                  <tr key={index} className="hover:bg-gray-50/70 transition-colors">
                    <td className="p-3 font-bold text-[#222325] whitespace-nowrap">{prod.name}</td>
                    <td className="p-3 text-[#74767e] leading-relaxed">{prod.desc}</td>
                    <td className="p-3 text-[#404145] font-medium text-xs whitespace-nowrap"><span className="bg-gray-100 px-2.5 py-1 rounded-full">{prod.target}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
