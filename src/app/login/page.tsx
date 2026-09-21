"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, User, GraduationCap, Loader2, ArrowLeft, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";

import { usePortal } from "@/context/PortalContext";
import { useToast } from "@/context/ToastContext";
import { translations } from "@/context/translations";
import { MadrasaLogoIcon } from "@/components/MadrasaLogo";

export default function LoginPage() {
  const router = useRouter();
  const { login, language, setLanguage, theme, toggleTheme } = usePortal();
  const { showToast } = useToast();

  const t = (key: keyof typeof translations["en"]) => {
    const dict = translations[language] || translations["en"];
    return dict[key] || translations["en"][key] || key;
  };

  // Active tab state: "admin" | "student"
  const [activeTab, setActiveTab] = useState<"admin" | "student">("admin");

  // Admin / Staff Inputs
  const [adminIdentifier, setAdminIdentifier] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Student Inputs
  const [studentIdentifier, setStudentIdentifier] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [showStudentPassword, setShowStudentPassword] = useState(false);

  // Shared options
  const [rememberMe, setRememberMe] = useState(true);

  // Loading and error state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!adminIdentifier.trim() || !adminPassword.trim()) {
      const msg = "Please enter your Email Address and Password.";
      setErrorMessage(msg);
      showToast(msg, "error");
      return;
    }

    setIsLoading(true);

    try {
      const result = await login("admin", adminIdentifier.trim(), adminPassword.trim());
      setIsLoading(false);

      if (result.success) {
        showToast("Welcome back! Redirecting to Dashboard...", "success");
        router.push("/admin");
      } else {
        const errorText = result.error || "Invalid email or password.";
        setErrorMessage(errorText);
        showToast(errorText, "error");
      }
    } catch {
      setIsLoading(false);
      const errorText = "Database or network connection error. Please try again.";
      setErrorMessage(errorText);
      showToast(errorText, "error");
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!studentIdentifier.trim() || !studentPassword.trim()) {
      const msg = "Please enter your Student ID and Password.";
      setErrorMessage(msg);
      showToast(msg, "error");
      return;
    }

    setIsLoading(true);

    try {
      const result = await login("student", studentIdentifier.trim(), studentPassword.trim());
      setIsLoading(false);

      if (result.success) {
        showToast("Authenticated successfully. Welcome to your Dashboard!", "success");
        router.push("/student");
      } else {
        const errorText = result.error || "Invalid Student ID or password.";
        setErrorMessage(errorText);
        showToast(errorText, "error");
      }
    } catch {
      setIsLoading(false);
      const errorText = "Database or network connection error. Please try again.";
      setErrorMessage(errorText);
      showToast(errorText, "error");
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-6 overflow-hidden transition-colors duration-300">
      {/* Background ambient glowing shapes */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-[15%] right-[10%] w-[320px] h-[320px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] left-[5%] w-[350px] h-[350px] bg-teal-500/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* Top Header bar */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between pointer-events-auto z-20">
        <Link
          href="/"
          className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 flex items-center gap-2 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {t("back_to_home")}
        </Link>

        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as "en" | "ar" | "so")}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 text-slate-700 dark:text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer font-semibold transition-all shadow-sm"
          >
            <option value="en">English</option>
            <option value="ar">العربية (Arabic)</option>
            <option value="so">Somali</option>
          </select>

          {/* Theme switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 rounded-xl text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all shadow-sm"
            title="Toggle Light/Dark Theme"
          >
            {theme === "dark" ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative z-10 my-12"
      >
        {/* Top accent glow line */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[3px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent rounded-full" />

        {/* Brand header */}
        <div className="flex flex-col items-center gap-2 mb-6 text-center">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 dark:text-emerald-400 shadow-inner">
            <MadrasaLogoIcon className="w-10 h-10" colorClass="text-emerald-500 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50 mt-1">
            Madarasah Badru-diin
          </h1>
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Management Portal Login
          </p>
        </div>

        {/* Dynamic Error Alert */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 text-rose-600 dark:text-rose-400 text-xs font-medium"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6 relative">
          <button
            type="button"
            onClick={() => {
              if (!isLoading) {
                setActiveTab("admin");
                setErrorMessage(null);
              }
            }}
            disabled={isLoading}
            className={`py-2.5 text-xs md:text-sm font-bold rounded-xl transition-all relative z-10 flex items-center justify-center gap-2 ${activeTab === "admin"
                ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
          >
            <Lock className="w-4 h-4" />
            Admin / Staff
            {activeTab === "admin" && (
              <motion.div
                layoutId="active-tab-glow"
                className="absolute inset-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-emerald-500/30 rounded-xl -z-10 shadow-sm"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (!isLoading) {
                setActiveTab("student");
                setErrorMessage(null);
              }
            }}
            disabled={isLoading}
            className={`py-2.5 text-xs md:text-sm font-bold rounded-xl transition-all relative z-10 flex items-center justify-center gap-2 ${activeTab === "student"
                ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
          >
            <GraduationCap className="w-4 h-4" />
            Student Login
            {activeTab === "student" && (
              <motion.div
                layoutId="active-tab-glow"
                className="absolute inset-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-emerald-500/30 rounded-xl -z-10 shadow-sm"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        </div>

        {/* Forms Container */}
        <AnimatePresence mode="wait">
          {activeTab === "admin" ? (
            <motion.form
              key="admin-form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleAdminSubmit}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5 text-left">
                <label htmlFor="admin-email" className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    id="admin-email"
                    type="text"
                    placeholder="e.g. admin@madrasa.com"
                    value={adminIdentifier}
                    onChange={(e) => setAdminIdentifier(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500/50 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label htmlFor="admin-pass" className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    id="admin-pass"
                    type={showAdminPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500/50 rounded-xl py-3 pl-10 pr-10 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    title={showAdminPassword ? "Hide password" : "Show password"}
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me option */}
              <div className="flex items-center justify-between text-xs my-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-800 text-emerald-500 focus:ring-emerald-500/30"
                  />
                  Remember me
                </label>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Secure Session</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Login to Admin Dashboard</span>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="student-form"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleStudentSubmit}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5 text-left">
                <label htmlFor="student-id-input" className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Student ID
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    id="student-id-input"
                    type="text"
                    placeholder="e.g. STU-1001"
                    value={studentIdentifier}
                    onChange={(e) => setStudentIdentifier(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500/50 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label htmlFor="student-pass-input" className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    id="student-pass-input"
                    type={showStudentPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500/50 rounded-xl py-3 pl-10 pr-10 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowStudentPassword(!showStudentPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    title={showStudentPassword ? "Hide password" : "Show password"}
                  >
                    {showStudentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me option */}
              <div className="flex items-center justify-between text-xs my-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-800 text-emerald-500 focus:ring-emerald-500/30"
                  />
                  Remember me
                </label>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Student Portal</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Verifying credentials...</span>
                  </>
                ) : (
                  <span>Access Student Dashboard</span>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
