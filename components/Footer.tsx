import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  // 1. Habaynta Khaanadaha (Categories)
  const categories = [
    {
      title: "Shirkadda ",
      links: [
        { label: "Ku Saabsan Kulmi", href: "/about" },
        { label: "Xiriirka & Caawinaadda", href: "/contact" },
        { label: "Amniga & Kalsoonida", href: "/trust" },
        { label: "Fursadaha Shaqo", href: "/careers" },
      ],
    },
    {
      title: "Adeegyada",
      links: [
        { label: "AI Talent Matching", href: "/services" },
        { label: "Freelancer Hiring", href: "/services" },
        { label: "Outsourcing Support", href: "/services" },
        { label: "Kulmi Certify", href: "/services" },
      ],
    },
    {
      title: "Shuruudaha",
      links: [
        { label: "Shuruudaha Adeegga", href: "/terms" },
        { label: "Xogta Gaarka Ah", href: "/privacy" },
      ],
    },
  ];

  return (
    <footer className="w-full border-t border-gray-200 bg-white text-[#404145]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        
        {/* QAYBTA SARE: Khaanadaha (Grid Sections) */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {categories.map((cat, index) => (
            <div key={index} className="flex flex-col gap-4">
              <h3 className="font-bold text-[#222325] text-base">{cat.title}</h3>
              <ul className="flex flex-col gap-3 text-sm text-[#74767e]">
                {cat.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link href={link.href} className="hover:underline transition-colors duration-150">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Khaanadda Afraad/Shanaad: Qoraalka Hadafka Shirkadda */}
          <div className="col-span-2 flex flex-col gap-4 md:col-span-2">
            <h3 className="font-bold text-[#222325] text-base">Hadafkayaga</h3>
            <p className="text-sm text-[#74767e] leading-relaxed">
              Kulmi Hub — built for Hargeisa, growing across the Somali regions. 
              Waxaan nahay madal ku shaqaysa tignoolajiyada AI oo isku xirta xirfadlayaasha ugu fiican iyo fursadaha shaqo ee casriga ah ee ku salaysan aqoonta iyo waayo-aragnimada.
            </p>
          </div>
        </div>

        {/* QAYBTA HOOSE: Logo, Xuquuqda & Doorashooyinka */}
        <div className="mt-12 border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Dhanka Bidix: Logo-gaaga rasmiga ah & Copyright */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="relative w-36 h-10 flex items-center">
              {/* Image wuxuu toos u akhrinayaa folder-ka public */}
              <Image 
                src="/brand/kulmi.png" 
                alt="Kulmi Hub Logo" 
                width={40}
                height={7}
                className="object-contain"
                priority
              />
            </div>
            <span className="text-sm text-[#b5b6ba] md:border-l md:border-gray-200 md:pl-4">
              © {new Date().getFullYear()} Kulmi Hub. All rights reserved.
            </span>
          </div>

          {/* Dhanka Midig: Luqadda & Lacagta */}
          <div className="flex items-center gap-6 text-sm font-medium text-[#74767e]">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1 hover:text-gray-900">
                🌐 Somali / English
              </button>
              <button className="flex items-center gap-1 hover:text-gray-900">
                $ USD
              </button>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
