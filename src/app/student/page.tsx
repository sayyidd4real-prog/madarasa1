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
  TrendingUp
} from "lucide-react";
import { usePortal, Exam } from "@/context/PortalContext";
import { useToast } from "@/context/ToastContext";
import { translations } from "@/context/translations";
import { MadrasaLoader } from "@/components/MadrasaLogo";

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
  const totalAssignedFees = studentFees.reduce((sum, f) => sum + f.amount, 0);
  const totalPaid = studentFees.reduce((sum, f) => sum + f.paid, 0);
  const totalDeductions = studentFees.reduce((sum, f) => sum + f.deductions, 0);
  const remainingBalance = totalAssignedFees - totalPaid - totalDeductions;

  const handleLogout = async () => {
    await logout("student");
    showToast("Logged out from student session", "success");
    router.push("/login");
  };

  // Group exams by Academic Year, then Term, then Class
  interface GroupedExams {
    [year: string]: {
      [term: string]: {
        [className: string]: Exam[]
      }
    }
  }

  const groupedExams: GroupedExams = {};
  studentExams.forEach((exam) => {
    const year = exam.academicYear || "2025–2026";
    const term = exam.term || "Term 1";
    const cls = exam.className || "Class One";

    if (!groupedExams[year]) {
      groupedExams[year] = {};
    }
    if (!groupedExams[year][term]) {
      groupedExams[year][term] = {};
    }
    if (!groupedExams[year][term][cls]) {
      groupedExams[year][term][cls] = [];
    }
    groupedExams[year][term][cls].push(exam);
  });

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
                ID: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{studentId}</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Class: <span className="text-slate-800 dark:text-slate-200 font-semibold">{studentProfile?.gradeGroup || "Unassigned"}</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Academic Year: <span className="text-slate-800 dark:text-slate-200 font-semibold">{studentProfile?.academicYear || "Unassigned"}</span>
              </span>
              {studentProfile?.email && (
                <>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Email: <span className="text-slate-800 dark:text-slate-200">{studentProfile.email}</span>
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
                {/* Stats row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-slate-100 dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 rounded-xl">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-2xl font-bold font-mono text-slate-800 dark:text-slate-100">{studentExams.length}</span>
                      <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t("completed_exams")}</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-slate-100 dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 rounded-xl">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-2xl font-bold font-mono text-slate-800 dark:text-slate-100">
                        {studentExams.length > 0
                          ? Math.round(studentExams.reduce((sum, e) => sum + e.score, 0) / studentExams.length)
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
                        {studentExams.length > 0
                          ? Math.round(studentExams.reduce((sum, e) => sum + e.score, 0) / studentExams.length) >= 60
                            ? "Satisfactory Good"
                            : "Academic Warning"
                          : "No records"}
                      </span>
                      <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t("academic_standing")}</span>
                    </div>
                  </div>

                </div>

                {/* Grouped evaluations by Academic Year, Term, Class */}
                <div className="flex flex-col gap-10">
                  {Object.keys(groupedExams).sort().reverse().map((year) => {
                    const terms = groupedExams[year];
                    return (
                      <div key={year} className="flex flex-col gap-6 bg-slate-900/10 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-850 p-6 rounded-3xl shadow-sm">
                        {/* Academic Year Header */}
                        <div className="flex items-center gap-3">
                          <span className="px-3.5 py-1 bg-emerald-100 dark:bg-emerald-950 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg font-mono">
                            {year}
                          </span>
                          <h3 className="text-xs md:text-sm font-extrabold uppercase text-slate-500 dark:text-slate-450 tracking-wider">
                            Academic Year evaluations
                          </h3>
                          <div className="h-px bg-slate-200 dark:bg-slate-900/60 flex-1" />
                        </div>

                        {/* Terms List */}
                        <div className="flex flex-col gap-8 pl-1 md:pl-3">
                          {Object.keys(terms).sort().map((term) => {
                            const classesInTerm = terms[term];
                            return (
                              <div key={term} className="flex flex-col gap-4">
                                {/* Term title */}
                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                  <Clock className="w-4 h-4 text-emerald-500" />
                                  <span className="text-xs font-black uppercase tracking-wider">
                                    {term} Examination Reports
                                  </span>
                                </div>

                                {/* Classes list in this term */}
                                <div className="flex flex-col gap-6 pl-4 border-l border-slate-200 dark:border-slate-850">
                                  {Object.keys(classesInTerm).sort().map((className) => {
                                    const classExams = classesInTerm[className];

                                    // Build map of subject -> score from classExams
                                    const examMap: { [subj: string]: number } = {};
                                    classExams.forEach((e) => {
                                      examMap[e.subject] = e.score;
                                    });

                                    // Calculate total and grade
                                    let total = 0;
                                    let count = 0;
                                    subjects.forEach((sub) => {
                                      const score = examMap[sub.subjectName];
                                      if (score !== undefined) {
                                        total += score;
                                        count++;
                                      }
                                    });

                                    const average = count > 0 ? (total / count) : 0;
                                    const grade = count > 0 ? calculateGrade(average) : "—";

                                    // Gather feedback
                                    const feedbacks = classExams
                                      .map((e) => e.feedback)
                                      .filter((fb) => fb && fb.trim() !== "");

                                    return (
                                      <div
                                        key={className}
                                        className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm backdrop-blur-md"
                                      >
                                        {/* Card Header — Class + Term + Academic Year banner */}
                                        <div className="bg-gradient-to-r from-emerald-50 dark:from-emerald-950/50 to-transparent border-b border-slate-100 dark:border-slate-800/70 px-5 py-4">
                                          <h4 className="font-extrabold text-base text-slate-800 dark:text-slate-100 uppercase tracking-wider leading-tight">
                                            {className}
                                          </h4>
                                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[10px] font-bold text-slate-500 dark:text-slate-500 font-mono">
                                            <span>Academic Year: {year}</span>
                                            <span className="text-slate-300 dark:text-slate-700">·</span>
                                            <span className="text-emerald-600 dark:text-emerald-400">{term} Examination Reports</span>
                                          </div>
                                        </div>

                                        {/* Professional Marksheet Table */}
                                        <div className="overflow-x-auto">
                                          <table className="w-full text-xs min-w-max">
                                            <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                                              <tr>
                                                {subjects.map((sub) => (
                                                  <th key={sub.id} className="py-3 px-4 text-center whitespace-nowrap font-mono text-[10px]">
                                                    {sub.subjectName}
                                                  </th>
                                                ))}
                                                <th className="py-3 px-4 text-center whitespace-nowrap text-emerald-600 dark:text-emerald-400 text-[10px]">Total</th>
                                                <th className="py-3 px-4 text-center whitespace-nowrap text-emerald-600 dark:text-emerald-300 text-[10px]">Average</th>
                                                <th className="py-3 px-4 text-center whitespace-nowrap text-[10px]">Grade</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                                                {subjects.map((sub) => {
                                                  const s = examMap[sub.subjectName];
                                                  return (
                                                    <td key={sub.id} className="py-4 px-4 text-center border-b border-slate-100 dark:border-slate-800/40">
                                                      {s !== undefined
                                                        ? <span className="font-bold text-slate-800 dark:text-slate-100 font-mono text-sm">{s}</span>
                                                        : <span className="text-slate-400 dark:text-slate-700">—</span>}
                                                    </td>
                                                  );
                                                })}
                                                <td className="py-4 px-4 text-center border-b border-slate-100 dark:border-slate-800/40">
                                                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                                                    {count > 0 ? total : <span className="text-slate-400 dark:text-slate-700">—</span>}
                                                  </span>
                                                </td>
                                                <td className="py-4 px-4 text-center border-b border-slate-100 dark:border-slate-800/40">
                                                  <span className="font-bold text-emerald-600 dark:text-emerald-300 font-mono text-sm">
                                                    {count > 0 ? `${average.toFixed(1)}%` : <span className="text-slate-400 dark:text-slate-700">—</span>}
                                                  </span>
                                                </td>
                                                <td className="py-4 px-4 text-center border-b border-slate-100 dark:border-slate-800/40">
                                                  {count > 0
                                                    ? <span className={`inline-flex px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide rounded border ${getGradeBadge(grade)}`}>{grade}</span>
                                                    : <span className="text-slate-400 dark:text-slate-700">—</span>}
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </div>

                                        {/* Instructor Feedback */}
                                        {feedbacks.length > 0 && (
                                          <div className="mx-5 mb-4 mt-3 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/30 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/60 border-dashed">
                                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wide mb-1">
                                              Instructor Feedback
                                            </span>
                                            <ul className="list-disc pl-4 space-y-1">
                                              {feedbacks.map((fb, idx) => (
                                                <li key={idx} className="italic">"{fb}"</li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {studentExams.length === 0 && (
                    <div className="bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-900 rounded-2xl py-12 text-center text-slate-500 shadow-sm">
                      <FileText className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                      <p className="text-sm">No exam scores or transcripts found for your student profile.</p>
                    </div>
                  )}
                </div>

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
                    <table className="w-full text-left text-sm">
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
                                <span className="block text-[10px] text-slate-400 font-mono">Statement ID: {fee.id}</span>
                              </td>
                              <td className="py-4 px-6 font-mono text-center text-slate-800 dark:text-slate-100">${fee.amount}</td>
                              <td className="py-4 px-6 font-mono text-center text-slate-500 dark:text-slate-400">${fee.deductions}</td>
                              <td className="py-4 px-6 font-mono text-center text-emerald-600 dark:text-emerald-400">${fee.paid}</td>
                              <td className="py-4 px-6 text-right">
                                <span className={`inline-flex px-2.5 py-0.5 text-xs font-bold font-mono rounded ${
                                  remaining > 0
                                    ? "bg-rose-100/50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-455 border border-rose-200 dark:border-rose-500/10"
                                    : "bg-emerald-100/50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/10"
                                }`}>
                                  ${remaining}
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
                      <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">${totalAssignedFees}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400">Total Credits/Waivers</span>
                      <span className="font-mono text-slate-500 dark:text-slate-400">-${totalDeductions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400">Total Payments Logged</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">-${totalPaid}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t("outstanding_balance")}</span>
                    <span className={`text-3xl font-extrabold font-mono tracking-tight ${
                      remainingBalance > 0 ? "text-rose-500 dark:text-rose-400" : "text-emerald-500 dark:text-emerald-400"
                    }`}>
                      ${remainingBalance}
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
