import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import SignupForm from "./signup-form";

export default function SignupPage({
  searchParams,
}: {
  searchParams: { role?: string };
}) {
  const role = searchParams.role === "company" ? "company" : "talent";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-[#404145]">
      {/* Navbar sare */}
      <Navbar />

      {/* Qaybta 1: Join Kulmi Hub Content */}
      <div className="flex flex-col justify-center py-6 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        

          <h1 className="font-display text-2xl font-semibold text-ink text-center">
            {role === "company" ? "Find talent on Kulmi Hub" : "Join Kulmi Hub as talent"}
          </h1>
          <p className="mt-2 text-sm text-muted text-center">
            {role === "company"
              ? "Create an account, then set up your company profile and post your first job."
              : "Create an account, then build a profile companies can match against."}
          </p>

          {/* Doorashada Badamada ee u dhaxeysa Talent iyo Company */}
          <div className="w-full mt-6 bg-white p-4 shadow-sm border border-gray-200 rounded-xl">
            <label className="block text-sm font-semibold text-[#222325] mb-2.5 text-center">
              Select how you want to join Kulmi Hub:
            </label>
            <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 rounded-lg mb-6">
              <Link
                href="/signup?role=talent"
                className={`py-2 text-sm font-bold text-center rounded-md transition-all ${
                  role === "talent"
                    ? "bg-[#04277c] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                🎓 Join as Talent
              </Link>
              <Link
                href="/signup?role=company"
                className={`py-2 text-sm font-bold text-center rounded-md transition-all ${
                  role === "company"
                    ? "bg-[#04277c] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                🏢 Join as Company
              </Link>
            </div>
            
            {/* 
              Halkan waxaan u gudbinay role={role} foomkaaga hoose 
              si uu badanka hoose iyo inputs-ka u beddelo asaga oo aan xogtaada database-ka taabanayn
            */}
            <div className="w-full">
              <SignupForm role={role} />
            </div>
          </div>

          <p className="mt-6 text-sm text-muted text-center">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-teal-dark hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
