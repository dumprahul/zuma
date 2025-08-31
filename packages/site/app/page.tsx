"use client";

import { ShimmerButton } from "@/components/magicui/shimmer-button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>
      
      {/* Main content */}
      <div className="relative z-10 text-center">
                  {/* Zuma Logo/Title */}
          <div className="mb-8">
            <h1 className="text-8xl md:text-9xl font-bold text-white mb-4 ">
              zuma.
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-semibold max-w-2xl mx-auto leading-relaxed">
              a privacy-preserving event management with Zama FHE
            </p>
          </div>

        {/* Glassy Cylinder Navbar */}
        <div className="relative">
          {/* Cylinder shape with curved edges */}
          <div className="glass rounded-full py-4 px-2 shadow-2xl w-fit mx-auto">
            <div className="flex items-center justify-center space-x-2">
              {/* Create Button */}
              <Link href="/create">
                <ShimmerButton
                  shimmerColor="#60a5fa"
                  background="rgba(59, 130, 246, 0.2)"
                  borderRadius="50px"
                  shimmerDuration="2s"
                  className="glass text-white border-white/30 hover:border-white/50 transition-all duration-300"
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="font-semibold">Create</span>
                  </div>
                </ShimmerButton>
              </Link>

              {/* Attend Button */}
              <Link href="/attend">
                <ShimmerButton
                  shimmerColor="#34d399"
                  background="rgba(52, 211, 153, 0.2)"
                  borderRadius="50px"
                  shimmerDuration="2s"
                  className="glass text-white border-white/30 hover:border-white/50 transition-all duration-300"
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-semibold">Attend</span>
                  </div>
                </ShimmerButton>
              </Link>

              {/* Your Events Button */}
              <Link href="/events">
                <ShimmerButton
                  shimmerColor="#f59e0b"
                  background="rgba(245, 158, 11, 0.2)"
                  borderRadius="50px"
                  shimmerDuration="2s"
                  className="glass text-white border-white/30 hover:border-white/50 transition-all duration-300"
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-semibold">Your Events</span>
                  </div>
                </ShimmerButton>
              </Link>
            </div>
          </div>

          {/* Subtle glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 via-green-500/20 to-yellow-500/20 blur-3xl -z-10"></div>
        </div>


      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${(i * 5.5) % 100}%`,
              top: `${(i * 3.7 + 10) % 100}%`,
              animationDelay: `${(i * 0.2) % 3}s`,
              animationDuration: `${2 + (i * 0.1) % 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}
