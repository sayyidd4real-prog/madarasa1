"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  BookOpen, 
  TrendingUp, 
  Power,
  ChevronRight,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  HelpCircle,
  ExternalLink
} from "lucide-react";
import { usePortal } from "@/context/PortalContext";
import { translations } from "@/context/translations";
import { MadrasaLogoIcon } from "@/components/MadrasaLogo";

export default function LandingPage() {
  const { language, setLanguage, theme, toggleTheme } = usePortal();
  
  const t = (key: keyof typeof translations["en"]) => {
    const dict = translations[language] || translations["en"];
    return dict[key] || translations["en"][key] || key;
  };

  // Physics simulator state
  const [shieldPower, setShieldPower] = useState<number>(30);
  const [isEngineOn, setIsEngineOn] = useState<boolean>(false);

  const isFloating = isEngineOn && shieldPower > 80;
  const simulatorStatus = !isEngineOn 
    ? t("sim_offline") 
    : (shieldPower > 80 ? t("sim_success") : `${t("sim_calibrating")} (${shieldPower}%)`);

  // FAQ accordion active key state (null if closed)
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-x-hidden flex flex-col font-sans transition-colors duration-300">
      
      {/* Decorative ambient glowing grids */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[65%] bg-blue-500/10 dark:bg-blue-500/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] left-[-5%] w-[40%] h-[40%] bg-indigo-500/5 blur-[130px] rounded-full pointer-events-none" />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 dark:opacity-60 pointer-events-none" />

      {/* Header / Navbar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-900">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-500 dark:text-emerald-400 shadow-md dark:shadow-[0_0_15px_rgba(16, 185, 129,0.15)]">
            <MadrasaLogoIcon className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-lg md:text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
              {t("academy_name")}
            </span>
            <span className="text-[10px] md:text-xs block text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
              {language === "ar" ? t("arabic_subtitle") : t("portal_subtitle")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Selector Dropdown */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as "en" | "ar" | "so")}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 text-slate-700 dark:text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer font-semibold transition-all shadow-sm"
          >
            <option value="en">English</option>
            <option value="ar">العربية (Arabic)</option>
            <option value="so">Somali</option>
          </select>

          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 rounded-lg text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all shadow-sm"
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

          <Link
            href="/login"
            className="relative group overflow-hidden px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 transition-all duration-300 shadow-sm hover:shadow-[0_0_20px_rgba(16, 185, 129,0.1)] flex items-center gap-1.5"
          >
            <span className="relative z-10">{t("enter_system")}</span>
            <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </header>

      {/* Hero & Simulator Section */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Copy & Features */}
        <div className="lg:col-span-7 flex flex-col items-start gap-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900/80 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 shadow-sm">
            <Shield className="w-3.5 h-3.5" />
            <span>{t("secure_vault")}</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-slate-900 dark:text-slate-100">
            {t("hero_title")} <br />
            <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 dark:from-emerald-400 dark:via-emerald-300 dark:to-teal-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(16, 185, 129,0.1)]">
              {t("hero_highlight")}
            </span>
          </h1>

          <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg max-w-xl leading-relaxed">
            {t("hero_description")}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mt-2">
            <Link
              href="/login"
              className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(16, 185, 129,0.4)] text-sm flex items-center gap-2"
            >
              {t("enter_system")}
              <ChevronRight className="w-4 h-4 text-slate-950 stroke-[3px]" />
            </Link>
            <a
              href="#physics-simulator"
              className="px-6 py-3.5 bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-all text-sm flex items-center gap-2 shadow-sm"
            >
              {t("test_physics")}
            </a>
          </div>

          {/* Grid Mini-Features */}
          <div className="grid grid-cols-2 gap-6 mt-8 w-full border-t border-slate-200 dark:border-slate-900 pt-8">
            <div className="flex gap-3">
              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg text-emerald-600 dark:text-emerald-400 h-10 w-10 flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-sm">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{t("role_vault_title")}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{t("role_vault_desc")}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg text-emerald-600 dark:text-emerald-400 h-10 w-10 flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-sm">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{t("auto_ledger_title")}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{t("auto_ledger_desc")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Physics Simulator Widget */}
        <div id="physics-simulator" className="lg:col-span-5 w-full">
          <div className="relative p-6 md:p-8 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl dark:shadow-2xl backdrop-blur-md overflow-hidden flex flex-col gap-6">
            
            {/* Corner Cyan Accent Lines */}
            <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-emerald-500/30 rounded-tr-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-emerald-500/30 rounded-bl-2xl pointer-events-none" />
            
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <MadrasaLogoIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  {t("sim_title")}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t("sim_subtitle")}</p>
              </div>
              <div className="px-2 py-0.5 bg-emerald-100/60 dark:bg-emerald-950/40 border border-emerald-500/20 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase rounded tracking-wider shadow-sm">
                {t("sim_active")}
              </div>
            </div>

            {/* Physics Display Chamber */}
            <div className="relative h-64 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col items-center justify-center">
              
              {/* Scientific grid mesh background inside chamber */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#083344_1px,transparent_1px),linear-gradient(to_bottom,#083344_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-20 dark:opacity-25" />
              
              {/* Floor and ceiling electrodes */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-slate-200 dark:bg-slate-800 border-b border-emerald-500/20" />
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-slate-200 dark:bg-slate-800 border-t border-emerald-500/20" />

              {/* Laser containment markers */}
              <div className="absolute left-6 top-4 bottom-4 w-px border-l border-dashed border-emerald-500/20" />
              <div className="absolute right-6 top-4 bottom-4 w-px border-l border-dashed border-emerald-500/20" />

              {/* Status Badge Overlaid on Chamber */}
              <div className="absolute top-4 right-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded text-[10px] font-mono text-emerald-600 dark:text-emerald-400 shadow-md">
                Suspension Unit E-8
              </div>

              {/* Simulated Globe / Sphere */}
              <motion.div
                className="relative z-10 w-20 h-20 flex items-center justify-center pointer-events-none"
                animate={
                  isFloating
                    ? {
                        y: [-40, -50, -35, -40],
                        rotate: 360,
                        scale: 1.05,
                        boxShadow: "0 0 35px rgba(16, 185, 129,0.6)",
                      }
                    : {
                        y: [40, 37, 40],
                        rotate: 0,
                        scale: 1.0,
                        boxShadow: "0 0 0px rgba(16, 185, 129,0)",
                      }
                }
                transition={
                  isFloating
                    ? {
                        y: { repeat: Infinity, duration: 4, ease: "easeInOut" },
                        rotate: { repeat: Infinity, duration: 25, ease: "linear" },
                        scale: { duration: 0.8 },
                        boxShadow: { duration: 0.5 },
                      }
                    : {
                        y: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                        scale: { duration: 0.5 },
                      }
                }
              >
                {/* Visual sphere style */}
                <div className={`w-16 h-16 rounded-full border-2 transition-all duration-700 flex items-center justify-center relative overflow-hidden ${
                  isFloating 
                    ? "bg-white dark:bg-slate-900 border-emerald-500 dark:border-emerald-400" 
                    : "bg-slate-200 dark:bg-slate-850 border-slate-350 dark:border-slate-700 opacity-80"
                }`}>
                  
                  {/* Energy core inside sphere */}
                  <div className={`w-8 h-8 rounded-full blur-sm transition-all duration-700 ${
                    isEngineOn
                      ? shieldPower > 80
                        ? "bg-emerald-500 dark:bg-emerald-400 animate-ping"
                        : "bg-emerald-500/40"
                      : "bg-slate-400/30 dark:bg-slate-600/30"
                  }`} />
                  
                  <MadrasaLogoIcon className={`absolute w-7 h-7 transition-colors duration-700 ${
                    isFloating ? "text-emerald-500 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"
                  }`} />

                  {/* Shading/glass effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20" />
                </div>

                {/* Floating energy base rings */}
                <AnimatePresence>
                  {isFloating && (
                    <motion.div
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1.4, opacity: [0, 0.8, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
                      className="absolute bottom-[-15px] left-[10%] right-[10%] h-1 bg-emerald-500/30 dark:bg-emerald-400/30 blur-[2px] rounded-full border border-emerald-500/50 dark:border-emerald-400/50"
                    />
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Status display at the bottom of the chamber */}
              <div className="absolute bottom-4 left-4 right-4 z-25 text-center">
                <span className={`inline-block text-[11px] font-mono font-medium px-2.5 py-1 rounded bg-white dark:bg-slate-900 border transition-colors shadow-sm ${
                  isFloating 
                    ? "border-emerald-500/30 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400" 
                    : isEngineOn 
                      ? "border-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                      : "border-slate-200 dark:border-slate-800 text-slate-500"
                }`}>
                  {simulatorStatus}
                </span>
              </div>
            </div>

            {/* Interactive Control Knobs */}
            <div className="flex flex-col gap-5 bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-850/80 shadow-inner">
              
              {/* Toggle Row */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("sim_engine_toggle")}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-500 font-mono">Status: {isEngineOn ? "ONLINE" : "OFFLINE"}</span>
                </div>
                
                {/* Switch Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsEngineOn(!isEngineOn)}
                  className={`w-12 h-6.5 rounded-full p-1 transition-all duration-300 focus:outline-none flex items-center ${
                    isEngineOn ? "bg-emerald-500 shadow-[0_0_15px_rgba(16, 185, 129,0.3)]" : "bg-slate-300 dark:bg-slate-800"
                  }`}
                >
                  <div
                    className={`w-4.5 h-4.5 rounded-full bg-white dark:bg-slate-950 transition-transform duration-300 flex items-center justify-center shadow-md ${
                      isEngineOn ? "translate-x-5.5" : "translate-x-0"
                    }`}
                  >
                    <Power className={`w-2.5 h-2.5 ${isEngineOn ? "text-emerald-500 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}`} />
                  </div>
                </button>
              </div>

              {/* Slider Row */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("sim_shield_power")}</span>
                  <span className={`text-xs font-mono font-bold ${
                    isEngineOn 
                      ? "text-emerald-600 dark:text-emerald-400" 
                      : "text-slate-400 dark:text-slate-600"
                  }`}>
                    {shieldPower}%
                  </span>
                </div>

                <div className="relative flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={shieldPower}
                    onChange={(e) => setShieldPower(Number(e.target.value))}
                    disabled={!isEngineOn}
                    className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer focus:outline-none transition-colors ${
                      isEngineOn 
                        ? "bg-slate-200 dark:bg-slate-800 accent-emerald-500 [&::-webkit-slider-thumb]:bg-emerald-500" 
                        : "bg-slate-300 dark:bg-slate-900 cursor-not-allowed [&::-webkit-slider-thumb]:bg-slate-500"
                    }`}
                  />
                </div>
                
                <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span className={isEngineOn && shieldPower > 80 ? "text-emerald-600 dark:text-emerald-400 font-bold animate-pulse" : ""}>{t("sim_threshold")} (80%)</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section: Mission & Focus with Education Illustration */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-16 md:py-24 border-t border-slate-200 dark:border-slate-900">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left side: Information blocks */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6 text-left">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400">
                {t("about_us_subtitle")}
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">
                {t("about_us_title")}
              </h2>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed">
              {t("about_us_desc")}
            </p>

            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-4 border-b border-slate-200 dark:border-slate-800 pb-2 w-full">
              {t("academic_focus")}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-2">
              <div className="p-5 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm">
                <h4 className="font-bold text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {t("quran_studies")}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {t("quran_desc")}
                </p>
              </div>

              <div className="p-5 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm">
                <h4 className="font-bold text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {t("modern_science")}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {t("science_desc")}
                </p>
              </div>
            </div>
          </div>

          {/* Right side: Academic illustration image */}
          <div className="lg:col-span-5 w-full flex justify-center">
            <div className="relative group p-2 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-850 rounded-3xl shadow-xl overflow-hidden transition-all duration-500 hover:border-emerald-500/30">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <img 
                src="/academic_classes.png" 
                alt="Madarasah Badru-diin Curriculum Representation"
                className="w-full h-auto rounded-2xl max-w-sm object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>
          </div>

        </div>
      </section>

      {/* Premium Facilities Gallery Section */}
      <section className="relative z-10 w-full bg-white/40 dark:bg-slate-900/20 py-16 md:py-24 border-t border-slate-200 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left side: Lab illustration image */}
          <div className="lg:col-span-5 w-full flex justify-center order-last lg:order-first">
            <div className="relative group p-2 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-850 rounded-3xl shadow-xl overflow-hidden transition-all duration-500 hover:border-emerald-500/30">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <img 
                src="/students_science_lab.png" 
                alt="Students Science Laboratory"
                className="w-full h-auto rounded-2xl max-w-sm object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>
          </div>

          {/* Right side: Facilities list */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6 text-left">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400">
                Institutional Infrastructure
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">
                {t("facilities_title")}
              </h2>
            </div>

            <div className="flex flex-col gap-4 w-full mt-2">
              <div className="flex gap-4 p-5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-850 rounded-2xl hover:border-emerald-500/20 transition-all shadow-sm">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0 h-11 w-11 flex items-center justify-center">
                  <MadrasaLogoIcon className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t("facility_1")}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t("facility_1_desc")}</p>
                </div>
              </div>

              <div className="flex gap-4 p-5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-850 rounded-2xl hover:border-emerald-500/20 transition-all shadow-sm">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0 h-11 w-11 flex items-center justify-center">
                  <BookOpen className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t("facility_2")}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t("facility_2_desc")}</p>
                </div>
              </div>

              <div className="flex gap-4 p-5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-850 rounded-2xl hover:border-emerald-500/20 transition-all shadow-sm">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0 h-11 w-11 flex items-center justify-center">
                  <TrendingUp className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t("facility_3")}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t("facility_3_desc")}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Admissions Call to Action with Campus Entrance Image */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-16">
        <div className="relative overflow-hidden bg-gradient-to-br from-white to-slate-100 dark:from-slate-900/80 dark:to-slate-950/80 border border-slate-200 dark:border-slate-800 p-8 md:p-12 rounded-3xl shadow-xl flex flex-col lg:flex-row items-center gap-8 md:gap-12">
          
          {/* Accent glow corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] pointer-events-none" />

          {/* Left: Text & Action */}
          <div className="flex-1 flex flex-col items-start gap-5 text-left">
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400">
              Get Started
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
              {t("admission_process")}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm leading-relaxed max-w-lg">
              {t("admission_desc")}
            </p>
            <Link
              href="/login"
              className="mt-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-md hover:shadow-[0_0_20px_rgba(16, 185, 129,0.3)] text-xs md:text-sm flex items-center gap-1.5"
            >
              <span>{t("enter_system")}</span>
              <ChevronRight className="w-4 h-4 text-slate-950 stroke-[3px]" />
            </Link>
          </div>

          {/* Right: Campus background illustration image */}
          <div className="w-full lg:w-96 flex justify-center shrink-0">
            <img 
              src="/academy_hero_bg.png" 
              alt="Madarasah Badru-diin School Campus Entrance"
              className="w-full max-w-xs md:max-w-sm h-48 object-cover rounded-2xl shadow-md border border-slate-200 dark:border-slate-800"
            />
          </div>

        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section className="relative z-10 w-full max-w-4xl mx-auto px-6 py-16 md:py-24 border-t border-slate-200 dark:border-slate-900">
        <div className="flex flex-col items-center text-center gap-4 mb-10">
          <HelpCircle className="w-8 h-8 text-cyan-555 dark:text-emerald-400" />
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100">
            {t("faq_title")}
          </h2>
          <div className="w-12 h-1 bg-cyan-555 dark:bg-emerald-500 rounded-full" />
        </div>

        <div className="flex flex-col gap-4">
          {/* FAQ 1 */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700">
            <button
              type="button"
              onClick={() => toggleFaq(1)}
              className="w-full py-5 px-6 flex items-center justify-between text-left font-bold text-slate-850 dark:text-slate-200 text-sm md:text-base focus:outline-none"
            >
              <span>{t("faq_q1")}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-350 ${activeFaq === 1 ? "rotate-180 text-emerald-500" : ""}`} />
            </button>
            <AnimatePresence initial={false}>
              {activeFaq === 1 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="px-6 pb-5 text-xs md:text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-850/80 pt-3 leading-relaxed">
                    {t("faq_a1")}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* FAQ 2 */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700">
            <button
              type="button"
              onClick={() => toggleFaq(2)}
              className="w-full py-5 px-6 flex items-center justify-between text-left font-bold text-slate-850 dark:text-slate-200 text-sm md:text-base focus:outline-none"
            >
              <span>{t("faq_q2")}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-350 ${activeFaq === 2 ? "rotate-180 text-emerald-500" : ""}`} />
            </button>
            <AnimatePresence initial={false}>
              {activeFaq === 2 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="px-6 pb-5 text-xs md:text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-850/80 pt-3 leading-relaxed">
                    {t("faq_a2")}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* FAQ 3 */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700">
            <button
              type="button"
              onClick={() => toggleFaq(3)}
              className="w-full py-5 px-6 flex items-center justify-between text-left font-bold text-slate-850 dark:text-slate-200 text-sm md:text-base focus:outline-none"
            >
              <span>{t("faq_q3")}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-350 ${activeFaq === 3 ? "rotate-180 text-emerald-500" : ""}`} />
            </button>
            <AnimatePresence initial={false}>
              {activeFaq === 3 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="px-6 pb-5 text-xs md:text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-850/80 pt-3 leading-relaxed">
                    {t("faq_a3")}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Multi-Column Premium Footer */}
      <footer className="relative z-10 w-full bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Column 1: Brand details */}
          <div className="lg:col-span-4 flex flex-col items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-900 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <MadrasaLogoIcon className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-base text-slate-800 dark:text-slate-100 tracking-tight">
                {t("academy_name")}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-left max-w-sm">
              Madarasah Badru-diin (مدرسة بدر الدين) is a premier educational portal bridging traditional moral values and modern intellectual disciplines. We prepare the next generation for technical, scientific, and spiritual leadership.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-3 flex flex-col items-start gap-4 text-left">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 dark:text-slate-500">
              Portal Directory
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/login" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  {t("enter_system")}
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  {t("student_login")}
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  {t("admin_login")}
                </Link>
              </li>
              <li>
                <a href="#physics-simulator" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  {t("test_physics")}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Focus & Curriculums */}
          <div className="lg:col-span-2 flex flex-col items-start gap-4 text-left">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 dark:text-slate-500">
              Curriculums
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs text-slate-550 dark:text-slate-400">
              <li>{t("quran_studies")}</li>
              <li>{t("modern_science")}</li>
              <li>{t("facility_1")}</li>
              <li>{t("facility_2")}</li>
            </ul>
          </div>

          {/* Column 4: Contact & Locations */}
          <div className="lg:col-span-3 flex flex-col items-start gap-4 text-left">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 dark:text-slate-500">
              Location & Contact
            </h4>
            <ul className="flex flex-col gap-3 text-xs text-slate-550 dark:text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Somalia</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-mono">+252-61 7765862</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-mono">registry@badru-diin.edu</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto px-6 py-6 border-t border-slate-200 dark:border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} {t("academy_name")} ({t("arabic_subtitle")}). All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-700 dark:hover:text-slate-350 cursor-pointer">Privacy Charter</span>
            <span>&bull;</span>
            <span className="hover:text-slate-700 dark:hover:text-slate-350 cursor-pointer">Admissions Office</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
