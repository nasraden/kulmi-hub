import React from "react";

export default function AboutPage() {
  return (
    <div className="bg-gray-50 min-h-screen text-[#404145]">
      {/* Hero Section */}
      <div className="bg-[#0e2238] text-white py-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">About Kulmi Hub</h1>
        <p className="text-lg max-w-2xl mx-auto text-gray-300">
          An AI-powered talent and outsourcing platform founded in 2026 and based in Hargeisa, Somaliland.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16 flex flex-col gap-12">
        {/* Brand Overview */}
        <section className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-bold text-[#222325] mb-4">Brand Overview</h2>
          <div className="flex flex-col gap-4 text-base leading-relaxed text-[#74767e]">
            <p>
              Kulmi Hub helps businesses find the right professional for their specific needs through AI-powered talent matching, verified skills, and a structured hiring process.
            </p>
            <p>
              Businesses often struggle to identify the right skilled professional for short-term projects, while many skilled young professionals struggle to find relevant opportunities. Existing job boards mainly list vacancies, but they do not provide intelligent matching between a specific business need and the right professional.
            </p>
            <p>
              Our mission is to close the gap between skilled talent and real opportunity. Many talented people in Somaliland and Somalia struggle to find employment despite having the right skills, because the job market often lacks transparency and depends on personal connections rather than merit.
            </p>
          </div>
        </section>

        {/* Vision & Mission Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-[#222325] mb-3">👁️ Our Vision</h3>
            <p className="text-sm text-[#74767e] leading-relaxed">
              To transform the Somali job market over the next five years by introducing modern workforce solutions and digital employment opportunities creating an environment where individuals can work remotely for companies regardless of their location, enabling greater access to jobs, talent, and economic growth across the country.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-[#222325] mb-3">🎯 Our Mission</h3>
            <p className="text-sm text-[#74767e] leading-relaxed">
              To create a platform that connects opportunities in the job market, empowers talented young people, and recognizes and celebrates their skills, achievements, and potential.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <section className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-bold text-[#222325] mb-6">Core Values</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: "Opportunity", desc: "Talent should be seen and hired on merit, regardless of personal connections." },
              { title: "Innovation", desc: "We use AI-powered matching in place of outdated, manual hiring methods." },
              { title: "Trust", desc: "Verified profiles and a transparent process for both freelancers and businesses." },
              { title: "Empowerment", desc: "Professionals own their skills story and build their own reputation on the platform." }
            ].map((val, idx) => (
              <div key={idx} className="border-l-4 border-blue-600 pl-4 py-2">
                <h4 className="font-bold text-[#222325]">{val.title}</h4>
                <p className="text-sm text-[#74767e] mt-1">{val.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
