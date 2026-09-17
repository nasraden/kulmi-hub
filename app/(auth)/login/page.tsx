import Link from "next/link";
import Image from "next/image"; // 1. Kan ayaa ka maqnaa si sawirku u shaqeeyo
import Navbar from "@/components/Navbar";
import LoginForm from "./login-form";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-[#404145]">
      {/* Navbar sare */}
      <Navbar />

      {/* Qaybta 1: Join Kulmi Hub Content */}
      <div className="flex flex-col justify-center py-6 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
       
          
          <h2 className="text-center text-3xl font-extrabold text-[#222325] tracking-tight">
            Join Kulmi Hub
          </h2>
          <p className="mt-2 text-center text-sm text-[#74767e]">
            Create an account to access the AI-powered talent ecosystem.
          </p>
        </div>
      </div>

      {/* Qaybta 2: Log in Content */}
      <div className="mx-auto flex max-w-md w-full flex-col px-6 py-8">
        <h1 className="font-display text-2xl font-semibold text-ink">Log in</h1>
        <p className="mt-2 text-sm text-muted">Welcome back to Kulmi Hub.</p>
        <LoginForm next={searchParams.next ?? ""} />
        <p className="mt-6 text-sm text-muted">
          New here?{" "}
          <Link href="/signup" className="font-medium text-teal-dark hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
