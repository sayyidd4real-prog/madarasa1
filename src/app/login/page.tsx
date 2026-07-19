"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, User, GraduationCap, Loader2, ArrowLeft } from "lucide-react";

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

  // Active tab state: "student" | "admin"
  const [activeTab, setActiveTab] = useState<"student" | "admin">("student");

  // Admin Inputs
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // Student Inputs
  const [studentIdOrName, setStudentIdOrName] = useState("");

  // Loading and feedback
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUsername.trim() || !adminPassword.trim()) {
      showToast("Please fill in all admin credentials", "error");
      return;
    }

    setIsLoading(true);

    try {
      const result = await login("admin", adminUsername, adminPassword);
      setIsLoading(false);

      if (result.success) {
        showToast("Welcome back, Administrator!", "success");
        router.push("/admin");
      } else {
        showToast(result.error || "Invalid Admin username or password", "error");
      }
    } catch {
      setIsLoading(false);
      showToast("Database connection error", "error");
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentIdOrName.trim()) {
      showToast("Please enter your Student ID or Full Name", "error");
      return;
    }

    setIsLoading(true);

    try {
      const result = await login("student", studentIdOrName);
      setIsLoading(false);

      if (result.success) {
        showToast("Authenticated successfully. Welcome to your Dashboard!", "success");
        router.push("/student");
      } else {
        showToast(result.error || "No student record matching that input", "error");
      }
    } catch {
      setIsLoading(false);
      showToast("Database connection error", "error");
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-6 overflow-hidden transition-colors duration-300">

      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Top Header bar with selector controls */}
      <div className="absolute top-8 left-8 right-8 flex items-center justify-between pointer-events-auto">
        <Link
          href="/"
          className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-450 flex items-center gap-2 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {t("back_to_home")}
        </Link>

        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as "en" | "ar" | "so")}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 text-slate-700 dark:text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer font-semibold transition-all shadow-sm"
          >
            <option value="en">English</option>
            <option value="ar">العربية (Arabic)</option>
            <option value="so">Somali</option>
          </select>

          {/* Theme switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 rounded-lg text-slate-500 dark:text-slate-400 hover:text-emerald-550 dark:hover:text-emerald-450 transition-all shadow-sm"
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
        className="w-full max-w-md bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 backdrop-blur-md shadow-2xl relative mt-12 transition-all"
      >
        {/* Border accent glows */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/55 to-transparent" />

        {/* Brand header */}
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <div className="p-3 bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-450">
            <MadrasaLogoIcon className="w-9 h-9" colorClass="text-emerald-500 dark:text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 mt-2">
            {t("login_title")}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t("select_role")}</p>
        </div>

        {/* Custom Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-850 mb-8 relative">
          <button
            type="button"
            onClick={() => {
              if (!isLoading) setActiveTab("student");
            }}
            disabled={isLoading}
            className={`py-2.5 text-xs md:text-sm font-bold rounded-lg transition-all relative z-10 flex items-center justify-center gap-2 ${activeTab === "student" ? "text-emerald-600 dark:text-emerald-400 font-extrabold" : "text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200"
              }`}
          >
            <GraduationCap className="w-4 h-4" />
            {t("student_login")}
            {activeTab === "student" && (
              <motion.div
                layoutId="active-tab-glow"
                className="absolute inset-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-emerald-500/20 rounded-lg -z-10 shadow-sm"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              if (!isLoading) setActiveTab("admin");
            }}
            disabled={isLoading}
            className={`py-2.5 text-xs md:text-sm font-bold rounded-lg transition-all relative z-10 flex items-center justify-center gap-2 ${activeTab === "admin" ? "text-emerald-600 dark:text-emerald-400 font-extrabold" : "text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200"
              }`}
          >
            <Lock className="w-3.5 h-3.5" />
            {t("admin_login")}
            {activeTab === "admin" && (
              <motion.div
                layoutId="active-tab-glow"
                className="absolute inset-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-emerald-500/20 rounded-lg -z-10 shadow-sm"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        </div>

        {/* Forms Container */}
        <AnimatePresence mode="wait">
          {activeTab === "student" ? (
            <motion.form
              key="student-form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleStudentSubmit}
              className="flex flex-col gap-5"
            >
              <div className="flex flex-col gap-2 text-left">
                <label htmlFor="student-id" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {t("student_id")} / {t("name")}
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    id="student-id"
                    type="text"
                    placeholder="e.g. Alice Johnson or STU-1001"
                    value={studentIdOrName}
                    onChange={(e) => setStudentIdOrName(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500/50 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-650 focus:outline-none transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-550">
                  Tip: Use <code className="bg-slate-100 dark:bg-slate-950 px-1 py-0.5 rounded text-emerald-600 dark:text-emerald-450 font-bold font-mono">STU-1001</code> to view Alice Johnson&apos;s records.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl transition-all duration-300 shadow-md hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>{t("verifying")}</span>
                  </>
                ) : (
                  <span>{t("access_dashboard")}</span>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="admin-form"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleAdminSubmit}
              className="flex flex-col gap-5"
            >
              <div className="flex flex-col gap-2 text-left">
                <label htmlFor="admin-username" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {t("username")}
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    id="admin-username"
                    type="text"
                    placeholder="admin"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500/50 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-650 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 text-left">
                <div className="flex justify-between items-center">
                  <label htmlFor="admin-password" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    {t("password")}
                  </label>
                </div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    id="admin-password"
                    type="password"
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500/50 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-650 focus:outline-none transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-500">
                  Default credentials are <code className="bg-slate-100 dark:bg-slate-950 px-1 py-0.5 rounded text-emerald-600 dark:text-emerald-450 font-bold font-mono">admin</code> / <code className="bg-slate-100 dark:bg-slate-950 px-1 py-0.5 rounded text-emerald-600 dark:text-emerald-450 font-bold font-mono">admin123</code>.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl transition-all duration-300 shadow-md hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>{t("signing_in")}</span>
                  </>
                ) : (
                  <span>{t("access_dashboard")}</span>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
