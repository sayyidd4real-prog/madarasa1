"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "ar" | "so";

export interface Student {
  id: string;
  name: string;
  email: string;
  gradeGroup: string;
  academicYear: string;
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
  feeName: string;
  amount: number;
  paid: number;
  deductions: number;
  status: "Paid" | "Unpaid" | "Partial";
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
  role: "admin" | "student";
  studentId?: string;
  name?: string;
} | null;

interface PortalContextType {
  students: Student[];
  classes: ClassItem[];
  fees: Fee[];
  exams: Exam[];
  subjects: Subject[];
  currentUser: CurrentUser;
  isInitialized: boolean;
  login: (role: "admin" | "student", identifier: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  addStudent: (name: string, email: string, gradeGroup: string, academicYear: string) => void;
  deleteStudent: (id: string) => void;
  addClass: (className: string, room: string, instructor: string) => void;
  assignFee: (
    studentId: string,
    feeName: string,
    amount: number,
    status?: "Paid" | "Unpaid" | "Partial",
    paid?: number,
    academicYear?: string
  ) => void;
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
  ) => void;
  gradeStudentBatch: (studentId: string, className: string, term: string, grades: { subject: string; score: number; feedback: string }[]) => void;
  editStudent: (id: string, name: string, email: string, gradeGroup: string, academicYear: string) => void;
  deleteExam: (id: string) => void;
  editExam: (id: string, score: number, feedback: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  editClass: (id: string, className: string, room: string, instructor: string) => void;
  deleteClass: (id: string) => void;
  editFee: (id: string, feeName: string, amount: number) => void;
  deleteFee: (id: string) => void;
  addSubject: (subjectName: string, subjectCode: string, description: string) => void;
  deleteSubject: (id: string) => void;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [language, setLanguageState] = useState<Language>("en");
  const [theme, setThemeState] = useState<"light" | "dark">("dark");

  // Sync from localStorage on mount
  useEffect(() => {
    const initPortal = () => {
      try {
        const storedLang = localStorage.getItem("portal_lang");
        const storedTheme = localStorage.getItem("portal_theme");
        const storedUser = localStorage.getItem("portal_user");

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
        if (storedUser) {
          try {
            setCurrentUser(JSON.parse(storedUser));
          } catch {
            setCurrentUser(null);
          }
        }

        // Try to load from LocalStorage first (frontend-first)
        const storedStudents = localStorage.getItem("portal_students");
        const storedClasses = localStorage.getItem("portal_classes");
        const storedFees = localStorage.getItem("portal_fees");
        const storedExams = localStorage.getItem("portal_exams");
        const storedSubjects = localStorage.getItem("portal_subjects");

        let loadedStudents = storedStudents ? JSON.parse(storedStudents) : null;
        let loadedClasses = storedClasses ? JSON.parse(storedClasses) : null;
        let loadedFees = storedFees ? JSON.parse(storedFees) : null;
        let loadedExams = storedExams ? JSON.parse(storedExams) : null;
        let loadedSubjects = storedSubjects ? JSON.parse(storedSubjects) : null;

        // Apply fallback mock data if still unpopulated
        if (!loadedClasses || loadedClasses.length === 0) {
          loadedClasses = [
            { id: "cls-1", className: "Class One", room: "Room 101", instructor: "Prof. Ahmed Ali" },
            { id: "cls-2", className: "Class Two", room: "Room 102", instructor: "Dr. Fatima Omar" },
            { id: "cls-3", className: "Biology Class", room: "Lab 204", instructor: "Prof. Alan Turing" },
            { id: "cls-4", className: "Mathematics Class", room: "Room 105", instructor: "Dr. Ada Lovelace" }
          ];
        }

        if (!loadedStudents || loadedStudents.length === 0) {
          loadedStudents = [
            { id: "STU-1001", name: "Ahmed Ali", email: "ahmed@example.com", gradeGroup: "Class One", academicYear: "2025–2026" },
            { id: "STU-1002", name: "Fatima Omar", email: "fatima@example.com", gradeGroup: "Biology Class", academicYear: "2025–2026" }
          ];
        }

        if (!loadedExams || loadedExams.length === 0) {
          loadedExams = [
            {
              id: "EXM-101",
              studentId: "STU-1001",
              studentName: "Ahmed Ali",
              className: "Class One",
              academicYear: "2025–2026",
              subject: "Mathematics",
              term: "Term 1",
              score: 92,
              maxPoints: 100,
              feedback: "Excellent work. Keep improving your problem-solving skills."
            },
            {
              id: "EXM-102",
              studentId: "STU-1001",
              studentName: "Ahmed Ali",
              className: "Class One",
              academicYear: "2025–2026",
              subject: "Islamic Studies",
              term: "Term 1",
              score: 88,
              maxPoints: 100,
              feedback: "Very good understanding of the topics."
            }
          ];
        }

        if (!loadedFees || loadedFees.length === 0) {
          loadedFees = [
            { id: "fee-1", studentId: "STU-1001", feeName: "Tuition Fee Term 1", amount: 500, paid: 400, deductions: 50, status: "Partial" },
            { id: "fee-2", studentId: "STU-1002", feeName: "Tuition Fee Term 1", amount: 500, paid: 500, deductions: 0, status: "Paid" }
          ];
        }

        if (!loadedSubjects || loadedSubjects.length === 0) {
          loadedSubjects = [
            { id: "SUB-101", subjectName: "English", subjectCode: "ENG-101", description: "Core English reading & grammar course" },
            { id: "SUB-102", subjectName: "Arabic", subjectCode: "ARA-101", description: "Arabic grammar, literature and speaking" },
            { id: "SUB-103", subjectName: "Biology", subjectCode: "BIO-101", description: "Introduction to cellular biology and genetics" },
            { id: "SUB-104", subjectName: "Chemistry", subjectCode: "CHM-101", description: "General chemistry, bonding and atomic structure" },
            { id: "SUB-105", subjectName: "Physics", subjectCode: "PHY-101", description: "Mechanics, kinematics and light properties" },
            { id: "SUB-106", subjectName: "Mathematics", subjectCode: "MTH-101", description: "Calculus, equations and statistical methods" },
            { id: "SUB-107", subjectName: "Islamic Studies", subjectCode: "ISL-101", description: "Islamic history, jurisprudence and Quran studies" },
            { id: "SUB-108", subjectName: "Geography", subjectCode: "GEO-101", description: "Physical geography and human civilizations" },
            { id: "SUB-109", subjectName: "History", subjectCode: "HIS-101", description: "Global world history and ancient eras" },
          ];
        }

        setClasses(loadedClasses);
        setStudents(loadedStudents);
        setExams(loadedExams);
        setFees(loadedFees);
        setSubjects(loadedSubjects);

      } catch (err) {
        console.error("Portal Initialization Error:", err);
      } finally {
        setIsInitialized(true);
      }
    };

    initPortal();
  }, []);

  // Synchronize state changes back to localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("portal_students", JSON.stringify(students));
    }
  }, [students, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("portal_classes", JSON.stringify(classes));
    }
  }, [classes, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("portal_fees", JSON.stringify(fees));
    }
  }, [fees, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("portal_exams", JSON.stringify(exams));
    }
  }, [exams, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("portal_subjects", JSON.stringify(subjects));
    }
  }, [subjects, isInitialized]);

  // Save to localStorage helpers for theme/language client settings
  const saveState = (key: string, data: unknown) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(data));
    }
  };

  const login = async (role: "admin" | "student", identifier: string, password?: string) => {
    if (role === "admin") {
      if (identifier.trim() === "admin" && password === "admin123") {
        const userObj: CurrentUser = { role: "admin", name: "System Admin" };
        setCurrentUser(userObj);
        saveState("portal_user", userObj);
        return { success: true };
      }
      return { success: false, error: "Invalid Admin username or password" };
    } else {
      const match = students.find(
        (s) => s.id.toLowerCase() === identifier.trim().toLowerCase() ||
               s.name.toLowerCase() === identifier.trim().toLowerCase()
      );
      if (match) {
        const userObj: CurrentUser = { role: "student", studentId: match.id, name: match.name };
        setCurrentUser(userObj);
        saveState("portal_user", userObj);
        return { success: true };
      }
      return { success: false, error: "No student record matching that input" };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("portal_user");
    }
  };

  const addStudent = (name: string, email: string, gradeGroup: string, academicYear: string) => {
    const numIds = students.map((s) => {
      const match = s.id.match(/STU-(\d+)/);
      return match ? parseInt(match[1], 10) : 1000;
    });
    const maxIdNum = numIds.length > 0 ? Math.max(...numIds) : 1000;
    const newId = `STU-${maxIdNum + 1}`;

    const newStudent: Student = { id: newId, name, email, gradeGroup, academicYear };
    setStudents((prev) => [...prev, newStudent]);
  };

  const editStudent = (id: string, name: string, email: string, gradeGroup: string, academicYear: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name, email, gradeGroup, academicYear } : s))
    );
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setFees((prev) => prev.filter((f) => f.studentId !== id));
    setExams((prev) => prev.filter((e) => e.studentId !== id));
  };

  const addClass = (className: string, room: string, instructor: string) => {
    const classId = `cls-${Date.now()}`;
    setClasses((prev) => [...prev, { id: classId, className, room, instructor }]);
  };

  const editClass = (id: string, className: string, room: string, instructor: string) => {
    setClasses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, className, room, instructor } : c))
    );
  };

  const deleteClass = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
  };

  const assignFee = (
    studentId: string,
    feeName: string,
    amount: number,
    status: "Paid" | "Unpaid" | "Partial" = "Unpaid",
    paid: number = 0,
    academicYear?: string
  ) => {
    const feeId = `fee-${Date.now() + Math.floor(Math.random() * 1000)}`;
    const newFee: Fee = {
      id: feeId,
      studentId,
      feeName,
      amount,
      paid,
      deductions: 0,
      status,
      academicYear
    };
    setFees((prev) => [...prev, newFee]);
  };

  const editFee = (id: string, feeName: string, amount: number) => {
    setFees((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const remaining = amount - f.deductions - f.paid;
          const status = remaining <= 0 ? "Paid" : f.paid === 0 ? "Unpaid" : "Partial";
          return { ...f, feeName, amount, status };
        }
        return f;
      })
    );
  };

  const deleteFee = (id: string) => {
    setFees((prev) => prev.filter((f) => f.id !== id));
  };

  const addPayment = (feeId: string, amount: number) => {
    setFees((prev) =>
      prev.map((f) => {
        if (f.id === feeId) {
          const newPaid = Math.min(f.paid + amount, f.amount - f.deductions);
          const remaining = f.amount - f.deductions - newPaid;
          const status = remaining <= 0 ? "Paid" : newPaid === 0 ? "Unpaid" : "Partial";
          return { ...f, paid: newPaid, status };
        }
        return f;
      })
    );
  };

  const applyDeduction = (feeId: string, amount: number) => {
    setFees((prev) =>
      prev.map((f) => {
        if (f.id === feeId) {
          const newDeductions = Math.min(f.deductions + amount, f.amount - f.paid);
          const remaining = f.amount - newDeductions - f.paid;
          const status = remaining <= 0 ? "Paid" : f.paid === 0 ? "Unpaid" : "Partial";
          return { ...f, deductions: newDeductions, status };
        }
        return f;
      })
    );
  };

  const gradeStudent = (
    studentId: string,
    className: string,
    subject: string,
    term: string,
    score: number,
    feedback: string,
    academicYear: string,
    maxPoints: number,
    studentName: string
  ) => {
    const examId = `EXM-${Math.floor(100000 + Math.random() * 900000)}`;
    const newExam: Exam = {
      id: examId,
      studentId,
      studentName,
      className,
      academicYear,
      subject,
      term,
      score,
      maxPoints,
      feedback: feedback || "",
    };

    setExams((prev) => {
      const idx = prev.findIndex(
        (e) => e.studentId === studentId &&
               e.className === className &&
               e.subject === subject &&
               e.term === term &&
               e.academicYear === academicYear
      );
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = newExam;
        return copy;
      }
      return [...prev, newExam];
    });
  };

  const gradeStudentBatch = (
    studentId: string,
    className: string,
    term: string,
    grades: { subject: string; score: number; feedback: string }[]
  ) => {
    const studentObj = students.find((s) => s.id === studentId);
    const studentName = studentObj ? studentObj.name : "";
    const academicYear = studentObj ? studentObj.academicYear : "2025–2026";

    const newExams = grades.map((g) => ({
      id: `EXM-${Math.floor(100000 + Math.random() * 900000)}`,
      studentId,
      studentName,
      className,
      academicYear,
      subject: g.subject,
      term,
      score: g.score,
      maxPoints: 100,
      feedback: g.feedback,
    }));

    setExams((prev) => {
      const current = [...prev];
      newExams.forEach((ne) => {
        const idx = current.findIndex(
          (e) => e.studentId === ne.studentId &&
                 e.className === ne.className &&
                 e.subject === ne.subject &&
                 e.term === ne.term &&
                 e.academicYear === ne.academicYear
        );
        if (idx > -1) {
          current[idx] = ne;
        } else {
          current.push(ne);
        }
      });
      return current;
    });
  };

  const editExam = (id: string, score: number, feedback: string) => {
    setExams((prev) =>
      prev.map((e) => (e.id === id ? { ...e, score, feedback } : e))
    );
  };

  const deleteExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  const addSubject = (subjectName: string, subjectCode: string, description: string) => {
    const nextNum = subjects.map(s => {
      const match = s.id.match(/SUB-(\d+)/);
      return match ? parseInt(match[1], 10) : 100;
    });
    const maxNum = nextNum.length > 0 ? Math.max(...nextNum) : 100;
    const newId = `SUB-${maxNum + 1}`;
    const newSub: Subject = { id: newId, subjectName, subjectCode, description };
    setSubjects((prev) => [...prev, newSub]);
  };

  const deleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter(s => s.id !== id));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    saveState("portal_lang", lang);
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setThemeState(nextTheme);
    saveState("portal_theme", nextTheme);
  };

  // RTL layout effect when language changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = language;
    }
  }, [language]);

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
        currentUser,
        isInitialized,
        language,
        setLanguage,
        theme,
        toggleTheme,
        login,
        logout,
        addStudent,
        deleteStudent,
        addClass,
        editClass,
        deleteClass,
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
