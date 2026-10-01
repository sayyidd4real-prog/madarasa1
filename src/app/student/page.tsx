"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  DollarSign,
  Award,
  LogOut,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  User,
  TrendingUp,
  BookOpen,
  ArrowLeft
} from "lucide-react";
import { usePortal, Exam } from "@/context/PortalContext";
import { useToast } from "@/context/ToastContext";
import { translations } from "@/context/translations";
import { MadrasaLoader } from "@/components/MadrasaLogo";
import { formatCurrency, formatDisplayNumber, stripLeadingZeros } from "@/lib/formatters";

type StudentTab = "results" | "fees";

const calculateGrade = (average: number) => {
  if (average >= 90) return "A+ (Excellent)";
  if (average >= 80) return "A (Very Good)";
  if (average >= 70) return "B (Good)";
  if (average >= 60) return "C (Average)";
  return "F (Fail)";
};

const getGradeBadge = (grade: string) => {
  switch (grade) {
    case "A+ (Excellent)":
      return "bg-emerald-950/40 border border-emerald-500/20 text-emerald-400";
    case "A (Very Good)":
      return "bg-emerald-950/40 border border-emerald-500/20 text-emerald-400";
    case "B (Good)":
      return "bg-yellow-950/40 border border-yellow-500/20 text-yellow-400";
    case "C (Average)":
      return "bg-blue-950/40 border border-blue-500/20 text-blue-400";
    case "F (Fail)":
      return "bg-rose-950/40 border border-rose-500/20 text-rose-400";
    default:
      return "bg-slate-950 border border-slate-800 text-slate-500";
  }
};

export default function StudentDashboard() {
  const router = useRouter();
  const { showToast } = useToast();
  const {
    students,
    fees,
    exams,
    subjects,
    currentUser,
    isInitialized,
    logout,
    language,
    setLanguage,
    theme,
    toggleTheme
  } = usePortal();

  const t = (key: keyof typeof translations["en"]) => {
    const dict = translations[language] || translations["en"];
    return dict[key] || translations["en"][key] || key;
  };

  // Selected tab state
  const [activeTab, setActiveTab] = useState<StudentTab>("results");
  const [selectedClassKey, setSelectedClassKey] = useState<string | null>(null);

  // Redirect if unauthorized once state has loaded
  useEffect(() => {
    if (isInitialized && (!currentUser || currentUser.role !== "student")) {
      if (currentUser?.role === "admin" || currentUser?.role === "super_admin") {
        router.push("/admin");
      } else {
        router.push("/login");
      }
    }
  }, [currentUser, isInitialized, router]);

  // If loading or unauthorized, show loading state
  if (!isInitialized || !currentUser || currentUser.role !== "student") {
    return <MadrasaLoader message="Retrieving student records..." />;
  }

  // Get active student profile info
  const studentProfile = students.find((s) => s.id === currentUser.studentId);
  const studentId = currentUser.studentId;

  // Filter records specific to this student
  const studentExams = exams.filter((e) => e.studentId === studentId);
  const studentFees = fees.filter((f) => f.studentId === studentId);

  // Fee ledger summaries
  const totalAssignedFees = studentFees.reduce((sum, f) => sum + (parseFloat(String(f.amount)) || 0), 0);
  const totalPaid = studentFees.reduce((sum, f) => sum + (parseFloat(String(f.paid)) || 0), 0);
  const totalDeductions = studentFees.reduce((sum, f) => sum + (parseFloat(String(f.deductions)) || 0), 0);
  const remainingBalance = Math.max(0, totalAssignedFees - totalPaid - totalDeductions);

  const handleLogout = async () => {
    await logout("student");
    showToast("Logged out from student session", "success");
    router.push("/login");
  };

  // Group student exams by Class and Academic Year
  interface StudentClassGroup {
    key: string;
    className: string;
    academicYear: string;
    exams: Exam[];
  }

  const classGroupsMap = new Map<string, StudentClassGroup>();
  studentExams.forEach((exam) => {
    const cls = exam.className || studentProfile?.gradeGroup || "Class";
    const yr = exam.academicYear || studentProfile?.academicYear || "2025–2026";
    const key = `${cls}___${yr}`;
    if (!classGroupsMap.has(key)) {
      classGroupsMap.set(key, { key, className: cls, academicYear: yr, exams: [] });
    }
    classGroupsMap.get(key)!.exams.push(exam);
  });

  const classGroups = Array.from(classGroupsMap.values());
  const activeClassGroup = selectedClassKey ? classGroups.find((g) => g.key === selectedClassKey) : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* Decorative glows */}
      <div className="absolute top-0 right-0 w-[40%] h-[30%] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[30%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-6xl w-full mx-auto px-4 py-8 flex flex-col gap-8 relative z-10 flex-1">
        
        {/* Dashboard Top Header Bar */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <h1 className="text-base font-bold text-slate-800 dark:text-slate-100">{studentProfile?.name || currentUser.name}</h1>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {t("student_id")}: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{stripLeadingZeros(studentId)}</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {t("class_name")}: <span className="text-slate-800 dark:text-slate-200 font-semibold">{studentProfile?.gradeGroup || "Unassigned"}</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {t("academic_year")}: <span className="text-slate-800 dark:text-slate-200 font-semibold">{studentProfile?.academicYear || "Unassigned"}</span>
              </span>
              {studentProfile?.email && (
                <>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {t("email")}: <span className="text-slate-800 dark:text-slate-200">{studentProfile.email}</span>
                  </span>
                </>
              )}
              {studentProfile?.phoneNumber && (
                <>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {t("phone_number")}: <span className="text-slate-800 dark:text-slate-200 font-mono">{studentProfile.phoneNumber}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 flex-wrap">
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

            {/* Logout button */}
            <button
              type="button"
              onClick={handleLogout}
              className="py-2 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-450 border border-slate-200 dark:border-slate-700 hover:border-rose-500/25 dark:hover:border-rose-500/25 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t("logout")}</span>
            </button>
          </div>
        </header>

        {/* Branding Subtitle Display */}
        <div className="flex flex-col gap-1 items-start pl-2">
          <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400">
            {t("student_portal")}
          </span>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100">
            {t("academy_name")}
            {language !== "ar" && <span className="text-xs font-normal text-slate-500 block">{t("arabic_subtitle")}</span>}
          </h2>
        </div>

        {/* Tab selection navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-850 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab("results")}
            className={`pb-4 px-2 text-sm font-bold relative transition-colors ${
              activeTab === "results" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <span className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              {t("academic_transcript")}
            </span>
            {activeTab === "results" && (
              <motion.div
                layoutId="student-tab-underline"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-500 dark:bg-emerald-400"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("fees")}
            className={`pb-4 px-2 text-sm font-bold relative transition-colors ${
              activeTab === "fees" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <span className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              {t("financial_ledger")}
            </span>
            {activeTab === "fees" && (
              <motion.div
                layoutId="student-tab-underline"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-500 dark:bg-emerald-400"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
          </button>
        </div>

        {/* Tab Views */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            
            {/* 1. EXAM RESULTS VIEW */}
            {activeTab === "results" && (
              <motion.div
                key="results-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-8"
              >
                {!selectedClassKey || !activeClassGroup ? (
                  /* --- CARD SELECTION VIEW --- */
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-1 border-b border-slate-200 dark:border-slate-800 pb-3">
                      <h3 className="text-base md:text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                        <Award className="w-5 h-5 text-emerald-500" />
                        {t("academic_transcript")}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {t("select_exam_card")}
                      </p>
                    </div>

                    {/* Class Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {classGroups.map((group) => {
                        return (
                          <div
                            key={group.key}
                            onClick={() => setSelectedClassKey(group.key)}
                            className="group relative bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-5 overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />
                            
                            <div className="flex flex-col gap-3">
                              <div className="flex items-center justify-between">
                                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                  <GraduationCap className="w-5 h-5" />
                                </div>
                                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700">
                                  {group.academicYear}
                                </span>
                              </div>

                              <div>
                                <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                  [ {group.className} Exams ]
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono font-bold mt-1">
                                  {formatDisplayNumber(group.exams.length)} {t("exams_available")}
                                </p>
                              </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              <span>{t("view_exam_results")}</span>
                              <span className="transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">→</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {classGroups.length === 0 && (
                      <div className="bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-900 rounded-2xl py-12 text-center text-slate-500 shadow-sm">
                        <FileText className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-sm">No exam scores or transcripts found for your student profile.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* --- DETAILED EXAM VIEW FOR SELECTED CLASS --- */
                  <div className="flex flex-col gap-8">
                    {/* Header & Back Button */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedClassKey(null)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer shadow-sm"
                        >
                          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                          <span>{t("back_to_exams")}</span>
                        </button>
                        <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg font-mono">
                          {activeClassGroup.academicYear}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                        <div>
                          <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                            {activeClassGroup.className.toUpperCase()} EXAMS
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                            Detailed evaluations for {activeClassGroup.className} ({activeClassGroup.academicYear})
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Stats row for selected class */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
                        <div className="p-3 bg-slate-100 dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 rounded-xl">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="block text-2xl font-bold font-mono text-slate-800 dark:text-slate-100">
                            {formatDisplayNumber(activeClassGroup.exams.length)}
                          </span>
                          <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t("completed_exams")}</span>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
                        <div className="p-3 bg-slate-100 dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 rounded-xl">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="block text-2xl font-bold font-mono text-slate-800 dark:text-slate-100">
                            {activeClassGroup.exams.length > 0
                              ? Math.round(activeClassGroup.exams.reduce((sum, e) => sum + e.score, 0) / activeClassGroup.exams.length)
                              : 0}
                            %
                          </span>
                          <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t("avg_score")}</span>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
                        <div className="p-3 bg-slate-100 dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 rounded-xl">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="block text-lg font-bold text-slate-800 dark:text-slate-100">
                            {activeClassGroup.exams.length > 0
                              ? Math.round(activeClassGroup.exams.reduce((sum, e) => sum + e.score, 0) / activeClassGroup.exams.length) >= 60
                                ? "Satisfactory Good"
                                : "Academic Warning"
                              : "No records"}
                          </span>
                          <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t("academic_standing")}</span>
                        </div>
                      </div>
                    </div>

                    {/* Separated Evaluation Systems */}
                    <div className="flex flex-col gap-6">
                      
                      {/* 1. CONTINUOUS ASSESSMENT SYSTEM */}
                      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 flex flex-col gap-4 shadow-sm backdrop-blur-md">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/70 pb-3">
                          <div className="flex items-center gap-2">
                            <Award className="w-4.5 h-4.5 text-emerald-500" />
                            <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100">
                              {t("continuous_assessment")}
                            </h4>
                          </div>
                          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                            {t("max_points")}: 100
                          </span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full ltr:text-left rtl:text-right text-xs min-w-max">
                            <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                              <tr>
                                <th className="py-3 px-4">{t("subject")}</th>
                                <th className="py-3 px-4 text-center">{t("term_1")}</th>
                                <th className="py-3 px-4 text-center">{t("mid_term")}</th>
                                <th className="py-3 px-4 text-center text-emerald-600 dark:text-emerald-400">
                                  {t("continuous_assessment")} Total (/100)
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                              {subjects.map((sub) => {
                                const term1Exam = activeClassGroup.exams.find(
                                  (e) => e.subject === sub.subjectName && e.term === "Term 1"
                                );
                                const midTermExam = activeClassGroup.exams.find(
                                  (e) => e.subject === sub.subjectName && e.term === "Mid-term"
                                );
                                const term1Score = term1Exam ? term1Exam.score : null;
                                const midTermScore = midTermExam ? midTermExam.score : null;
                                const caTotal = (term1Score !== null || midTermScore !== null)
                                  ? ((term1Score || 0) + (midTermScore || 0))
                                  : null;

                                return (
                                  <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">{sub.subjectName}</td>
                                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                                      {term1Score !== null ? term1Score : "—"}
                                    </td>
                                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                                      {midTermScore !== null ? midTermScore : "—"}
                                    </td>
                                    <td className="py-3.5 px-4 text-center font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                                      {caTotal !== null ? `${caTotal} / 100` : "—"}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* 2. FINAL EXAM SYSTEM */}
                      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 flex flex-col gap-4 shadow-sm backdrop-blur-md">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/70 pb-3">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4.5 h-4.5 text-cyan-500" />
                            <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100">
                              {t("final_exam")}
                            </h4>
                          </div>
                          <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                            {t("max_points")}: 100
                          </span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full ltr:text-left rtl:text-right text-xs min-w-max">
                            <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                              <tr>
                                <th className="py-3 px-4">{t("subject")}</th>
                                <th className="py-3 px-4 text-center text-cyan-600 dark:text-cyan-400">{t("final_exam")} Score (/100)</th>
                                <th className="py-3 px-4 text-center">{t("grade")}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                              {subjects.map((sub) => {
                                const finalExamObj = activeClassGroup.exams.find(
                                  (e) => e.subject === sub.subjectName && e.term === "Final Exam"
                                );
                                const finalScore = finalExamObj ? finalExamObj.score : null;
                                const grade = finalScore !== null ? calculateGrade(finalScore) : "—";

                                return (
                                  <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">{sub.subjectName}</td>
                                    <td className="py-3.5 px-4 text-center font-mono font-black text-cyan-600 dark:text-cyan-400 text-sm">
                                      {finalScore !== null ? `${finalScore} / 100` : "—"}
                                    </td>
                                    <td className="py-3.5 px-4 text-center">
                                      {finalScore !== null ? (
                                        <span className={`inline-flex px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide rounded border ${getGradeBadge(grade)}`}>
                                          {grade}
                                        </span>
                                      ) : (
                                        <span className="text-slate-400 dark:text-slate-700">—</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* 3. TEACHER FEEDBACK IF AVAILABLE */}
                      {activeClassGroup.exams.some((e) => e.feedback && e.feedback.trim() !== "") && (
                        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
                          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                            <FileText className="w-4.5 h-4.5 text-amber-500" />
                            <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100">
                              {t("teacher_feedback")}
                            </h4>
                          </div>
                          <div className="flex flex-col gap-2">
                            {activeClassGroup.exams
                              .filter((e) => e.feedback && e.feedback.trim() !== "")
                              .map((e) => (
                                <div
                                  key={e.id}
                                  className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800 rounded-xl text-xs flex flex-col gap-1.5"
                                >
                                  <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300">
                                    <span className="flex items-center gap-2">
                                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{e.subject}</span>
                                      <span className="text-slate-400 dark:text-slate-600">({e.term})</span>
                                    </span>
                                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{e.score} / 100</span>
                                  </div>
                                  <p className="text-slate-600 dark:text-slate-300 italic">"{e.feedback}"</p>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* 2. FEE LEDGER VIEW */}
            {activeTab === "fees" && (
              <motion.div
                key="fees-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
              >
                
                {/* Statement column */}
                <div className="lg:col-span-8 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800/80">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">Statement of Accounts</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Showing logs of assigned costs, applied credits, and payments.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full ltr:text-left rtl:text-right text-sm">
                      <thead className="bg-slate-100 dark:bg-slate-950 text-slate-550 dark:text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="py-4 px-6">{t("fee_item")}</th>
                          <th className="py-4 px-6 font-mono text-center">{t("total_amount")}</th>
                          <th className="py-4 px-6 font-mono text-center">{t("credits_applied")}</th>
                          <th className="py-4 px-6 font-mono text-center">{t("paid")}</th>
                          <th className="py-4 px-6 font-mono text-right">{t("remaining")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 font-medium">
                        {studentFees.map((fee) => {
                          const remaining = fee.amount - fee.deductions - fee.paid;
                          return (
                            <tr key={fee.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/30 transition-colors">
                              <td className="py-4 px-6">
                                <span className="block font-semibold text-slate-800 dark:text-slate-200">{fee.feeName}</span>
                                <span className="block text-[10px] text-slate-400 font-mono">Statement ID: {stripLeadingZeros(fee.id)}</span>
                              </td>
                              <td className="py-4 px-6 font-mono text-center text-slate-800 dark:text-slate-100">{formatCurrency(fee.amount)}</td>
                              <td className="py-4 px-6 font-mono text-center text-slate-500 dark:text-slate-400">{formatCurrency(fee.deductions)}</td>
                              <td className="py-4 px-6 font-mono text-center text-emerald-600 dark:text-emerald-400">{formatCurrency(fee.paid)}</td>
                              <td className="py-4 px-6 text-right">
                                <span className={`inline-flex px-2.5 py-0.5 text-xs font-bold font-mono rounded ${
                                  remaining > 0
                                    ? "bg-rose-100/50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-455 border border-rose-200 dark:border-rose-500/10"
                                    : "bg-emerald-100/50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/10"
                                }`}>
                                  {formatCurrency(remaining)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                        {studentFees.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 px-6 text-center text-slate-500">
                              No active billing ledger records assigned.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Ledger summary column */}
                <div className="lg:col-span-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col gap-6 shadow-sm">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">Ledger Summary</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Aggregated standing of tuition costs.</p>
                  </div>

                  <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400">Total Invoiced</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">{formatCurrency(totalAssignedFees)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400">Total Credits/Waivers</span>
                      <span className="font-mono text-slate-500 dark:text-slate-400">-{formatCurrency(totalDeductions)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400">Total Payments Logged</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">-{formatCurrency(totalPaid)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t("outstanding_balance")}</span>
                    <span className={`text-3xl font-extrabold font-mono tracking-tight ${
                      remainingBalance > 0 ? "text-rose-500 dark:text-rose-400" : "text-emerald-500 dark:text-emerald-400"
                    }`}>
                      {formatCurrency(remainingBalance)}
                    </span>
                  </div>

                  {remainingBalance > 0 ? (
                    <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-4 rounded-xl flex gap-3 text-xs text-rose-600 dark:text-rose-400">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <p className="leading-relaxed">
                        An outstanding balance remains. Tuition dues can be settled in full or installments at the finance desk.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-xl flex gap-3 text-xs text-emerald-600 dark:text-emerald-400 animate-pulse">
                      <CheckCircle className="w-5 h-5 shrink-0" />
                      <p className="leading-relaxed">
                        Your account is fully settled. No tuition balances are outstanding for this term. Good standing confirmed.
                      </p>
                    </div>
                  )}
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
