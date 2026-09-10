"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export type Language = "en" | "ar" | "so";

export type UserRole = "super_admin" | "admin";
export type AccountStatus = "active" | "inactive";

export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  gradeGroup: string;
  academicYear: string;
  status?: string;
}

export interface ClassItem {
  id: string;
  className: string;
  room: string;
  instructor: string;
}

export interface Fee {
  id: string;
  studentId: string;
  studentName?: string;
  className?: string;
  feeName: string;
  amount: number;
  paid: number;
  deductions: number;
  status: string;
  transactionType?: "Charge" | "Payment" | "Waiver" | "Credit";
  date?: string;
  referenceNumber?: string;
  createdBy?: string;
  paymentMethod?: string;
  notes?: string;
  academicYear?: string;
}

export interface Exam {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  academicYear: string;
  subject: string;
  term: string;
  score: number;
  maxPoints: number;
  feedback: string;
}

export interface Subject {
  id: string;
  subjectName: string;
  subjectCode: string;
  description: string;
}

export type CurrentUser = {
  id?: string;
  email?: string;
  role: "super_admin" | "admin" | "student";
  studentId?: string;
  name?: string;
} | null;

interface PortalContextType {
  students: Student[];
  classes: ClassItem[];
  fees: Fee[];
  exams: Exam[];
  subjects: Subject[];
  userAccounts: UserAccount[];
  currentUser: CurrentUser;
  isInitialized: boolean;
  login: (role: "admin" | "student", identifier: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  refreshData: (portal?: "admin" | "student") => Promise<void>;
  logout: (portal?: "admin" | "student") => Promise<void>;
  addUserAccount: (fullName: string, email: string, password: string, role: UserRole, status: AccountStatus) => Promise<{ success: boolean; error?: string }>;
  editUserAccount: (id: string, fullName: string, email: string, password?: string, role?: UserRole, status?: AccountStatus) => Promise<{ success: boolean; error?: string }>;
  deleteUserAccount: (id: string) => Promise<{ success: boolean; error?: string }>;
  toggleUserAccountStatus: (id: string) => Promise<{ success: boolean; error?: string }>;
  addStudent: (name: string, email: string, gradeGroup: string, academicYear: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  editStudent: (id: string, name: string, email: string, gradeGroup: string, academicYear: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  deleteStudent: (id: string) => Promise<{ success: boolean; error?: string }>;
  addClass: (className: string, room: string, instructor: string) => Promise<{ success: boolean; error?: string }>;
  editClass: (id: string, className: string, room: string, instructor: string) => Promise<{ success: boolean; error?: string }>;
  deleteClass: (id: string) => Promise<{ success: boolean; error?: string }>;
  addCharge: (
    studentIds: string[],
    description: string,
    amount: number,
    date: string,
    referenceNumber: string,
    createdBy: string,
    notes?: string,
    academicYear?: string
  ) => Promise<{ success: boolean; error?: string }>;
  recordPayment: (
    studentId: string,
    studentName: string,
    className: string,
    amount: number,
    date: string,
    paymentMethod: string,
    referenceNumber: string,
    receivedBy: string,
    notes?: string,
    academicYear?: string
  ) => Promise<{ success: boolean; error?: string }>;
  assignFee: (
    studentId: string,
    feeName: string,
    amount: number,
    status?: "Paid" | "Unpaid" | "Partial",
    paid?: number,
    academicYear?: string
  ) => void;
  editFee: (id: string, feeName: string, amount: number) => Promise<{ success: boolean; error?: string }>;
  deleteFee: (id: string) => Promise<{ success: boolean; error?: string }>;
  addPayment: (feeId: string, amount: number) => void;
  applyDeduction: (feeId: string, amount: number) => void;
  gradeStudent: (
    studentId: string,
    className: string,
    subject: string,
    term: string,
    score: number,
    feedback: string,
    academicYear: string,
    maxPoints: number,
    studentName: string
  ) => Promise<{ success: boolean; error?: string }>;
  gradeStudentBatch: (studentId: string, className: string, term: string, grades: { subject: string; score: number; feedback: string }[]) => Promise<{ success: boolean; error?: string }>;
  deleteExam: (id: string) => Promise<{ success: boolean; error?: string }>;
  editExam: (id: string, score: number, feedback: string) => Promise<{ success: boolean; error?: string }>;
  addSubject: (subjectName: string, subjectCode: string, description: string) => Promise<{ success: boolean; error?: string }>;
  deleteSubject: (id: string) => Promise<{ success: boolean; error?: string }>;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();

  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [language, setLanguageState] = useState<Language>("en");
  const [theme, setThemeState] = useState<"light" | "dark">("dark");

  const saveState = (key: string, data: unknown) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(data));
    }
  };

  const getActivePortalType = (): "admin" | "student" => {
    if (typeof window !== "undefined") {
      if (window.location.pathname.startsWith("/student")) return "student";
      if (window.location.pathname.startsWith("/admin")) return "admin";
    }
    return "admin";
  };

  const refreshData = async (portalOverride?: "admin" | "student") => {
    const portal = portalOverride || getActivePortalType();
    try {
      const res = await fetch(`/api/portal-data?portal=${portal}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setStudents(json.data.students || []);
          setClasses(json.data.classes || []);
          setFees(json.data.fees || []);
          setExams(json.data.exams || []);
          setSubjects(json.data.subjects || []);
          setUserAccounts(json.data.userAccounts || []);
        }
      }
    } catch (err) {
      console.error("Failed to refresh portal data:", err);
    } finally {
      router.refresh();
    }
  };

  // Sync session and settings on mount
  useEffect(() => {
    const initPortal = async () => {
      try {
        const portal = getActivePortalType();
        const storedLang = localStorage.getItem(`${portal}_portal_lang`) || localStorage.getItem("portal_lang");
        const storedTheme = localStorage.getItem(`${portal}_portal_theme`) || localStorage.getItem("portal_theme");

        if (storedLang) {
          try {
            setLanguageState(JSON.parse(storedLang) as Language);
          } catch {
            setLanguageState(storedLang as Language);
          }
        }
        if (storedTheme) {
          try {
            setThemeState(JSON.parse(storedTheme) as "light" | "dark");
          } catch {
            setThemeState(storedTheme as "light" | "dark");
          }
        }

        // Fetch portal-specific session from server
        const meRes = await fetch(`/api/auth/me?portal=${portal}`);
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.authenticated && meData.user) {
            setCurrentUser(meData.user);
            await refreshData(portal);
          } else {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("Portal Initialization Error:", err);
      } finally {
        setIsInitialized(true);
      }
    };

    initPortal();
  }, []);

  const login = async (role: "admin" | "student", identifier: string, password?: string) => {
    try {
      const payload: any = { role, password };

      if (role === "student") {
        payload.studentId = identifier.trim().toUpperCase();
      } else {
        payload.identifier = identifier;
      }

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success && data.user) {
        const userObj: CurrentUser = data.user;
        setCurrentUser(userObj);
        await refreshData(role === "student" ? "student" : "admin");
        return { success: true };
      } else {
        return { success: false, error: data.error || "Authentication failed." };
      }
    } catch {
      return { success: false, error: "Network or database connection error." };
    }
  };

  const logout = async (portalOverride?: "admin" | "student") => {
    const portal = portalOverride || getActivePortalType();
    try {
      await fetch(`/api/auth/logout?portal=${portal}`, { method: "POST" });
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      setCurrentUser(null);
      setStudents([]);
      setClasses([]);
      setFees([]);
      setExams([]);
      setSubjects([]);
      setUserAccounts([]);
      if (typeof window !== "undefined") {
        localStorage.removeItem(`${portal}_portal_user`);
        localStorage.removeItem(`${portal}_portal_session`);
      }
      router.push("/login");
      router.refresh();
    }
  };

  // User Accounts Management
  const addUserAccount = async (
    fullName: string,
    email: string,
    password: string,
    role: UserRole,
    status: AccountStatus
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/user-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, role, status }),
      });
      const data = await response.json();
      if (data.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: data.error || "Failed to add user account." };
    } catch {
      return { success: false, error: "Network or server connection error." };
    }
  };

  const editUserAccount = async (
    id: string,
    fullName: string,
    email: string,
    password?: string,
    role?: UserRole,
    status?: AccountStatus
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/user-accounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, fullName, email, password, role, status }),
      });
      const data = await response.json();
      if (data.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: data.error || "Failed to edit user account." };
    } catch {
      return { success: false, error: "Network or server connection error." };
    }
  };

  const deleteUserAccount = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/user-accounts?id=${id}`, {
        method: "DELETE"
      });
      const data = await response.json();
      if (data.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: data.error || "Failed to delete user account." };
    } catch {
      return { success: false, error: "Network or server connection error." };
    }
  };

  const toggleUserAccountStatus = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/user-accounts?id=${id}`, {
        method: "PATCH"
      });
      const data = await response.json();
      if (data.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: data.error || "Failed to toggle status." };
    } catch {
      return { success: false, error: "Network or server connection error." };
    }
  };

  // Student CRUD operations
  const addStudent = async (
    name: string,
    email: string,
    gradeGroup: string,
    academicYear: string,
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, gradeGroup, academicYear, password }),
      });
      const data = await response.json();
      if (data.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: data.error || "Failed to register student." };
    } catch {
      return { success: false, error: "Network or server connection error." };
    }
  };

  const editStudent = async (
    id: string,
    name: string,
    email: string,
    gradeGroup: string,
    academicYear: string,
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/students", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name, email, gradeGroup, academicYear, password }),
      });
      const data = await response.json();
      if (data.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: data.error || "Failed to update student details." };
    } catch {
      return { success: false, error: "Network or server connection error." };
    }
  };

  const deleteStudent = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/students?id=${id}`, {
        method: "DELETE"
      });
      const data = await response.json();
      if (data.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: data.error || "Failed to delete student." };
    } catch {
      return { success: false, error: "Network or server connection error." };
    }
  };

  // Class CRUD operations
  const addClass = async (className: string, room: string, instructor: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ className, room, instructor }),
      });
      const data = await response.json();
      if (data.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: data.error || "Failed to create class." };
    } catch {
      return { success: false, error: "Network or server connection error." };
    }
  };

  const editClass = async (id: string, className: string, room: string, instructor: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/classes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, className, room, instructor }),
      });
      const data = await response.json();
      if (data.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: data.error || "Failed to edit class." };
    } catch {
      return { success: false, error: "Network or server connection error." };
    }
  };

  const deleteClass = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/classes?id=${id}`, {
        method: "DELETE"
      });
      const data = await response.json();
      if (data.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: data.error || "Failed to delete class." };
    } catch {
      return { success: false, error: "Network or server connection error." };
    }
  };

  // Charge/Payment CRUD
  const addCharge = async (
    studentIds: string[],
    description: string,
    amount: number,
    date: string,
    referenceNumber: string,
    createdBy: string,
    notes?: string,
    academicYear?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "charge",
          studentIds,
          description,
          amount,
          date,
          referenceNumber,
          createdBy,
          notes,
          academicYear
        }),
      });
      const data = await response.json();
      if (data.success) {
        await refreshData();
        return { success: true };
      } else {
        return { success: false, error: data.error || "Failed to add charge." };
      }
    } catch {
      return { success: false, error: "Network or server connection error." };
    }
  };

  const recordPayment = async (
    studentId: string,
    studentName: string,
    className: string,
    amount: number,
    date: string,
    paymentMethod: string,
    referenceNumber: string,
    receivedBy: string,
    notes?: string,
    academicYear?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "payment",
          studentId,
          studentName,
          className,
          amount,
          date,
          paymentMethod,
          referenceNumber,
          receivedBy,
          notes,
          academicYear
        }),
      });
      const data = await response.json();
      if (data.success) {
        await refreshData();
        return { success: true };
      } else {
        return { success: false, error: data.error || "Failed to record payment." };
      }
    } catch {
      return { success: false, error: "Network or server connection error." };
    }
  };

  const assignFee = (
    studentId: string,
    feeName: string,
    amount: number,
    status: "Paid" | "Unpaid" | "Partial" = "Unpaid",
    paid: number = 0,
    academicYear?: string
  ) => {
    // Stub for backward compatibility
  };

  const editFee = async (id: string, feeName: string, amount: number): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/finance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, feeName, amount }),
      });
      const data = await response.json();
      if (data.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: data.error || "Failed to update fee record." };
    } catch {
      return { success: false, error: "Network or server connection error." };
    }
  };

  const deleteFee = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/finance?id=${id}`, {
        method: "DELETE"
      });
      const data = await response.json();
      if (data.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: data.error || "Failed to delete fee record." };
    } catch {
      return { success: false, error: "Network or server connection error." };
    }
  };

  const addPayment = (feeId: string, amount: number) => {
    // Stub for backward compatibility
  };

  const applyDeduction = (feeId: string, amount: number) => {
    // Stub for backward compatibility
  };

  // Exam Grading CRUD
  const gradeStudent = async (
    studentId: string,
    className: string,
    subject: string,
    term: string,
    score: number,
    feedback: string,
    academicYear: string,
    maxPoints: number = 100,
    studentName: string = ""
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          className,
          subject,
          term,
          score,
          maxPoints,
          feedback,
          academicYear,
          studentName
        }),
      });
      const data = await response.json();
      if (data.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: data.error || "Failed to record exam grade." };
    } catch {
      return { success: false, error: "Network or server connection error." };
    }
  };

  const gradeStudentBatch = async (
    studentId: string,
    className: string,
    term: string,
    grades: { subject: string; score: number; feedback: string }[]
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isBatch: true,
          studentId,
          className,
          term,
          grades
        }),
      });
      const data = await response.json();
      if (data.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: data.error || "Failed to submit batch exam grades." };
    } catch {
      return { success: false, error: "Network or server connection error." };
    }
  };

  const deleteExam = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/exams?id=${id}`, {
        method: "DELETE"
      });
      const data = await response.json();
      if (data.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: data.error || "Failed to delete exam record." };
    } catch {
      return { success: false, error: "Network or server connection error." };
    }
  };

  const editExam = async (id: string, score: number, feedback: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/exams", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, score, feedback }),
      });
      const data = await response.json();
      if (data.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: data.error || "Failed to edit exam record." };
    } catch {
      return { success: false, error: "Network or server connection error." };
    }
  };

  // Subjects Registry CRUD
  const addSubject = async (subjectName: string, subjectCode: string, description: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectName, subjectCode, description }),
      });
      const data = await response.json();
      if (data.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: data.error || "Failed to register subject." };
    } catch {
      return { success: false, error: "Network or server connection error." };
    }
  };

  const deleteSubject = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/subjects?id=${id}`, {
        method: "DELETE"
      });
      const data = await response.json();
      if (data.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: data.error || "Failed to delete subject." };
    } catch {
      return { success: false, error: "Network or server connection error." };
    }
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    saveState("portal_lang", lang);
  };

  const toggleTheme = () => {
    setThemeState((prev) => {
      const nextTheme = prev === "dark" ? "light" : "dark";
      saveState("portal_theme", nextTheme);
      return nextTheme;
    });
  };

  // Dark/Light theme class effect
  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      if (theme === "dark") {
        root.classList.add("dark");
        root.classList.remove("light");
      } else {
        root.classList.add("light");
        root.classList.remove("dark");
      }
    }
  }, [theme]);

  return (
    <PortalContext.Provider
      value={{
        students,
        classes,
        fees,
        exams,
        subjects,
        userAccounts,
        currentUser,
        isInitialized,
        language,
        setLanguage,
        theme,
        toggleTheme,
        login,
        logout,
        addUserAccount,
        editUserAccount,
        deleteUserAccount,
        toggleUserAccountStatus,
        addStudent,
        deleteStudent,
        addClass,
        editClass,
        deleteClass,
        addCharge,
        recordPayment,
        assignFee,
        editFee,
        deleteFee,
        addPayment,
        applyDeduction,
        gradeStudent,
        gradeStudentBatch,
        editStudent,
        deleteExam,
        editExam,
        addSubject,
        deleteSubject,
        refreshData,
      }}
    >
      {children}
    </PortalContext.Provider>
  );
};

export const usePortal = () => {
  const context = useContext(PortalContext);
  if (context === undefined) {
    throw new Error("usePortal must be used within a PortalProvider");
  }
  return context;
};
