"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Fingerprint, Lock, User, ArrowRight, AlertCircle } from "lucide-react";
import { InteractiveBackground } from "@/components/ui/InteractiveBackground";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        nim: username,
        password: password,
        redirect: false,
      });

      if (result?.error) {
        setError("AUTHENTICATION_FAILED: NIM atau password salah.");
        setIsLoading(false);
      } else {
        // Success: Redirect to root, middleware will handle role-based routing
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setError("SYSTEM_ERROR: Connection to authentication server failed.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-white overflow-hidden">
        {/* Interactive Background */}
        <InteractiveBackground />

        {/* Login Container */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative z-10 w-full max-w-md px-6"
        >
            <div className="bg-white/80 backdrop-blur-md border border-zinc-300 p-8 shadow-[10px_10px_0px_0px_rgba(228,228,231,1)]">
                {/* Header */}
                <div className="mb-10 text-center">
                    <div className="inline-flex items-center justify-center p-3 border border-zinc-200 mb-6 group transition-colors hover:border-zinc-400">
                        <Fingerprint className="text-zinc-600 group-hover:text-zinc-900 transition-colors" size={32} />
                    </div>
                    <h1 className="text-2xl font-mono font-light tracking-widest text-zinc-900 uppercase">
                        System Access
                        <span className="animate-terminal-blink ml-1 text-zinc-400">_</span>
                    </h1>
                    <p className="text-[10px] font-mono text-zinc-400 mt-2 tracking-tighter uppercase italic">
                        [ HYDE_AUTH_PROTOCOL // V3.2.0-REL ]
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-red-50 border border-red-200 p-3 flex items-start gap-3"
                        >
                            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={14} />
                            <p className="text-[10px] font-mono text-red-600 uppercase leading-relaxed">
                                {error}
                            </p>
                        </motion.div>
                    )}
                    <div className="space-y-1.5 relative group">
                        <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block pl-1">
                            Username / NIM
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 z-10">
                                <User size={16} />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full h-12 bg-white/50 border border-zinc-200 pl-10 pr-4 text-sm font-mono focus:outline-none focus:border-zinc-900 focus:bg-white transition-all rounded-none placeholder:text-zinc-300"
                                placeholder="ENTER_IDENTIFIER..."
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5 relative group">
                        <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block pl-1">
                            Access Key
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 z-10">
                                <Lock size={16} />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-12 bg-white/50 border border-zinc-200 pl-10 pr-4 text-sm font-mono focus:outline-none focus:border-zinc-900 focus:bg-white transition-all rounded-none placeholder:text-zinc-300"
                                placeholder="ENTER_KEY_FRAGMENT..."
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="relative w-full h-12 bg-zinc-900 text-white font-mono text-sm uppercase tracking-[0.2em] flex items-center justify-center group overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <span className="relative z-10 flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-300">
                                {isLoading ? "[ Authenticating... ]" : "[ Execute Login ]"}
                                {!isLoading && <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}
                            </span>
                            
                            {/* Animated background element for the button */}
                            <div className="absolute inset-0 bg-zinc-800 translate-x-[-100%] group-hover:not-disabled:translate-x-0 transition-transform duration-500 ease-in-out" />
                        </button>
                    </div>
                </form>

                {/* Footer decorations */}
                <div className="mt-10 pt-6 border-t border-zinc-100 flex items-center justify-between">
                    <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 bg-zinc-200" />
                        <div className="w-1.5 h-1.5 bg-zinc-300" />
                        <div className="w-1.5 h-1.5 bg-zinc-900/10" />
                    </div>
                    <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
                        Status: Secure_Link_Ready
                    </span>
                </div>
            </div>

            {/* Background elements */}
            <div className="absolute -top-12 -right-12 w-24 h-24 border-t border-r border-zinc-200 pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-24 h-24 border-b border-l border-zinc-200 pointer-events-none" />
        </motion.div>

        {/* Peripheral info */}
        <div className="fixed bottom-6 right-6 z-20 hidden md:block">
            <div className="flex flex-col items-end gap-1">
                <div className="h-px w-32 bg-zinc-200" />
                <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-tighter">
                   LOCAL_DATETIME: {mounted ? `${new Date().toISOString().split('T')[0]} // ${new Date().toLocaleTimeString()}` : "LOADING..."}
                </p>
                <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-tighter">
                    NODE_REF: HYDE_GATEWAY_AUTH_SERVER
                </p>
            </div>
        </div>
    </div>
  );
}
