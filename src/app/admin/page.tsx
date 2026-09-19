"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  BookOpen,
  DollarSign,
  Award,
  Plus,
  Trash2,
  LogOut,
  LayoutDashboard,
  Coins,
  FileCheck,
  Menu,
  X,
  CreditCard,
  UserCheck,
  GraduationCap,
  ChevronDown,
  Search,
  FileText,
  Shield,
  ShieldAlert,
  Key,
  Eye,
  EyeOff,
  UserPlus,
  CheckCircle2,
  XCircle,
  Ban
} from "lucide-react";
import { usePortal, Student, Exam, ClassItem, Fee, UserAccount, UserRole, AccountStatus } from "@/context/PortalContext";
import { useToast } from "@/context/ToastContext";
import { translations } from "@/context/translations";
import { MadrasaLogoIcon, MadrasaLoader } from "@/components/MadrasaLogo";
import { formatCurrency, formatDisplayNumber, formatCount, stripLeadingZeros } from "@/lib/formatters";

type AdminSection = "overview" | "students" | "classes" | "fees" | "exams" | "subjects" | "users";

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

export default function AdminDashboard() {
  const router = useRouter();
  const { showToast } = useToast();
  const {
    students,
    classes,
    fees,
    exams,
    subjects,
    userAccounts,
    currentUser,
    isInitialized,
    logout,
    addUserAccount,
    editUserAccount,
    deleteUserAccount,
    toggleUserAccountStatus,
    addStudent,
    deleteStudent,
    addClass,
    addCharge,
    recordPayment,
    gradeStudent,
    editStudent,
    deleteExam,
    editClass,
    deleteClass,
    editFee,
    deleteFee,
    addSubject,
    deleteSubject,
    language,
    setLanguage,
    theme,
    toggleTheme,
  } = usePortal();

  const t = (key: keyof typeof translations["en"]) => {
    const dict = translations[language] || translations["en"];
    return dict[key] || translations["en"][key] || key;
  };

  // Active section state
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");

  // Mobile sidebar menu toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- Form States ---
  // Student Form
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentGrade, setStudentGrade] = useState(""); // Stores selected class name
  const [studentAcademicYear, setStudentAcademicYear] = useState("2025–2026");
  const [studentPassword, setStudentPassword] = useState("");
  const [studentConfirmPassword, setStudentConfirmPassword] = useState("");
  const [showStudentPasswordInput, setShowStudentPasswordInput] = useState(false);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("");

  // User Accounts Form States
  const [newUserFullName, setNewUserFullName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserConfirmPassword, setNewUserConfirmPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>("admin");
  const [newUserStatus, setNewUserStatus] = useState<AccountStatus>("active");
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);

  // User Accounts Edit States
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserFullName, setEditUserFullName] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editUserPassword, setEditUserPassword] = useState("");
  const [editUserConfirmPassword, setEditUserConfirmPassword] = useState("");
  const [editUserRole, setEditUserRole] = useState<UserRole>("admin");
  const [editUserStatus, setEditUserStatus] = useState<AccountStatus>("active");
  const [showEditUserPassword, setShowEditUserPassword] = useState(false);

  // User Accounts Search & Filters
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("");
  const [userStatusFilter, setUserStatusFilter] = useState<string>("");

  // Redesigned Exam Form States
  const [examClassId, setExamClassId] = useState(""); // Holds class ID
  const [examAcademicYear, setExamAcademicYear] = useState("2025–2026"); // Holds academic year
  const [examTerm, setExamTerm] = useState("Term 1");

  // Exam row inputs state keyed by student ID
  const [rowInputs, setRowInputs] = useState<{
    [studentId: string]: {
      scores: { [subjectName: string]: string };
      feedback: string;
    }
  }>({});

  // Student Table States
  const [studentSearch, setStudentSearch] = useState("");
  const [studentSortField, setStudentSortField] = useState<"id" | "name" | "gradeGroup" | "academicYear">("id");
  const [studentSortDirection, setStudentSortDirection] = useState<"asc" | "desc">("asc");
  const [studentCurrentPage, setStudentCurrentPage] = useState(1);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<Student | null>(null);

  // Finance/Fees state variables
  const [financeSearchQuery, setFinanceSearchQuery] = useState("");
  const [financeFilterClass, setFinanceFilterClass] = useState("");
  const [financeFilterType, setFinanceFilterType] = useState("All");
  const [financeFilterStatus, setFinanceFilterStatus] = useState("All");
  const [financeStartDate, setFinanceStartDate] = useState("");
  const [financeEndDate, setFinanceEndDate] = useState("");
  const [financeCurrentPage, setFinanceCurrentPage] = useState(1);
  const [financePageSize, setFinancePageSize] = useState(10);
  const [financeSortField, setFinanceSortField] = useState("date");
  const [financeSortDirection, setFinanceSortDirection] = useState("desc");
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // New Charge form states
  const [chargeStudentId, setChargeStudentId] = useState("");
  const [chargeDescription, setChargeDescription] = useState("");
  const [chargeAmount, setChargeAmount] = useState("");
  const [chargeDate, setChargeDate] = useState(new Date().toISOString().split("T")[0]);
  const [chargeReference, setChargeReference] = useState("");
  const [chargeNotes, setChargeNotes] = useState("");
  const [chargeCreatedBy, setChargeCreatedBy] = useState("");

  // New Payment form states
  const [paymentStudentId, setPaymentStudentId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("EVCplus");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [paymentReceivedBy, setPaymentReceivedBy] = useState("");

  // Payment search states
  const [paymentSearchQuery, setPaymentSearchQuery] = useState("");
  const [paymentSearchResults, setPaymentSearchResults] = useState<any[]>([]);
  const [selectedPaymentStudent, setSelectedPaymentStudent] = useState<any>(null);
  const [isSearchingPaymentStudent, setIsSearchingPaymentStudent] = useState(false);

  // Inline forms state inside student detail modal
  const [showInlineForm, setShowInlineForm] = useState<"" | "charge" | "payment">("");
  const [inlineChargeDescription, setInlineChargeDescription] = useState("");
  const [inlineChargeAmount, setInlineChargeAmount] = useState("");
  const [inlineChargeDate, setInlineChargeDate] = useState(new Date().toISOString().split("T")[0]);
  const [inlineChargeNotes, setInlineChargeNotes] = useState("");
  const [inlinePaymentAmount, setInlinePaymentAmount] = useState("");
  const [inlinePaymentDate, setInlinePaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [inlinePaymentMethod, setInlinePaymentMethod] = useState("EVCplus");
  const [inlinePaymentNotes, setInlinePaymentNotes] = useState("");

  // Debounced search for payment student field
  useEffect(() => {
    if (!paymentSearchQuery.trim()) {
      setPaymentSearchResults([]);
      return;
    }

    setIsSearchingPaymentStudent(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch("/api/finance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "search_students",
            searchQuery: paymentSearchQuery,
            students,
            fees
          })
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.results)) {
          setPaymentSearchResults(data.results);
        } else {
          setPaymentSearchResults([]);
        }
      } catch (err) {
        console.error("Search failed:", err);
        setPaymentSearchResults([]);
      } finally {
        setIsSearchingPaymentStudent(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [paymentSearchQuery, students, fees]);

  // Bulk charges class filter
  const [feeClassId, setFeeClassId] = useState("");
  const [feeSearch, setFeeSearch] = useState("");
  const [selectedFeeStudents, setSelectedFeeStudents] = useState<string[]>([]);
  const [chargeEntireClass, setChargeEntireClass] = useState(false);

  // Exam Grading configuration states
  const [examMaxPoints, setExamMaxPoints] = useState(100);

  // Examination Registry filter states
  const [registryClassId, setRegistryClassId] = useState("");
  const [registryAcademicYear, setRegistryAcademicYear] = useState("");
  const [registryTerm, setRegistryTerm] = useState("");
  const [registryStudentSearch, setRegistryStudentSearch] = useState("");
  const [registryEditingStudentId, setRegistryEditingStudentId] = useState<string | null>(null);
  const [registryEditRowInputs, setRegistryEditRowInputs] = useState<{
    scores: { [subject: string]: string };
    feedback: string;
  }>({ scores: {}, feedback: "" });
  // key = "studentId|academicYear|term"
  const [expandedRegistryKeys, setExpandedRegistryKeys] = useState<Set<string>>(new Set());
  // key = "studentId|academicYear|term" for inline edit in registry
  const [registryEditKey, setRegistryEditKey] = useState<string | null>(null);

  // Dynamic initialization of student class dropdown & filter
  useEffect(() => {
    if (classes.length > 0 && !studentGrade) {
      setStudentGrade(classes[0].className);
    }
    if (classes.length > 0 && !selectedClassFilter) {
      setSelectedClassFilter(classes[0].className);
    }
  }, [classes, studentGrade, selectedClassFilter]);

  // Dynamic initialization of exam class selection
  useEffect(() => {
    if (classes.length > 0 && !examClassId) {
      setExamClassId(classes[0].id);
    }
  }, [classes, examClassId]);

  // Pre-fill rowInputs with already-saved grades for selected class, academic year, and term
  useEffect(() => {
    if (!examClassId) return;
    const selectedClassObj = classes.find((c) => c.id === examClassId);
    const selectedClassName = selectedClassObj ? selectedClassObj.className : "";

    // Filter exams for this class, year, term
    const classExams = exams.filter(
      (e) => e.className === selectedClassName &&
        e.academicYear === examAcademicYear &&
        e.term === examTerm
    );

    // Build rowInputs state: { [studentId]: { scores: { [subjectName]: scoreStr }, feedback: string } }
    const newRowInputs: typeof rowInputs = {};

    // Filter students belonging to this class
    const classStudents = students.filter((s) => s.gradeGroup === selectedClassName);
    classStudents.forEach((student) => {
      // Find all exams for this student
      const studentExams = classExams.filter((e) => e.studentId === student.id);
      const scores: { [subj: string]: string } = {};

      // Initialize all subjects with empty string or existing score
      subjects.forEach((sub) => {
        const found = studentExams.find((e) => e.subject === sub.subjectName);
        scores[sub.subjectName] = found ? found.score.toString() : "";
      });

      // Find feedback
      const foundFeedback = studentExams.find((e) => e.feedback && e.feedback.trim() !== "");
      const feedback = foundFeedback ? foundFeedback.feedback : "";

      newRowInputs[student.id] = {
        scores,
        feedback
      };
    });

    setRowInputs(newRowInputs);
  }, [examClassId, examAcademicYear, examTerm, exams, classes, students, subjects]);

  // Class Form
  const [newClassName, setNewClassName] = useState("");
  const [classRoom, setClassRoom] = useState("");
  const [classInstructor, setClassInstructor] = useState("");

  // Fee Form: Assign (Unused variables commented out)
  // const [feeStudentId, setFeeStudentId] = useState("");
  // const [feeName, setFeeName] = useState("");
  // const [feeAmount, setFeeAmount] = useState("");

  // Fee Form: Record Payment
  const [payFeeId, setPayFeeId] = useState("");
  const [payAmount, setPayAmount] = useState("");

  // Fee Form: Apply Deduction
  const [deductFeeId, setDeductFeeId] = useState("");
  const [deductAmount, setDeductAmount] = useState("");

  // Subject Form
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectCode, setNewSubjectCode] = useState("");
  const [newSubjectDescription, setNewSubjectDescription] = useState("");

  const updateRowInput = (studentId: string, subjectName: string, value: string) => {
    setRowInputs((prev) => {
      const studentInput = prev[studentId] || { scores: {}, feedback: "" };
      return {
        ...prev,
        [studentId]: {
          ...studentInput,
          scores: {
            ...studentInput.scores,
            [subjectName]: value
          }
        }
      };
    });
  };

  const updateRowFeedback = (studentId: string, value: string) => {
    setRowInputs((prev) => {
      const studentInput = prev[studentId] || { scores: {}, feedback: "" };
      return {
        ...prev,
        [studentId]: {
          ...studentInput,
          feedback: value
        }
      };
    });
  };

  const getStudentTotalAndGrade = (studentId: string) => {
    const inputState = rowInputs[studentId] || { scores: {}, feedback: "" };
    let total = 0;
    let count = 0;

    subjects.forEach((sub) => {
      const val = inputState.scores[sub.subjectName];
      if (val !== undefined && val.trim() !== "") {
        const score = parseInt(val, 10);
        if (!isNaN(score)) {
          total += score;
          count++;
        }
      }
    });

    const average = count > 0 ? (total / count) : 0;
    const grade = count > 0 ? calculateGrade(average) : "—";

    return { total, average, grade, count };
  };

  // Student Edit States
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editStudentName, setEditStudentName] = useState("");
  const [editStudentEmail, setEditStudentEmail] = useState("");
  const [editStudentGrade, setEditStudentGrade] = useState("");
  const [editStudentAcademicYear, setEditStudentAcademicYear] = useState("");
  const [editStudentPassword, setEditStudentPassword] = useState("");
  const [editStudentConfirmPassword, setEditStudentConfirmPassword] = useState("");

  const startEditStudent = (student: Student) => {
    setEditingStudentId(student.id);
    setEditStudentName(student.name);
    setEditStudentEmail(student.email);
    setEditStudentGrade(student.gradeGroup);
    setEditStudentAcademicYear(student.academicYear || "2025–2026");
    setEditStudentPassword("");
    setEditStudentConfirmPassword("");
  };

  const handleSaveStudentEdit = async (id: string) => {
    if (!editStudentName.trim() || !editStudentEmail.trim() || !editStudentGrade || !editStudentAcademicYear) {
      showToast("Please fill in all student details", "error");
      return;
    }
    if (editStudentPassword && editStudentPassword !== editStudentConfirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    await editStudent(
      id,
      editStudentName.trim(),
      editStudentEmail.trim(),
      editStudentGrade,
      editStudentAcademicYear,
      editStudentPassword || undefined
    );
    showToast("Student details updated successfully", "success");
    setEditingStudentId(null);
  };

  // Exam Edit States (Unused variables/handlers commented out)
  // const [editingExamId, setEditingExamId] = useState<string | null>(null);
  // const [editExamScore, setEditExamScore] = useState("");
  // const [editExamFeedback, setEditExamFeedback] = useState("");

  // const startEditExam = (exam: Exam) => {
  //   setEditingExamId(exam.id);
  //   setEditExamScore(exam.score.toString());
  //   setEditExamFeedback(exam.feedback);
  // };

  // const handleSaveExamEdit = (id: string) => {
  //   const scoreNum = parseInt(editExamScore, 10);
  //   if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
  //     showToast("Score must be between 0 and 100", "error");
  //     return;
  //   }
  //   editExam(id, scoreNum, editExamFeedback.trim());
  //   showToast("Grade record updated successfully", "success");
  //   setEditingExamId(null);
  // };

  // Deletion Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmMessage, setDeleteConfirmMessage] = useState("");
  const [onConfirmDeleteAction, setOnConfirmDeleteAction] = useState<(() => void) | null>(null);

  // const handleDeleteExam = (id: string) => {
  //   setDeleteConfirmMessage("Are you sure you want to delete this examination record?");
  //   setOnConfirmDeleteAction(() => () => {
  //     deleteExam(id);
  //     showToast("Examination deleted successfully", "success");
  //   });
  //   setDeleteModalOpen(true);
  // };

  // Class Edit States
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editClassNameVal, setEditClassNameVal] = useState("");
  const [editClassRoomVal, setEditClassRoomVal] = useState("");
  const [editClassInstructorVal, setEditClassInstructorVal] = useState("");

  const startEditClass = (cls: ClassItem) => {
    setEditingClassId(cls.id);
    setEditClassNameVal(cls.className);
    setEditClassRoomVal(cls.room);
    setEditClassInstructorVal(cls.instructor);
  };

  const handleSaveClassEdit = async (id: string) => {
    if (!editClassNameVal.trim() || !editClassRoomVal.trim() || !editClassInstructorVal.trim()) {
      showToast("Please fill in all class details", "error");
      return;
    }
    const res = await editClass(id, editClassNameVal.trim(), editClassRoomVal.trim(), editClassInstructorVal.trim());
    if (res.success) {
      showToast("Class details updated successfully", "success");
      setEditingClassId(null);
    } else {
      showToast(res.error || "Failed to update class", "error");
    }
  };

  const handleDeleteClass = (id: string, name: string) => {
    setDeleteConfirmMessage(`Deleting class "${name}" (ID: ${id}) will remove it from the curriculum. Recorded grades referencing this curriculum will remain but their class identifier will lock.`);
    setOnConfirmDeleteAction(() => async () => {
      const res = await deleteClass(id);
      if (res.success) {
        showToast(`Class "${name}" deleted`, "success");
      } else {
        showToast(res.error || "Failed to delete class", "error");
      }
    });
    setDeleteModalOpen(true);
  };

  // Fee Edit States
  const [editingFeeId, setEditingFeeId] = useState<string | null>(null);
  const [editFeeNameVal, setEditFeeNameVal] = useState("");
  const [editFeeAmountVal, setEditFeeAmountVal] = useState("");

  const startEditFee = (fee: Fee) => {
    setEditingFeeId(fee.id);
    setEditFeeNameVal(fee.feeName);
    setEditFeeAmountVal(fee.transactionType === "Payment" ? fee.paid.toString() : fee.amount.toString());
  };

  const handleSaveFeeEdit = async (fee: Fee) => {
    const amountNum = parseFloat(editFeeAmountVal);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast("Please enter a valid positive amount", "error");
      return;
    }
    const res = await editFee(fee.id, editFeeNameVal.trim(), amountNum);
    if (res.success) {
      showToast("Transaction updated successfully", "success");
      setEditingFeeId(null);
    } else {
      showToast(res.error || "Failed to update transaction", "error");
    }
  };

  const handleDeleteFee = (id: string, name: string) => {
    setDeleteConfirmMessage(`Deleting fee statement "${name}" (ID: ${id}) will wipe it from the student's ledger history.`);
    setOnConfirmDeleteAction(() => async () => {
      const res = await deleteFee(id);
      if (res.success) {
        showToast("Fee statement deleted", "success");
      } else {
        showToast(res.error || "Failed to delete fee statement", "error");
      }
    });
    setDeleteModalOpen(true);
  };

  // Redirect if unauthorized once state has loaded
  useEffect(() => {
    if (isInitialized && (!currentUser || (currentUser.role !== "super_admin" && currentUser.role !== "admin"))) {
      if (currentUser?.role === "student") {
        router.push("/student");
      } else {
        router.push("/login");
      }
    }
  }, [currentUser, isInitialized, router]);

  // Protect Super Admin User Accounts section
  useEffect(() => {
    if (activeSection === "users" && currentUser?.role !== "super_admin") {
      setActiveSection("overview");
      showToast("User Accounts management is restricted to Super Admin users", "error");
    }
  }, [activeSection, currentUser, showToast]);

  // --- Handlers ---
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setIsSidebarOpen(false);
    try {
      await logout("admin");
      showToast("Successfully logged out", "success");
    } catch (err) {
      console.error("Logout error:", err);
      showToast("Logout failed. Please try again.", "error");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (classes.length === 0) {
      showToast("No classes registered yet. Please create a class first.", "error");
      return;
    }
    if (!studentName.trim() || !studentEmail.trim() || !studentGrade || !studentAcademicYear || !studentPassword) {
      showToast("Please fill all student details including password", "error");
      return;
    }
    if (studentPassword !== studentConfirmPassword) {
      showToast("Student passwords do not match", "error");
      return;
    }
    const res = await addStudent(studentName.trim(), studentEmail.trim(), studentGrade, studentAcademicYear, studentPassword);
    if (res && !res.success) {
      showToast(res.error || "Failed to register student", "error");
      return;
    }
    showToast(`Student "${studentName}" registered successfully!`, "success");
    setSelectedClassFilter(studentGrade);
    setStudentName("");
    setStudentEmail("");
    setStudentPassword("");
    setStudentConfirmPassword("");
  };

  // User Accounts Handlers
  const handleAddUserAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserFullName.trim() || !newUserEmail.trim() || !newUserPassword) {
      showToast("Please fill in all required user account fields", "error");
      return;
    }
    if (newUserPassword !== newUserConfirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    const res = await addUserAccount(
      newUserFullName.trim(),
      newUserEmail.trim(),
      newUserPassword,
      newUserRole,
      newUserStatus
    );

    if (res.success) {
      showToast(`User account for "${newUserFullName}" created successfully!`, "success");
      setNewUserFullName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserConfirmPassword("");
      setNewUserRole("admin");
      setNewUserStatus("active");
    } else {
      showToast(res.error || "Failed to create user account", "error");
    }
  };

  const startEditUserAccount = (user: UserAccount) => {
    setEditingUserId(user.id);
    setEditUserFullName(user.fullName);
    setEditUserEmail(user.email);
    setEditUserPassword("");
    setEditUserConfirmPassword("");
    setEditUserRole(user.role);
    setEditUserStatus(user.status);
  };

  const handleSaveUserAccountEdit = async (id: string) => {
    if (!editUserFullName.trim() || !editUserEmail.trim()) {
      showToast("Full Name and Email Address are required", "error");
      return;
    }
    if (editUserPassword && editUserPassword !== editUserConfirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    const res = await editUserAccount(
      id,
      editUserFullName.trim(),
      editUserEmail.trim(),
      editUserPassword || undefined,
      editUserRole,
      editUserStatus
    );

    if (res.success) {
      showToast("User account updated successfully!", "success");
      setEditingUserId(null);
    } else {
      showToast(res.error || "Failed to update user account", "error");
    }
  };

  const handleDeleteUserAccountModal = (id: string, name: string) => {
    setDeleteConfirmMessage(`Are you sure you want to delete user account "${name}"?`);
    setOnConfirmDeleteAction(() => () => {
      deleteUserAccount(id);
      showToast("User account deleted successfully", "success");
    });
    setDeleteModalOpen(true);
  };

  const handleDeleteStudent = (id: string, name?: string) => {
    setDeleteConfirmMessage(`Are you sure you want to delete student ${name ? `"${name}"` : id}?`);
    setOnConfirmDeleteAction(() => async () => {
      const res = await deleteStudent(id);
      if (res.success) {
        showToast("Student deleted successfully", "success");
      } else {
        showToast(res.error || "Failed to delete student", "error");
      }
    });
    setDeleteModalOpen(true);
  };

  const handleRegisterSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) {
      showToast("Subject Name is required", "error");
      return;
    }
    const res = await addSubject(newSubjectName.trim(), newSubjectCode.trim(), newSubjectDescription.trim());
    if (res.success) {
      showToast(`Subject "${newSubjectName}" registered successfully!`, "success");
      setNewSubjectName("");
      setNewSubjectCode("");
      setNewSubjectDescription("");
    } else {
      showToast(res.error || "Failed to register subject", "error");
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim() || !classRoom.trim() || !classInstructor.trim()) {
      showToast("Please fill all class fields", "error");
      return;
    }
    const res = await addClass(newClassName.trim(), classRoom.trim(), classInstructor.trim());
    if (res.success) {
      showToast(`Class "${newClassName}" registered in ${classRoom}`, "success");
      setNewClassName("");
      setClassRoom("");
      setClassInstructor("");
    } else {
      showToast(res.error || "Failed to create class", "error");
    }
  };

  const handleSelectAllFeeStudents = (classStudents: Student[]) => {
    if (selectedFeeStudents.length === classStudents.length) {
      setSelectedFeeStudents([]);
    } else {
      setSelectedFeeStudents(classStudents.map((s) => s.id));
    }
  };

  const handleToggleFeeStudent = (studentId: string) => {
    setSelectedFeeStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAssignFeeWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeClassId) {
      showToast("Please select a class first", "error");
      return;
    }
    if (!chargeDescription.trim()) {
      showToast("Please enter a charge description", "error");
      return;
    }
    const amountNum = parseFloat(chargeAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast("Please enter a valid positive amount", "error");
      return;
    }
    if (!chargeDate) {
      showToast("Please select a date", "error");
      return;
    }

    const classObj = classes.find((c) => c.id === feeClassId);
    const className = classObj ? classObj.className : "";

    const targetStudents = students.filter((s) => selectedFeeStudents.includes(s.id));

    if (targetStudents.length === 0) {
      showToast("At least one student must be selected.", "error");
      return;
    }

    const targetStudentIds = targetStudents.map((s) => s.id);
    const ref = chargeReference.trim() || "CHG-" + Math.floor(100000 + Math.random() * 900000);
    const res = await addCharge(
      targetStudentIds,
      chargeDescription.trim(),
      amountNum,
      chargeDate,
      ref,
      chargeCreatedBy.trim() || currentUser?.name || "Admin",
      chargeNotes.trim(),
      targetStudents[0]?.academicYear
    );

    if (res.success) {
      showToast(`Charge created successfully for ${targetStudentIds.length} students.`, "success");
      // Reset inputs
      setChargeDescription("");
      setChargeAmount("");
      setChargeReference("");
      setChargeNotes("");
      setSelectedFeeStudents([]);
      setChargeEntireClass(false);
    } else {
      showToast(res.error || "Failed to create charges.", "error");
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentStudentId) {
      showToast("Please select a student", "error");
      return;
    }
    const parsedAmount = parseFloat(paymentAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      showToast("Please enter a valid positive payment", "error");
      return;
    }
    if (!paymentDate) {
      showToast("Please select a date", "error");
      return;
    }

    const studentObj = students.find((s) => s.id === paymentStudentId);
    if (!studentObj) {
      showToast("Selected student not found", "error");
      return;
    }

    // Calculate outstanding balance on client
    const studentTx = fees.filter((t) => t.studentId === studentObj.id);
    const totalCharges = studentTx
      .filter((t) => t.transactionType === "Charge")
      .reduce((sum, t) => sum + (parseFloat(String(t.amount)) || 0), 0);
    const totalPayments = studentTx
      .filter((t) => t.transactionType === "Payment")
      .reduce((sum, t) => sum + (parseFloat(String(t.paid)) || 0), 0);
    const totalDeductions = studentTx
      .filter((t) => t.transactionType === "Waiver" || t.transactionType === "Credit")
      .reduce((sum, t) => sum + (parseFloat(String(t.deductions)) || 0), 0);
    const outstandingBalance = Math.max(0, totalCharges - totalPayments - totalDeductions);

    if (parsedAmount > outstandingBalance) {
      showToast("Payment amount cannot exceed the outstanding balance.", "error");
      return;
    }

    const ref = "PAY-" + Math.floor(100000 + Math.random() * 900000);
    const result = await recordPayment(
      studentObj.id,
      studentObj.name,
      studentObj.gradeGroup,
      parsedAmount,
      paymentDate,
      paymentMethod,
      ref,
      paymentReceivedBy.trim() || currentUser?.name || "Admin",
      paymentNotes.trim(),
      studentObj.academicYear
    );

    if (result.success) {
      showToast("Payment recorded successfully.", "success");
      setPaymentAmount("");
      setPaymentReference("");
      setPaymentNotes("");
      setSelectedPaymentStudent(null);
      setPaymentStudentId("");
      setPaymentSearchQuery("");
    } else {
      showToast(result.error || "Failed to record payment.", "error");
    }
  };

  const handleInlineChargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentDetail) return;
    const amountVal = parseFloat(inlineChargeAmount);
    if (!inlineChargeDescription.trim() || isNaN(amountVal) || amountVal <= 0) {
      showToast("Please enter a valid description and positive amount.", "error");
      return;
    }
    const ref = "CHG-" + Math.floor(100000 + Math.random() * 900000);
    const result = await addCharge(
      [selectedStudentDetail.id],
      inlineChargeDescription.trim(),
      amountVal,
      inlineChargeDate,
      ref,
      currentUser?.name || "Admin",
      inlineChargeNotes.trim(),
      selectedStudentDetail.academicYear
    );
    if (result.success) {
      showToast("Charge created successfully.", "success");
      setInlineChargeDescription("");
      setInlineChargeAmount("");
      setInlineChargeNotes("");
      setShowInlineForm("");
    } else {
      showToast(result.error || "Failed to create charge.", "error");
    }
  };

  const handleInlinePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentDetail) return;
    const amountVal = parseFloat(inlinePaymentAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      showToast("Please enter a valid positive payment amount.", "error");
      return;
    }

    // Client-side validation
    const studentTx = fees.filter((t) => t.studentId === selectedStudentDetail.id);
    const totalCharges = studentTx
      .filter((t) => t.transactionType === "Charge")
      .reduce((sum, t) => sum + (parseFloat(String(t.amount)) || 0), 0);
    const totalPayments = studentTx
      .filter((t) => t.transactionType === "Payment")
      .reduce((sum, t) => sum + (parseFloat(String(t.paid)) || 0), 0);
    const totalDeductions = studentTx
      .filter((t) => t.transactionType === "Waiver" || t.transactionType === "Credit")
      .reduce((sum, t) => sum + (parseFloat(String(t.deductions)) || 0), 0);
    const outstandingBalance = Math.max(0, totalCharges - totalPayments - totalDeductions);

    if (amountVal > outstandingBalance) {
      showToast("Payment amount cannot exceed the outstanding balance.", "error");
      return;
    }

    const ref = "PAY-" + Math.floor(100000 + Math.random() * 900000);
    const result = await recordPayment(
      selectedStudentDetail.id,
      selectedStudentDetail.name,
      selectedStudentDetail.gradeGroup,
      amountVal,
      inlinePaymentDate,
      inlinePaymentMethod,
      ref,
      currentUser?.name || "Admin",
      inlinePaymentNotes.trim(),
      selectedStudentDetail.academicYear
    );
    if (result.success) {
      showToast("Payment recorded successfully.", "success");
      setInlinePaymentAmount("");
      setInlinePaymentNotes("");
      setShowInlineForm("");
    } else {
      showToast(result.error || "Failed to record payment.", "error");
    }
  };

  const handleSaveAllGrades = (
    studentId: string,
    studentName: string,
    studentInput: { scores: { [subjectName: string]: string }; feedback: string }
  ) => {
    const selectedClass = classes.find((c) => c.id === examClassId);
    const className = selectedClass ? selectedClass.className : "";

    if (!examClassId || !className) {
      showToast("Please select a class first", "error");
      return;
    }
    if (!examAcademicYear) {
      showToast("Please select an academic year", "error");
      return;
    }
    if (!examTerm) {
      showToast("Please select a term", "error");
      return;
    }
    if (subjects.length === 0) {
      showToast("No subjects registered. Please add subjects first.", "error");
      return;
    }

    const gradesToSave: { subject: string; score: number; feedback: string }[] = [];
    for (const [subject, scoreStr] of Object.entries(studentInput.scores)) {
      if (!scoreStr || scoreStr.trim() === "") continue;
      const scoreVal = parseInt(scoreStr, 10);
      if (isNaN(scoreVal) || scoreVal < 0 || scoreVal > examMaxPoints) {
        showToast(`Invalid score for "${subject}". Must be between 0 and ${examMaxPoints}.`, "error");
        return;
      }
      gradesToSave.push({ subject, score: scoreVal, feedback: studentInput.feedback.trim() });
    }

    if (gradesToSave.length === 0) {
      showToast("Please enter at least one score before saving.", "error");
      return;
    }

    for (const grade of gradesToSave) {
      gradeStudent(
        studentId,
        className,
        grade.subject,
        examTerm,
        grade.score,
        grade.feedback,
        examAcademicYear,
        examMaxPoints,
        studentName
      );
    }

    const hasPrior = exams.some(
      (e) => e.studentId === studentId && e.className === className && e.academicYear === examAcademicYear && e.term === examTerm
    );
    showToast(
      hasPrior ? `Exam marks updated for ${studentName}.` : `Exam marks saved for ${studentName}.`,
      "success"
    );
  };

  const handleDeleteStudentExams = (studentId: string, studentName: string, studentExams: Exam[]) => {
    setDeleteConfirmMessage(`Are you sure you want to delete ${studentName}'s exam record for ${registryTerm}, ${registryAcademicYear}? This action cannot be undone.`);
    setOnConfirmDeleteAction(() => () => {
      studentExams.forEach((exam) => deleteExam(exam.id));
      if (registryEditingStudentId === studentId) setRegistryEditingStudentId(null);
      showToast("Exam record deleted successfully.", "success");
    });
    setDeleteModalOpen(true);
  };

  const handleRegistrySaveEdit = (studentId: string, studentName: string) => {
    const regClass = classes.find((c) => c.id === registryClassId);
    const regClassName = regClass ? regClass.className : "";

    if (!regClassName || !registryAcademicYear || !registryTerm) {
      showToast("Registry filters incomplete", "error");
      return;
    }

    const gradesToSave: { subject: string; score: number; feedback: string }[] = [];
    for (const [subject, scoreStr] of Object.entries(registryEditRowInputs.scores)) {
      if (!scoreStr || scoreStr.trim() === "") continue;
      const scoreVal = parseInt(scoreStr, 10);
      if (isNaN(scoreVal) || scoreVal < 0 || scoreVal > 100) {
        showToast(`Invalid score for "${subject}". Must be between 0 and 100.`, "error");
        return;
      }
      gradesToSave.push({ subject, score: scoreVal, feedback: registryEditRowInputs.feedback.trim() });
    }

    if (gradesToSave.length === 0) {
      showToast("Please enter at least one score before saving.", "error");
      return;
    }

    for (const grade of gradesToSave) {
      gradeStudent(
        studentId,
        regClassName,
        grade.subject,
        registryTerm,
        grade.score,
        grade.feedback,
        registryAcademicYear,
        100,
        studentName
      );
    }

    showToast("Exam marks updated successfully.", "success");
    setRegistryEditingStudentId(null);
  };

  // Helper selectors
  const getStudentName = (id: string) => {
    const student = students.find((s) => s.id === id);
    return student ? student.name : id;
  };

  // --- Student Table Sorting, Search, & Pagination Logic ---
  const filteredStudents = students.filter((student) => {
    // If a class filter is selected, filter by that class
    if (selectedClassFilter && student.gradeGroup !== selectedClassFilter) return false;

    const q = studentSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      student.id.toLowerCase().includes(q) ||
      student.name.toLowerCase().includes(q) ||
      student.email.toLowerCase().includes(q)
    );
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const field = studentSortField;
    const valA = a[field] ? a[field].toLowerCase() : "";
    const valB = b[field] ? b[field].toLowerCase() : "";

    if (valA < valB) return studentSortDirection === "asc" ? -1 : 1;
    if (valA > valB) return studentSortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const studentsPerPage = 5;
  const totalStudentPages = Math.ceil(sortedStudents.length / studentsPerPage) || 1;
  const startIndex = (studentCurrentPage - 1) * studentsPerPage;
  const paginatedStudents = sortedStudents.slice(startIndex, startIndex + studentsPerPage);

  // Auto-reset page if class selection or search terms change
  useEffect(() => {
    setStudentCurrentPage(1);
  }, [selectedClassFilter, studentSearch]);

  useEffect(() => {
    if (studentCurrentPage > totalStudentPages) {
      setStudentCurrentPage(1);
    }
  }, [totalStudentPages, studentCurrentPage]);

  // Toggle sorting directions helper
  const handleSort = (field: "id" | "name" | "gradeGroup" | "academicYear") => {
    if (studentSortField === field) {
      setStudentSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setStudentSortField(field);
      setStudentSortDirection("asc");
    }
    setStudentCurrentPage(1);
  };

  // --- Finance Filtering, Summaries, and Export Logic ---
  const filteredFeesList = fees.filter((f) => {
    // Search by ID, Name, Reference Number
    const q = financeSearchQuery.toLowerCase().trim();
    if (q) {
      const matchId = f.studentId.toLowerCase().includes(q);
      const sObj = students.find((s) => s.id === f.studentId);
      const matchName = sObj ? sObj.name.toLowerCase().includes(q) : false;
      const matchRef = f.referenceNumber ? f.referenceNumber.toLowerCase().includes(q) : false;
      if (!matchId && !matchName && !matchRef) return false;
    }

    // Filter by Class
    if (financeFilterClass && f.className !== financeFilterClass) return false;

    // Filter by Transaction Type
    if (financeFilterType !== "All" && f.transactionType !== financeFilterType) return false;

    // Filter by Status
    if (financeFilterStatus !== "All" && f.status !== financeFilterStatus) return false;

    // Filter by Date Range
    if (financeStartDate) {
      const fDate = new Date(f.date || "").getTime();
      const sDate = new Date(financeStartDate).getTime();
      if (fDate < sDate) return false;
    }
    if (financeEndDate) {
      const fDate = new Date(f.date || "").getTime();
      const eDate = new Date(financeEndDate + "T23:59:59").getTime();
      if (fDate > eDate) return false;
    }

    return true;
  });

  const feeSummaryTotal = filteredFeesList
    .filter((f) => f.transactionType === "Charge")
    .reduce((sum, f) => sum + (parseFloat(String(f.amount)) || 0), 0);

  const feeSummaryCollected = filteredFeesList
    .filter((f) => f.transactionType === "Payment")
    .reduce((sum, f) => sum + (parseFloat(String(f.paid)) || 0), 0);

  const feeSummaryOutstanding = Math.max(0, feeSummaryTotal - feeSummaryCollected);

  // Sorting
  const sortedFinanceList = [...filteredFeesList].sort((a, b) => {
    const field = financeSortField;
    const dir = financeSortDirection === "asc" ? 1 : -1;

    let valA = (a as any)[field] || "";
    let valB = (b as any)[field] || "";

    if (field === "date") {
      valA = a.date ? new Date(a.date).getTime() : 0;
      valB = b.date ? new Date(b.date).getTime() : 0;
    } else if (typeof valA === "string") {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }

    if (valA < valB) return -1 * dir;
    if (valA > valB) return 1 * dir;
    return 0;
  });

  // Pagination
  const totalFinancePages = Math.ceil(sortedFinanceList.length / financePageSize) || 1;
  const financeStartIndex = (financeCurrentPage - 1) * financePageSize;
  const paginatedFinanceList = sortedFinanceList.slice(
    financeStartIndex,
    financeStartIndex + financePageSize
  );

  // Reset page if needed
  useEffect(() => {
    if (financeCurrentPage > totalFinancePages) {
      setFinanceCurrentPage(1);
    }
  }, [financeSearchQuery, financeFilterClass, financeFilterType, financeFilterStatus, financeStartDate, financeEndDate, totalFinancePages, financeCurrentPage]);

  const handleExportCSV = () => {
    let csvContent = "Date,Reference Number,Student ID,Student Name,Class,Transaction Type,Description,Charge Amount,Payment Amount,Status,Payment Method,Created/Received By\n";
    filteredFeesList.forEach((f) => {
      const dateStr = new Date(f.date || "").toLocaleDateString();
      const chargeAmt = f.transactionType === "Charge" ? formatCurrency(f.amount) : "—";
      const paymentAmt = f.transactionType === "Payment" ? formatCurrency(f.paid) : "—";
      csvContent += `"${dateStr}","${f.referenceNumber || ""}","${stripLeadingZeros(f.studentId)}","${f.studentName || getStudentName(f.studentId)}","${f.className || "Unassigned"}","${f.transactionType}","${f.feeName}","${chargeAmt}","${paymentAmt}","${f.status}","${f.paymentMethod || "—"}","${f.createdBy || ""}"\n`;
    });
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Finance_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    showToast("CSV report exported successfully", "success");
  };

  const handleExportExcel = () => {
    let excelContent = "Date\tReference Number\tStudent ID\tStudent Name\tClass\tTransaction Type\tDescription\tCharge Amount\tPayment Amount\tStatus\tPayment Method\tCreated/Received By\n";
    filteredFeesList.forEach((f) => {
      const dateStr = new Date(f.date || "").toLocaleDateString();
      const chargeAmt = f.transactionType === "Charge" ? formatCurrency(f.amount) : "—";
      const paymentAmt = f.transactionType === "Payment" ? formatCurrency(f.paid) : "—";
      excelContent += `${dateStr}\t${f.referenceNumber || ""}\t${stripLeadingZeros(f.studentId)}\t${f.studentName || getStudentName(f.studentId)}\t${f.className || "Unassigned"}\t${f.transactionType}\t${f.feeName}\t${chargeAmt}\t${paymentAmt}\t${f.status}\t${f.paymentMethod || "—"}\t${f.createdBy || ""}\n`;
    });
    const blob = new Blob([excelContent], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Finance_Report_${new Date().toISOString().split('T')[0]}.xls`);
    link.click();
    showToast("Excel spreadsheet exported successfully", "success");
  };

  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showToast("Please allow popups to open PDF generation", "error");
      return;
    }

    let tableRows = "";
    filteredFeesList.forEach((f) => {
      const dateStr = new Date(f.date || "").toLocaleDateString();
      const chargeAmt = f.transactionType === "Charge" ? formatCurrency(f.amount) : "—";
      const paymentAmt = f.transactionType === "Payment" ? formatCurrency(f.paid) : "—";
      tableRows += `
        <tr style="border-bottom: 1px solid #334155; font-size: 11px;">
          <td style="padding: 8px 10px; color: #94a3b8;">${dateStr}</td>
          <td style="padding: 8px 10px; font-family: monospace; color: #cbd5e1;">${f.referenceNumber || ""}</td>
          <td style="padding: 8px 10px; font-family: monospace; color: #38bdf8;">${stripLeadingZeros(f.studentId)}</td>
          <td style="padding: 8px 10px; font-weight: bold; color: #f1f5f9;">${f.studentName || getStudentName(f.studentId)}</td>
          <td style="padding: 8px 10px; color: #cbd5e1;">${f.className || "Unassigned"}</td>
          <td style="padding: 8px 10px; font-weight: bold; color: ${f.transactionType === 'Charge' ? '#fbbf24' : '#34d399'};">${f.transactionType}</td>
          <td style="padding: 8px 10px; color: #cbd5e1;">${f.feeName}</td>
          <td style="padding: 8px 10px; color: #cbd5e1;">${chargeAmt}</td>
          <td style="padding: 8px 10px; color: #cbd5e1;">${paymentAmt}</td>
          <td style="padding: 8px 10px;">
            <span style="padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; background: ${f.status === 'Paid' ? '#064e3b' : '#78350f'}; color: ${f.status === 'Paid' ? '#34d399' : '#fbbf24'}; border: 1px solid ${f.status === 'Paid' ? '#047857' : '#b45309'};">
              ${f.status}
            </span>
          </td>
        </tr>
      `;
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Finance Transactions Report</title>
          <style>
            body { font-family: sans-serif; color: #f1f5f9; background-color: #020617; padding: 40px; }
            h1 { text-align: center; color: #38bdf8; margin-bottom: 5px; }
            h3 { text-align: center; color: #94a3b8; font-weight: normal; margin-top: 0; margin-bottom: 30px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; border: 1px solid #1e293b; }
            th { background: #0f172a; text-align: left; padding: 12px 10px; font-size: 10px; text-transform: uppercase; color: #94a3b8; border-bottom: 2px solid #1e293b; }
            .summary-container { display: flex; justify-content: space-around; margin-bottom: 30px; background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 15px; }
            .summary-card { text-align: center; }
            .summary-title { font-size: 10px; text-transform: uppercase; color: #94a3b8; margin-bottom: 5px; }
            .summary-val { font-size: 18px; font-weight: bold; font-family: monospace; }
          </style>
        </head>
        <body>
          <h1>Madarasa Educational Portal</h1>
          <h3>Financial Transactions Report - Generated on ${new Date().toLocaleDateString()}</h3>
          
          <div class="summary-container">
            <div class="summary-card">
              <div class="summary-title">Total Charges</div>
              <div class="summary-val" style="color: #cbd5e1;">${formatCurrency(feeSummaryTotal)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-title">Total Payments</div>
              <div class="summary-val" style="color: #34d399;">${formatCurrency(feeSummaryCollected)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-title">Outstanding Balance</div>
              <div class="summary-val" style="color: #f87171;">${formatCurrency(feeSummaryOutstanding)}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Reference</th>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Class</th>
                <th>Type</th>
                <th>Description</th>
                <th>Charge</th>
                <th>Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    showToast("PDF report generated successfully", "success");
  };

  // Stats for overview dashboard page
  const totalStudents = students.length;
  const totalClasses = classes.length;
  const totalAssignedFees = fees
    .filter((f) => f.transactionType === "Charge")
    .reduce((sum, f) => sum + (parseFloat(String(f.amount)) || 0), 0);
  const totalPaidFees = fees
    .filter((f) => f.transactionType === "Payment")
    .reduce((sum, f) => sum + (parseFloat(String(f.paid)) || 0), 0);
  const totalDeductions = fees
    .filter((f) => f.transactionType === "Waiver" || f.transactionType === "Credit")
    .reduce((sum, f) => sum + (parseFloat(String(f.deductions)) || 0), 0);
  const totalOutstanding = Math.max(0, totalAssignedFees - totalPaidFees);

  // If loading or unauthorized, show loading state
  if (!isInitialized || !currentUser || (currentUser.role !== "super_admin" && currentUser.role !== "admin")) {
    return <MadrasaLoader message="Verifying administration access..." />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row admin-portal lg:h-screen lg:overflow-hidden">

      {/* Sidebar navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 p-5 flex flex-col gap-5 overflow-y-auto max-h-screen transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-950 border border-emerald-500/20 rounded-lg text-emerald-400">
              <MadrasaLogoIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-slate-200 text-xs md:text-sm">{t("academy_name")}</span>
              <span className="text-[9px] block text-emerald-500 uppercase tracking-widest font-extrabold">{t("admin_hub")}</span>
            </div>
          </div>
          <button
            type="button"
            className="lg:hidden text-slate-400 hover:text-slate-200"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu items */}
        <nav className="flex flex-col gap-1.5 flex-1">
          <button
            type="button"
            onClick={() => {
              setActiveSection("overview");
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeSection === "overview"
                ? "bg-slate-950 border border-emerald-500/20 text-emerald-400 shadow-md"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-950/40"
              }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            {t("overview")}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSection("students");
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeSection === "students"
                ? "bg-slate-950 border border-emerald-500/20 text-emerald-400 shadow-md"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-950/40"
              }`}
          >
            <Users className="w-4 h-4" />
            {t("students_mgmt")}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSection("classes");
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeSection === "classes"
                ? "bg-slate-950 border border-emerald-500/20 text-emerald-400 shadow-md"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-950/40"
              }`}
          >
            <BookOpen className="w-4 h-4" />
            {t("classes_mgmt")}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSection("fees");
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeSection === "fees"
                ? "bg-slate-950 border border-emerald-500/20 text-emerald-400 shadow-md"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-950/40"
              }`}
          >
            <DollarSign className="w-4 h-4" />
            {t("fees_mgmt")}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSection("exams");
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeSection === "exams"
                ? "bg-slate-950 border border-emerald-500/20 text-emerald-400 shadow-md"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-950/40"
              }`}
          >
            <Award className="w-4 h-4" />
            {t("exams_mgmt")}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSection("subjects");
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeSection === "subjects"
                ? "bg-slate-950 border border-emerald-500/20 text-emerald-400 shadow-md"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-950/40"
              }`}
          >
            <GraduationCap className="w-4 h-4" />
            Subjects
          </button>

          {/* User Accounts Section (Super Admin Only) */}
          {currentUser?.role === "super_admin" && (
            <button
              type="button"
              onClick={() => {
                setActiveSection("users");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeSection === "users"
                  ? "bg-slate-950 border border-purple-500/30 text-purple-400 shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-950/40"
                }`}
            >
              <div className="flex items-center gap-3">
                <UserCheck className="w-4 h-4" />
                <span>User Accounts</span>
              </div>
              <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Super Admin
              </span>
            </button>
          )}
        </nav>

        {/* Language and Theme Switcher in Sidebar */}
        <div className="border-t border-slate-800 pt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Settings</span>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 bg-slate-950 border border-slate-800 hover:border-emerald-500/30 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors shadow-sm"
              title="Toggle Light/Dark Theme"
            >
              {theme === "dark" ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 hover:border-emerald-500/30 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none cursor-pointer font-semibold transition-all shadow-sm"
          >
            <option value="en">English</option>
            <option value="ar">العربية (Arabic)</option>
            <option value="so">Somali</option>
          </select>
        </div>

        {/* Footer Logout Button */}
        <div className="border-t border-slate-800 pt-4 pb-2">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 hover:text-rose-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
          </button>
        </div>
      </aside>

      {/* Main content pane */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950 lg:h-screen lg:overflow-hidden lg:ml-64">

        {/* Mobile Header Bar */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <MadrasaLogoIcon className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm tracking-tight">{t("academy_name")}</span>
          </div>
          <button
            type="button"
            className="p-2 text-slate-400 hover:text-slate-200 rounded-lg bg-slate-950/50 border border-slate-800"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Dynamic section containers */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">

          <AnimatePresence mode="wait">

            {/* OVERVIEW SECTION */}
            {activeSection === "overview" && (
              <motion.div
                key="overview-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-8"
              >
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
                    {t("welcome_admin")}
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">{t("health_check")}</p>
                </div>

                {/* Dashboard Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden">
                    <Users className="w-10 h-10 text-emerald-500/20 absolute right-4 top-4" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{t("enrolled_students")}</span>
                    <span className="block text-3xl font-bold font-mono text-slate-100 mt-2">{formatDisplayNumber(totalStudents)}</span>
                    <span className="text-[10px] text-slate-500 block mt-1">{t("active_enrollments")}</span>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden">
                    <BookOpen className="w-10 h-10 text-emerald-500/20 absolute right-4 top-4" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{t("classes_mgmt")}</span>
                    <span className="block text-3xl font-bold font-mono text-slate-100 mt-2">{formatDisplayNumber(totalClasses)}</span>
                    <span className="text-[10px] text-slate-500 block mt-1">{t("curriculum_registered")}</span>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden">
                    <DollarSign className="w-10 h-10 text-emerald-500/20 absolute right-4 top-4" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{t("fees_collected")}</span>
                    <span className="block text-3xl font-bold font-mono text-emerald-400 mt-2">{formatCurrency(totalPaidFees)}</span>
                    <span className="text-[10px] text-slate-500 block mt-1">{t("assigned")}: {formatCurrency(totalAssignedFees)}</span>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden">
                    <Coins className="w-10 h-10 text-emerald-500/20 absolute right-4 top-4" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{t("outstanding_fees")}</span>
                    <span className="block text-3xl font-bold font-mono text-rose-400 mt-2">{formatCurrency(totalOutstanding)}</span>
                    <span className="text-[10px] text-slate-500 block mt-1">{t("credits_applied")}: {formatCurrency(totalDeductions)}</span>
                  </div>
                </div>

                {/* Operations Guides */}
                <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
                  <h3 className="font-bold text-base text-slate-200">{t("admin_guidelines")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                      <span className="text-xs font-bold text-emerald-400 block mb-1">1. {t("students_mgmt")}</span>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {t("guideline_student")}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                      <span className="text-xs font-bold text-emerald-400 block mb-1">2. {t("fees_mgmt")}</span>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {t("guideline_fees")}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                      <span className="text-xs font-bold text-emerald-400 block mb-1">3. {t("grading_terminal")}</span>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {t("guideline_grader")}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STUDENTS SECTION */}
            {activeSection === "students" && (
              <motion.div
                key="students-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
              >
                {/* Form column */}
                <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col gap-5">
                  <div>
                    <h3 className="font-bold text-base text-slate-200">Register New Student</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Fills basic record and auto-allocates system ID.</p>
                  </div>

                  <form onSubmit={handleAddStudent} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. David Miller"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2.5 px-4 text-sm text-slate-100 focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Email Address</label>
                      <input
                        type="email"
                        placeholder="e.g. david@school.edu"
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2.5 px-4 text-sm text-slate-100 focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Class</label>
                      {classes.length === 0 ? (
                        <div className="text-xs text-amber-400 font-semibold bg-amber-950/20 border border-amber-900/30 p-3.5 rounded-xl">
                          No classes registered yet. Please create a class first.
                        </div>
                      ) : (
                        <select
                          value={studentGrade}
                          onChange={(e) => setStudentGrade(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2.5 px-4 text-sm text-slate-100 focus:outline-none transition-colors"
                        >
                          {classes.map((cls) => (
                            <option key={cls.id} value={cls.className}>
                              {cls.className}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Academic Year</label>
                      <select
                        value={studentAcademicYear}
                        onChange={(e) => setStudentAcademicYear(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2.5 px-4 text-sm text-slate-100 focus:outline-none transition-colors"
                        required
                      >
                        <option value="2025–2026">2025–2026</option>
                        <option value="2026–2027">2026–2027</option>
                        <option value="2027–2028">2027–2028</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Login Password</label>
                      <div className="relative flex items-center">
                        <input
                          type={showStudentPasswordInput ? "text" : "password"}
                          placeholder="••••••••"
                          value={studentPassword}
                          onChange={(e) => setStudentPassword(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2.5 pl-4 pr-10 text-sm text-slate-100 focus:outline-none transition-colors"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowStudentPasswordInput(!showStudentPasswordInput)}
                          className="absolute right-3 text-slate-500 hover:text-slate-300"
                        >
                          {showStudentPasswordInput ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Confirm Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={studentConfirmPassword}
                        onChange={(e) => setStudentConfirmPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2.5 px-4 text-sm text-slate-100 focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={classes.length === 0}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-slate-950 font-bold rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Student
                    </button>
                  </form>
                </div>

                {/* Table column */}
                <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-slate-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-base text-slate-200">Enrolled Student Registry</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {selectedClassFilter
                          ? `Class: ${selectedClassFilter} (${formatDisplayNumber(sortedStudents.length)} student${sortedStudents.length === 1 ? "" : "s"})`
                          : "Select a class to view enrolled students"}
                      </p>
                    </div>

                    {/* Class Filter & Search Inputs */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide whitespace-nowrap">Class:</label>
                        <select
                          value={selectedClassFilter}
                          onChange={(e) => setSelectedClassFilter(e.target.value)}
                          className="bg-slate-950 border border-emerald-500/40 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs font-bold text-emerald-400 focus:outline-none cursor-pointer transition-all shadow-sm"
                        >
                          <option value="">Select a Class</option>
                          {classes.map((cls) => (
                            <option key={cls.id} value={cls.className}>
                              {cls.className} ({cls.room})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Search Input */}
                      <div className="relative max-w-xs w-full">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-550">
                          <Users className="w-4 h-4 text-slate-500" />
                        </span>
                        <input
                          type="text"
                          placeholder={selectedClassFilter ? `Search in ${selectedClassFilter}...` : "Select a class first..."}
                          value={studentSearch}
                          disabled={!selectedClassFilter}
                          onChange={(e) => {
                            setStudentSearch(e.target.value);
                            setStudentCurrentPage(1);
                          }}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-colors disabled:opacity-40"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-950 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                        <tr>
                          <th className="py-4 px-6 cursor-pointer hover:text-emerald-400 select-none transition-colors" onClick={() => handleSort("id")}>
                            <div className="flex items-center gap-1.5">
                              Student ID
                              <span className="text-[10px] text-slate-600">
                                {studentSortField === "id" ? (studentSortDirection === "asc" ? "▲" : "▼") : "↕"}
                              </span>
                            </div>
                          </th>
                          <th className="py-4 px-6 cursor-pointer hover:text-emerald-400 select-none transition-colors" onClick={() => handleSort("name")}>
                            <div className="flex items-center gap-1.5">
                              Full Name
                              <span className="text-[10px] text-slate-600">
                                {studentSortField === "name" ? (studentSortDirection === "asc" ? "▲" : "▼") : "↕"}
                              </span>
                            </div>
                          </th>
                          <th className="py-4 px-6">Email</th>
                          <th className="py-4 px-6 cursor-pointer hover:text-emerald-400 select-none transition-colors" onClick={() => handleSort("gradeGroup")}>
                            <div className="flex items-center gap-1.5">
                              Class
                              <span className="text-[10px] text-slate-600">
                                {studentSortField === "gradeGroup" ? (studentSortDirection === "asc" ? "▲" : "▼") : "↕"}
                              </span>
                            </div>
                          </th>
                          <th className="py-4 px-6 cursor-pointer hover:text-emerald-400 select-none transition-colors" onClick={() => handleSort("academicYear")}>
                            <div className="flex items-center gap-1.5">
                              Academic Year
                              <span className="text-[10px] text-slate-600">
                                {studentSortField === "academicYear" ? (studentSortDirection === "asc" ? "▲" : "▼") : "↕"}
                              </span>
                            </div>
                          </th>
                          <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50 font-medium">
                        {paginatedStudents.map((student) => {
                          const isEditing = editingStudentId === student.id;
                          return isEditing ? (
                            <tr key={student.id} className="bg-slate-900/90 border-b border-emerald-500/20">
                              <td colSpan={6} className="p-4 bg-slate-900/90 border-b border-emerald-500/30">
                                <div className="flex flex-col gap-4">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-xs text-emerald-400 uppercase tracking-wide flex items-center gap-2">
                                      <span>Editing Student:</span>
                                      <span className="font-mono text-slate-100">{student.id}</span>
                                    </span>
                                    <span className="text-[11px] text-slate-400">Leave password fields empty to keep existing password</span>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    <div>
                                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Full Name</label>
                                      <input
                                        type="text"
                                        value={editStudentName}
                                        onChange={(e) => setEditStudentName(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded py-1.5 px-2.5 text-xs text-slate-100 focus:outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Email Address</label>
                                      <input
                                        type="email"
                                        value={editStudentEmail}
                                        onChange={(e) => setEditStudentEmail(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded py-1.5 px-2.5 text-xs text-slate-100 focus:outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Class</label>
                                      <select
                                        value={editStudentGrade}
                                        onChange={(e) => setEditStudentGrade(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/55 rounded py-1.5 px-2.5 text-xs text-slate-100 focus:outline-none"
                                      >
                                        {classes.map((cls) => (
                                          <option key={cls.id} value={cls.className}>
                                            {cls.className}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div>
                                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Academic Year</label>
                                      <select
                                        value={editStudentAcademicYear}
                                        onChange={(e) => setEditStudentAcademicYear(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/55 rounded py-1.5 px-2.5 text-xs text-slate-100 focus:outline-none"
                                      >
                                        <option value="2025–2026">2025–2026</option>
                                        <option value="2026–2027">2026–2027</option>
                                        <option value="2027–2028">2027–2028</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">New Password (Optional)</label>
                                      <input
                                        type="password"
                                        placeholder="Leave blank to keep unchanged"
                                        value={editStudentPassword}
                                        onChange={(e) => setEditStudentPassword(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded py-1.5 px-2.5 text-xs text-slate-100 focus:outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Confirm New Password</label>
                                      <input
                                        type="password"
                                        placeholder="Re-enter new password"
                                        value={editStudentConfirmPassword}
                                        onChange={(e) => setEditStudentConfirmPassword(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded py-1.5 px-2.5 text-xs text-slate-100 focus:outline-none"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex justify-end gap-2 mt-1">
                                    <button
                                      type="button"
                                      onClick={() => handleSaveStudentEdit(student.id)}
                                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded text-xs transition-colors"
                                    >
                                      Save Student Changes
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingStudentId(null)}
                                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded text-xs transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            <tr key={student.id} className="hover:bg-slate-850/30 transition-colors">
                              <td className="py-4 px-6 font-mono text-emerald-400">{stripLeadingZeros(student.id)}</td>
                              <td className="py-4 px-6 text-slate-100 font-bold">{student.name}</td>
                              <td className="py-4 px-6 text-slate-400">{student.email}</td>
                              <td className="py-4 px-6">
                                <span className="px-2.5 py-0.5 bg-slate-950 border border-slate-800 text-[11px] rounded text-slate-350">
                                  {student.gradeGroup}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-slate-400 font-mono text-xs">
                                {student.academicYear || "2025–2026"}
                              </td>
                              <td className="py-4 px-6 text-right whitespace-nowrap">
                                <div className="flex justify-end items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedStudentDetail(student)}
                                    className="px-2.5 py-1 bg-emerald-950/40 border border-emerald-800/40 hover:border-emerald-500/30 text-emerald-400 text-xs font-bold rounded transition-colors"
                                  >
                                    View Details
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => startEditStudent(student)}
                                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold rounded transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteStudent(student.id, student.name)}
                                    className="px-2.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 hover:border-rose-500/30 text-rose-400 text-xs font-bold rounded transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {paginatedStudents.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-8 px-6 text-center text-slate-500 font-medium">
                              {!selectedClassFilter ? (
                                <span className="text-amber-500/80">Please select a class from the dropdown above to view enrolled students.</span>
                              ) : (
                                <span>No students found in this class.</span>
                              )}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards View */}
                  <div className="block md:hidden p-4 flex flex-col gap-4">
                    {paginatedStudents.map((student) => {
                      const isEditing = editingStudentId === student.id;
                      return (
                        <div key={student.id} className="bg-slate-950 border border-slate-850 p-5 rounded-2xl flex flex-col gap-4">
                          {isEditing ? (
                            <div className="flex flex-col gap-3">
                              <span className="text-[10px] text-emerald-400 font-mono font-bold">{stripLeadingZeros(student.id)}</span>
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] uppercase font-bold text-slate-500">Full Name</label>
                                <input
                                  type="text"
                                  value={editStudentName}
                                  onChange={(e) => setEditStudentName(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] uppercase font-bold text-slate-500">Email</label>
                                <input
                                  type="email"
                                  value={editStudentEmail}
                                  onChange={(e) => setEditStudentEmail(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] uppercase font-bold text-slate-500">Class</label>
                                  <select
                                    value={editStudentGrade}
                                    onChange={(e) => setEditStudentGrade(e.target.value)}
                                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-100"
                                  >
                                    {classes.map((cls) => (
                                      <option key={cls.id} value={cls.className}>
                                        {cls.className}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] uppercase font-bold text-slate-500">Year</label>
                                  <select
                                    value={editStudentAcademicYear}
                                    onChange={(e) => setEditStudentAcademicYear(e.target.value)}
                                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-100"
                                  >
                                    <option value="2025–2026">2025–2026</option>
                                    <option value="2026–2027">2026–2027</option>
                                    <option value="2027–2028">2027–2028</option>
                                  </select>
                                </div>
                              </div>
                              <div className="flex gap-2 justify-end mt-2">
                                <button
                                  type="button"
                                  onClick={() => handleSaveStudentEdit(student.id)}
                                  className="px-3.5 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingStudentId(null)}
                                  className="px-3.5 py-1.5 bg-slate-800 text-slate-300 font-bold rounded-lg text-xs"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-3">
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex flex-col">
                                  <h4 className="font-extrabold text-slate-100 text-sm">{student.name}</h4>
                                  <span className="text-[10px] text-emerald-400 font-mono mt-0.5">{student.id}</span>
                                </div>
                                <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[10px] rounded-md text-slate-300 font-semibold">
                                  {student.gradeGroup}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-y-1.5 text-[11px] text-slate-400 border-t border-slate-900 pt-2.5">
                                <div>
                                  <span className="text-[9px] uppercase font-bold text-slate-600 block">Email:</span>
                                  <span className="truncate max-w-[120px] block">{student.email}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] uppercase font-bold text-slate-600 block">Academic Year:</span>
                                  <span>{student.academicYear || "2025–2026"}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 border-t border-slate-900 pt-3 mt-1 justify-end">
                                <button
                                  type="button"
                                  onClick={() => setSelectedStudentDetail(student)}
                                  className="px-2.5 py-1 bg-emerald-950/40 border border-emerald-800/40 hover:border-emerald-500/30 text-emerald-400 text-xs font-bold rounded transition-colors"
                                >
                                  View Details
                                </button>
                                <button
                                  type="button"
                                  onClick={() => startEditStudent(student)}
                                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold rounded transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteStudent(student.id, student.name)}
                                  className="px-2.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 hover:border-rose-500/30 text-rose-400 text-xs font-bold rounded transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {paginatedStudents.length === 0 && (
                      <div className="py-8 text-center text-slate-500 text-xs font-medium">
                        {!selectedClassFilter ? (
                          <span className="text-amber-500/80">Please select a class from the dropdown above to view enrolled students.</span>
                        ) : (
                          <span>No students found in this class.</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Pagination Footer */}
                  <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between flex-wrap gap-3">
                    <span className="text-xs text-slate-500">
                      Page <span className="text-slate-300 font-bold">{studentCurrentPage}</span> of <span className="text-slate-300 font-bold">{totalStudentPages}</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={studentCurrentPage === 1}
                        onClick={() => setStudentCurrentPage((p) => Math.max(p - 1, 1))}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>

                      {Array.from({ length: totalStudentPages }, (_, idx) => idx + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setStudentCurrentPage(pageNum)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${studentCurrentPage === pageNum
                              ? "bg-emerald-500 text-slate-950"
                              : "bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-355 hover:text-slate-100"
                            }`}
                        >
                          {pageNum}
                        </button>
                      ))}

                      <button
                        type="button"
                        disabled={studentCurrentPage === totalStudentPages}
                        onClick={() => setStudentCurrentPage((p) => Math.min(p + 1, totalStudentPages))}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === "classes" && (
              <motion.div
                key="classes-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
              >
                {/* Form column */}
                <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col gap-5">
                  <div>
                    <h3 className="font-bold text-base text-slate-200">Register Class Room</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Add new academic courses to the curriculum.</p>
                  </div>

                  <form onSubmit={handleCreateClass} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Class Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Biology AP"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2.5 px-4 text-sm text-slate-100 focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Room Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Lab 204 or Room 102"
                        value={classRoom}
                        onChange={(e) => setClassRoom(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2.5 px-4 text-sm text-slate-100 focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Instructor Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Prof. Alan Turing"
                        value={classInstructor}
                        onChange={(e) => setClassInstructor(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2.5 px-4 text-sm text-slate-100 focus:outline-none transition-colors"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create Class
                    </button>
                  </form>
                </div>

                {/* Table column */}
                <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-slate-800/80">
                    <h3 className="font-bold text-base text-slate-200">Registered Classes Registry</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Curriculum list: {classes.length} classes</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-950 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                        <tr>
                          <th className="py-4 px-6">Class ID</th>
                          <th className="py-4 px-6">Class Name</th>
                          <th className="py-4 px-6">Room</th>
                          <th className="py-4 px-6">Instructor</th>
                          <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50 font-medium">
                        {classes.map((cls) => {
                          const isEditing = editingClassId === cls.id;
                          return isEditing ? (
                            <tr key={cls.id} className="bg-slate-900 border-b border-emerald-500/20">
                              <td className="py-4 px-6 font-mono text-emerald-400">
                                {cls.id.startsWith("cls-") ? cls.id.substring(0, 8) : cls.id}
                              </td>
                              <td className="py-4 px-6">
                                <input
                                  type="text"
                                  value={editClassNameVal}
                                  onChange={(e) => setEditClassNameVal(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded py-1 px-2 text-xs text-slate-100 focus:outline-none"
                                />
                              </td>
                              <td className="py-4 px-6">
                                <input
                                  type="text"
                                  value={editClassRoomVal}
                                  onChange={(e) => setEditClassRoomVal(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded py-1 px-2 text-xs text-slate-100 focus:outline-none"
                                />
                              </td>
                              <td className="py-4 px-6">
                                <input
                                  type="text"
                                  value={editClassInstructorVal}
                                  onChange={(e) => setEditClassInstructorVal(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded py-1 px-2 text-xs text-slate-100 focus:outline-none"
                                />
                              </td>
                              <td className="py-4 px-6 text-right whitespace-nowrap">
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleSaveClassEdit(cls.id)}
                                    className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded"
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingClassId(null)}
                                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            <tr key={cls.id} className="hover:bg-slate-850/30 transition-colors">
                              <td className="py-4 px-6 font-mono text-emerald-400">
                                {cls.id.startsWith("cls-") ? cls.id.substring(0, 8) : cls.id}
                              </td>
                              <td className="py-4 px-6 text-slate-100">{cls.className}</td>
                              <td className="py-4 px-6 text-slate-400">{cls.room}</td>
                              <td className="py-4 px-6 text-slate-350">{cls.instructor}</td>
                              <td className="py-4 px-6 text-right whitespace-nowrap">
                                <div className="flex justify-end items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => startEditClass(cls)}
                                    className="px-2 py-1 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-650 text-slate-300 text-xs font-bold rounded transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteClass(cls.id, cls.className)}
                                    className="p-1.5 hover:bg-rose-950/30 text-slate-500 hover:text-rose-400 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
                                    title="Delete class"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {classes.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 px-6 text-center text-slate-500">
                              No classes created yet. Setup a class to assign grades.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* FEES/FINANCE MANAGEMENT SECTION */}
            {activeSection === "fees" && (
              <motion.div
                key="fees-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-8"
              >
                {/* Workflow grid for Charges and Payments */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                  {/* Left Column: Create Charge */}
                  <div className="lg:col-span-6 flex flex-col gap-6">
                    <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col gap-4 shadow-lg">
                      <div>
                        <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                          <Coins className="w-4 h-4 text-amber-500" />
                          Add Fee Charge
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Create a charge transaction for students (increases balance owed).</p>
                      </div>

                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Select Class</label>
                          <select
                            value={feeClassId}
                            onChange={(e) => {
                              setFeeClassId(e.target.value);
                              setSelectedFeeStudents([]);
                              setChargeStudentId("");
                            }}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none cursor-pointer font-bold"
                          >
                            <option value="">Select Class</option>
                            {classes.map((cls) => (
                              <option key={cls.id} value={cls.id}>
                                {cls.className} ({cls.room})
                              </option>
                            ))}
                          </select>
                        </div>

                        {feeClassId && (() => {
                          const clsObj = classes.find(c => c.id === feeClassId);
                          const className = clsObj ? clsObj.className : "";
                          const classStudents = students.filter(s => s.gradeGroup === className);

                          if (classStudents.length === 0) {
                            return (
                              <div className="bg-slate-950/60 border border-slate-855 text-rose-400 p-4 text-xs rounded-xl italic text-center">
                                No students found in this class.
                              </div>
                            );
                          }

                          const isAllSelected = classStudents.length > 0 && selectedFeeStudents.length === classStudents.length;

                          return (
                            <div className="flex flex-col gap-3">
                              <div className="flex items-center justify-between mt-2">
                                <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-slate-350">
                                  <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedFeeStudents(classStudents.map(s => s.id));
                                      } else {
                                        setSelectedFeeStudents([]);
                                      }
                                    }}
                                    className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                                  />
                                  <span className="font-bold text-slate-200">Select All Students</span>
                                </label>
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/30">
                                  {selectedFeeStudents.length} students selected
                                </span>
                              </div>

                              <div className="bg-slate-950 border border-slate-850 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                                <table className="w-full text-left text-xs">
                                  <thead className="bg-slate-900 border-b border-slate-800/80 text-slate-400 font-bold uppercase tracking-wider sticky top-0 z-10">
                                    <tr>
                                      <th className="py-2.5 px-4 w-12 text-center">Select</th>
                                      <th className="py-2.5 px-4">Student ID</th>
                                      <th className="py-2.5 px-4">Name</th>
                                      <th className="py-2.5 px-4">Class</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-850/50 font-medium">
                                    {classStudents.map((s) => {
                                      const isChecked = selectedFeeStudents.includes(s.id);
                                      return (
                                        <tr
                                          key={s.id}
                                          className={`hover:bg-slate-900/30 transition-colors cursor-pointer ${isChecked ? "bg-emerald-950/10" : ""
                                            }`}
                                          onClick={() => {
                                            setSelectedFeeStudents(prev =>
                                              prev.includes(s.id)
                                                ? prev.filter(id => id !== s.id)
                                                : [...prev, s.id]
                                            );
                                          }}
                                        >
                                          <td className="py-2.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                            <input
                                              type="checkbox"
                                              checked={isChecked}
                                              onChange={(e) => {
                                                setSelectedFeeStudents(prev =>
                                                  e.target.checked
                                                    ? [...prev, s.id]
                                                    : prev.filter(id => id !== s.id)
                                                );
                                              }}
                                              className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                                            />
                                          </td>
                                          <td className="py-2.5 px-4 font-mono text-emerald-400">{s.id}</td>
                                          <td className="py-2.5 px-4 text-slate-200 font-bold">{s.name}</td>
                                          <td className="py-2.5 px-4 text-slate-400">{s.gradeGroup}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          );
                        })()}

                        <form onSubmit={handleAssignFeeWorkflow} className="flex flex-col gap-3 mt-2">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-bold">Charge Description</label>
                            <input
                              type="text"
                              placeholder="e.g. Monthly Tuition Fee"
                              value={chargeDescription}
                              onChange={(e) => setChargeDescription(e.target.value)}
                              className="bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none"
                              required
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Amount ($)</label>
                              <input
                                type="number"
                                placeholder="e.g. 50"
                                value={chargeAmount}
                                onChange={(e) => setChargeAmount(e.target.value)}
                                className="bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none font-bold"
                                required
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Charge Date</label>
                              <input
                                type="date"
                                value={chargeDate}
                                onChange={(e) => setChargeDate(e.target.value)}
                                className="bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none"
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono">Ref Number (Optional)</label>
                              <input
                                type="text"
                                placeholder="e.g. CHG-12345"
                                value={chargeReference}
                                onChange={(e) => setChargeReference(e.target.value)}
                                className="bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Created By</label>
                              <input
                                type="text"
                                value={chargeCreatedBy || currentUser?.name || "Admin"}
                                onChange={(e) => setChargeCreatedBy(e.target.value)}
                                className="bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Create Charge
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Record Payment */}
                  <div className="lg:col-span-6 flex flex-col gap-6">
                    <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col gap-4 shadow-lg">
                      <div>
                        <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-emerald-400" />
                          Record Payment
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Enter a payment transaction (reduces student balance owed).</p>
                      </div>

                      <form onSubmit={handleRecordPayment} className="flex flex-col gap-3">
                        {/* Search Student Input */}
                        <div className="flex flex-col gap-1.5 relative">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Search Student</label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Type Student ID or Student Name..."
                              value={paymentSearchQuery}
                              onChange={(e) => {
                                setPaymentSearchQuery(e.target.value);
                                if (!e.target.value.trim()) {
                                  setSelectedPaymentStudent(null);
                                  setPaymentStudentId("");
                                }
                              }}
                              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2 pl-3 pr-8 text-xs text-slate-100 focus:outline-none cursor-pointer"
                            />
                            <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5" />
                          </div>

                          {/* Search Results Dropdown List */}
                          {paymentSearchQuery.trim() && paymentSearchResults.length > 0 && (
                            <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-[200] max-h-48 overflow-y-auto divide-y divide-slate-800/40">
                              {paymentSearchResults.map((res) => (
                                <div
                                  key={res.id}
                                  onClick={() => {
                                    setSelectedPaymentStudent(res);
                                    setPaymentStudentId(res.id);
                                    setPaymentSearchQuery("");
                                    setPaymentSearchResults([]);
                                  }}
                                  className="p-2.5 text-xs text-slate-350 hover:bg-slate-800 cursor-pointer flex justify-between items-center transition-colors"
                                >
                                  <div>
                                    <span className="font-bold text-slate-100 block">{res.name}</span>
                                    <span className="text-[10px] text-slate-500 font-mono">ID: {stripLeadingZeros(res.id)} | Class: {res.className || "None"}</span>
                                  </div>
                                  <span className="text-[10px] font-mono font-bold text-rose-450">Owed: {formatCurrency(res.outstandingBalance)}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {paymentSearchQuery.trim() && paymentSearchResults.length === 0 && !isSearchingPaymentStudent && (
                            <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-800 rounded-xl p-3 text-center text-xs text-rose-400 italic z-[200]">
                              No student found.
                            </div>
                          )}
                        </div>

                        {/* Selected Student Display */}
                        {selectedPaymentStudent ? (
                          <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl flex flex-col gap-2.5 text-xs">
                            <div className="flex justify-between items-center border-b border-slate-900/60 pb-1.5">
                              <span className="font-mono text-emerald-455 font-bold">{stripLeadingZeros(selectedPaymentStudent.id)}</span>
                              <span className="text-[10px] text-slate-500 font-semibold">{selectedPaymentStudent.className || "Unassigned"}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-slate-500 block text-[9px] uppercase tracking-wide">Selected Student</span>
                                <span className="text-slate-200 font-bold font-mono">{selectedPaymentStudent.name}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-slate-500 block text-[9px] uppercase tracking-wide">Outstanding Balance</span>
                                <span className="text-rose-400 font-bold font-mono">{formatCurrency(selectedPaymentStudent.outstandingBalance)}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-950/20 border border-slate-850/50 p-4 rounded-xl text-center text-xs text-slate-500 italic">
                            No student selected. Search and select a student above to record a payment.
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono">Payment Method</label>
                            <select
                              value={paymentMethod}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className="bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none cursor-pointer font-bold"
                              required
                            >
                              <option value="EVCplus">EVCplus</option>
                              <option value="eDahab">eDahab</option>
                              <option value="ZAAD">ZAAD</option>
                              <option value="Bank Transfer">Bank Transfer</option>
                              <option value="Premier Wallet">Premier Wallet</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-bold font-mono">Amount Paid ($)</label>
                            <input
                              type="number"
                              placeholder="e.g. 40"
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value)}
                              className="bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none font-bold"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-bold">Payment Date</label>
                            <input
                              type="date"
                              value={paymentDate}
                              onChange={(e) => setPaymentDate(e.target.value)}
                              className="bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none cursor-pointer"
                              required
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Received By</label>
                            <input
                              type="text"
                              value={paymentReceivedBy || currentUser?.name || "Admin"}
                              onChange={(e) => setPaymentReceivedBy(e.target.value)}
                              className="bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Notes / Reference (Optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. Reference No / Check No"
                            value={paymentNotes}
                            onChange={(e) => setPaymentNotes(e.target.value)}
                            className="bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Record Payment
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Finance Metrics Dashboard Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-lg hover:border-slate-700 transition-all duration-300">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Charges</p>
                      <h3 className="text-2xl font-bold text-slate-100 font-mono mt-1">{formatCurrency(feeSummaryTotal)}</h3>
                    </div>
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                      <DollarSign className="w-6 h-6 text-amber-500" />
                    </div>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-lg hover:border-slate-700 transition-all duration-300">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Payments</p>
                      <h3 className="text-2xl font-bold text-emerald-400 font-mono mt-1">{formatCurrency(feeSummaryCollected)}</h3>
                    </div>
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                      <Coins className="w-6 h-6 text-emerald-400" />
                    </div>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-lg hover:border-slate-700 transition-all duration-300">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Outstanding Balance</p>
                      <h3 className="text-2xl font-bold text-rose-400 font-mono mt-1">{formatCurrency(feeSummaryOutstanding)}</h3>
                    </div>
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                      <CreditCard className="w-6 h-6 text-rose-400" />
                    </div>
                  </div>
                </div>

                {/* Professional Ledger Transactions List */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">

                  {/* Search and Filters Header */}
                  <div className="p-6 border-b border-slate-800/80 flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-base text-slate-200">Finance Transactions Register</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Audit history of all student charges and payments</p>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Export Menu */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer"
                          >
                            <FileCheck className="w-4 h-4" />
                            Export Report
                            <span className="text-[8px]">▼</span>
                          </button>

                          {exportDropdownOpen && (
                            <>
                              <div className="fixed inset-0 z-[90]" onClick={() => setExportDropdownOpen(false)} />
                              <div className="absolute right-0 mt-2 w-44 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-[100] overflow-hidden py-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleExportCSV();
                                    setExportDropdownOpen(false);
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-800 text-slate-350 hover:text-slate-100 transition-colors flex items-center gap-2"
                                >
                                  📄 Export CSV
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleExportExcel();
                                    setExportDropdownOpen(false);
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-800 text-slate-355 hover:text-slate-100 transition-colors flex items-center gap-2"
                                >
                                  📊 Export Excel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleExportPDF();
                                    setExportDropdownOpen(false);
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-800 text-slate-355 hover:text-slate-100 transition-colors flex items-center gap-2"
                                >
                                  📕 Export PDF
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Registry filters grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono">Search Term</span>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="ID, Name, or Ref..."
                            value={financeSearchQuery}
                            onChange={(e) => {
                              setFinanceSearchQuery(e.target.value);
                              setFinanceCurrentPage(1);
                            }}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-1.5 pl-3 pr-8 text-xs text-slate-200 focus:outline-none"
                          />
                          <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5" />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Class Filter</span>
                        <select
                          value={financeFilterClass}
                          onChange={(e) => {
                            setFinanceFilterClass(e.target.value);
                            setFinanceCurrentPage(1);
                          }}
                          className="bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none cursor-pointer"
                        >
                          <option value="">All Classes</option>
                          {classes.map((cls) => (
                            <option key={cls.id} value={cls.className}>
                              {cls.className}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Type</span>
                        <select
                          value={financeFilterType}
                          onChange={(e) => {
                            setFinanceFilterType(e.target.value);
                            setFinanceCurrentPage(1);
                          }}
                          className="bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none cursor-pointer"
                        >
                          <option value="All">All Types</option>
                          <option value="Charge">Charge</option>
                          <option value="Payment">Payment</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Status</span>
                        <select
                          value={financeFilterStatus}
                          onChange={(e) => {
                            setFinanceFilterStatus(e.target.value);
                            setFinanceCurrentPage(1);
                          }}
                          className="bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none cursor-pointer"
                        >
                          <option value="All">All Statuses</option>
                          <option value="Charge">Charge</option>
                          <option value="Paid">Paid</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Start Date</span>
                        <input
                          type="date"
                          value={financeStartDate}
                          onChange={(e) => {
                            setFinanceStartDate(e.target.value);
                            setFinanceCurrentPage(1);
                          }}
                          className="bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">End Date</span>
                        <input
                          type="date"
                          value={financeEndDate}
                          onChange={(e) => {
                            setFinanceEndDate(e.target.value);
                            setFinanceCurrentPage(1);
                          }}
                          className="bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Data Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-950 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-850">
                        <tr>
                          <th className="py-4 px-5">Date</th>
                          <th className="py-4 px-5">Ref Number</th>
                          <th className="py-4 px-5">Student ID</th>
                          <th className="py-4 px-5">Student Name</th>
                          <th className="py-4 px-5">Class</th>
                          <th className="py-4 px-5">Type</th>
                          <th className="py-4 px-5">Description</th>
                          <th className="py-4 px-5">Charge Amount</th>
                          <th className="py-4 px-5">Payment Amount</th>
                          <th className="py-4 px-5">Status</th>
                          <th className="py-4 px-5">Method</th>
                          <th className="py-4 px-5">Staff</th>
                          <th className="py-4 px-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40 font-medium">
                        {paginatedFinanceList.map((tx) => {
                          const isEditing = editingFeeId === tx.id;
                          return isEditing ? (
                            <tr key={tx.id} className="bg-slate-900 border-b border-emerald-500/20">
                              <td className="py-3 px-5 text-slate-400">
                                {new Date(tx.date || "").toLocaleDateString()}
                              </td>
                              <td className="py-3 px-5 font-mono text-slate-400">
                                {tx.referenceNumber}
                              </td>
                              <td className="py-3 px-5 font-mono text-emerald-400">
                                {tx.studentId}
                              </td>
                              <td className="py-3 px-5 text-slate-100 font-bold">
                                {tx.studentName || getStudentName(tx.studentId)}
                              </td>
                              <td className="py-3 px-5 text-slate-400">{tx.className || "Unassigned"}</td>
                              <td className="py-3 px-5 text-slate-400 font-bold">{tx.transactionType}</td>
                              <td className="py-3 px-5">
                                <input
                                  type="text"
                                  value={editFeeNameVal}
                                  onChange={(e) => setEditFeeNameVal(e.target.value)}
                                  className="w-full bg-slate-955 border border-slate-800 focus:border-emerald-500/50 rounded py-1 px-2 text-xs text-slate-100 focus:outline-none"
                                />
                              </td>
                              <td className="py-3 px-5">
                                {tx.transactionType === "Charge" ? (
                                  <input
                                    type="number"
                                    value={editFeeAmountVal}
                                    onChange={(e) => setEditFeeAmountVal(e.target.value)}
                                    className="w-20 bg-slate-955 border border-slate-800 focus:border-emerald-500/50 rounded py-1 px-2 text-xs text-slate-100 font-bold text-center"
                                  />
                                ) : "—"}
                              </td>
                              <td className="py-3 px-5">
                                {tx.transactionType === "Payment" ? (
                                  <input
                                    type="number"
                                    value={editFeeAmountVal}
                                    onChange={(e) => setEditFeeAmountVal(e.target.value)}
                                    className="w-20 bg-slate-955 border border-slate-800 focus:border-emerald-500/50 rounded py-1 px-2 text-xs text-slate-100 font-bold text-center"
                                  />
                                ) : "—"}
                              </td>
                              <td className="py-3 px-5">
                                <span className="inline-flex px-2 py-0.5 bg-slate-950 border border-slate-800 text-[9px] uppercase rounded text-slate-400">
                                  EDIT
                                </span>
                              </td>
                              <td className="py-3 px-5 text-slate-500">{tx.paymentMethod || "—"}</td>
                              <td className="py-3 px-5 text-slate-500">{tx.createdBy}</td>
                              <td className="py-3 px-5 text-right">
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleSaveFeeEdit(tx)}
                                    className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded"
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingFeeId(null)}
                                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            <tr key={tx.id} className="hover:bg-slate-850/20 transition-colors">
                              <td className="py-3.5 px-5 text-slate-400 whitespace-nowrap">
                                {new Date(tx.date || "").toLocaleDateString()}
                              </td>
                              <td className="py-3.5 px-5 font-mono text-slate-400 font-semibold">
                                {tx.referenceNumber || "—"}
                              </td>
                              <td className="py-3.5 px-5 font-mono text-emerald-400">{stripLeadingZeros(tx.studentId)}</td>
                              <td className="py-3.5 px-5 text-slate-200 font-bold">
                                {tx.studentName || getStudentName(tx.studentId)}
                              </td>
                              <td className="py-3.5 px-5 text-slate-400">{tx.className || "Unassigned"}</td>
                              <td className="py-3.5 px-5">
                                <span className={`text-[10px] font-bold ${tx.transactionType === "Charge" ? "text-amber-500" : "text-emerald-400"
                                  }`}>
                                  {tx.transactionType}
                                </span>
                              </td>
                              <td className="py-3.5 px-5 text-slate-350 max-w-[150px] truncate" title={tx.feeName}>
                                {tx.feeName}
                              </td>
                              <td className="py-3.5 px-5 font-mono text-slate-200">
                                {tx.transactionType === "Charge" ? formatCurrency(tx.amount) : "—"}
                              </td>
                              <td className="py-3.5 px-5 font-mono text-emerald-400 font-bold">
                                {tx.transactionType === "Payment" ? formatCurrency(tx.paid) : "—"}
                              </td>
                              <td className="py-3.5 px-5">
                                <span className={`inline-flex px-2.5 py-0.5 text-[9px] font-extrabold uppercase rounded border ${tx.status === "Paid"
                                    ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-400"
                                    : "bg-amber-950/40 border-amber-500/20 text-amber-500"
                                  }`}>
                                  {tx.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-5 text-slate-400 text-xs font-mono">{tx.paymentMethod || "—"}</td>
                              <td className="py-3.5 px-5 text-slate-400">{tx.createdBy || "—"}</td>
                              <td className="py-3.5 px-5 text-right whitespace-nowrap">
                                <div className="flex justify-end items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => startEditFee(tx)}
                                    className="px-2 py-1 bg-slate-800 hover:bg-slate-755 border border-slate-700 hover:border-slate-650 text-slate-350 text-[11px] font-bold rounded transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteFee(tx.id, tx.feeName)}
                                    className="p-1.5 hover:bg-rose-950/30 text-slate-500 hover:text-rose-400 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
                                    title="Delete transaction record"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}

                        {paginatedFinanceList.length === 0 && (
                          <tr>
                            <td colSpan={13} className="py-8 px-6 text-center text-slate-500 italic">
                              No finance transactions found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer */}
                  {sortedFinanceList.length > 0 && (
                    <div className="p-4 border-t border-slate-850 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs font-medium text-slate-400">
                      <div className="flex items-center gap-2">
                        <span>Show</span>
                        <select
                          value={financePageSize}
                          onChange={(e) => {
                            setFinancePageSize(parseInt(e.target.value));
                            setFinanceCurrentPage(1);
                          }}
                          className="bg-slate-900 border border-slate-855 rounded-lg py-1 px-2.5 text-slate-200 cursor-pointer focus:outline-none"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                        </select>
                        <span>transactions of <b>{sortedFinanceList.length}</b> total</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setFinanceCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={financeCurrentPage === 1}
                          className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-850 disabled:opacity-40 disabled:cursor-not-allowed text-xs transition-colors"
                        >
                          Previous
                        </button>
                        <span>Page <b>{financeCurrentPage}</b> of <b>{totalFinancePages}</b></span>
                        <button
                          type="button"
                          onClick={() => setFinanceCurrentPage(prev => Math.min(totalFinancePages, prev + 1))}
                          disabled={financeCurrentPage === totalFinancePages}
                          className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-850 disabled:opacity-40 disabled:cursor-not-allowed text-xs transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* EXAMS MANAGEMENT SECTION */}
            {activeSection === "exams" && (
              <motion.div
                key="exams-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-8"
              >
                {subjects.length === 0 ? (
                  <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl text-center text-slate-400 font-medium">
                    No subjects registered yet. Please create subjects first.
                  </div>
                ) : (
                  <>
                    {/* 1. ENTRY WORKSPACE CONTROLS & FILTER */}
                    <div id="grading-roster-section" className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col gap-6">
                      <div>
                        <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                          <FileCheck className="w-5.5 h-5.5 text-emerald-400" />
                          Enter Examination Marks
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Select a class, academic year, and term — then enter marks for each student and click Save.
                        </p>
                      </div>

                      {/* Filter controls row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-950 p-4 border border-slate-850 rounded-xl shadow-inner">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Select Class</label>
                          <select
                            value={examClassId}
                            onChange={(e) => setExamClassId(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/50 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none cursor-pointer"
                          >
                            <option value="">— Select a Class —</option>
                            {classes.map((cls) => (
                              <option key={cls.id} value={cls.id}>
                                {cls.className} ({cls.room})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Academic Year</label>
                          <select
                            value={examAcademicYear}
                            onChange={(e) => setExamAcademicYear(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/50 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none cursor-pointer"
                          >
                            <option value="2025–2026">2025–2026</option>
                            <option value="2026–2027">2026–2027</option>
                            <option value="2027–2028">2027–2028</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Assessment Term</label>
                          <select
                            value={examTerm}
                            onChange={(e) => setExamTerm(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/50 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none cursor-pointer"
                          >
                            <option value="Term 1">Term 1</option>
                            <option value="Term 2">Term 2</option>
                            <option value="Term 3">Term 3</option>
                            <option value="Term 4">Term 4</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Maximum Points</label>
                          <input
                            type="number"
                            min="1"
                            value={examMaxPoints}
                            onChange={(e) => setExamMaxPoints(Math.max(1, parseInt(e.target.value) || 100))}
                            className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/50 rounded-lg py-1.5 px-3 text-xs text-slate-100 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Student Marksheet Entry Area */}
                      <div className="flex flex-col gap-4 border-t border-slate-800/80 pt-5">
                        {!examClassId ? (
                          <div className="py-14 flex flex-col items-center gap-4 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
                            <div className="p-4 bg-slate-900 rounded-full border border-slate-800">
                              <GraduationCap className="w-8 h-8 text-slate-600" />
                            </div>
                            <div>
                              <p className="text-slate-400 text-sm font-semibold">Please select a class to load students.</p>
                              <p className="text-slate-600 text-xs mt-1">The student marksheet will appear once a class is selected.</p>
                            </div>
                          </div>
                        ) : (
                          (() => {
                            const selClass = classes.find((c) => c.id === examClassId);
                            const selClassName = selClass ? selClass.className : "";
                            const matchingStudents = students.filter((s) => s.gradeGroup === selClassName);

                            if (matchingStudents.length === 0) {
                              return (
                                <div className="py-10 text-center text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
                                  No students registered in <span className="text-emerald-400 font-bold">"{selClassName}"</span>.
                                </div>
                              );
                            }

                            return (
                              <div className="flex flex-col gap-4">
                                {/* Context banner */}
                                <div className="bg-gradient-to-r from-emerald-950/50 via-slate-900/80 to-slate-900/60 border border-emerald-500/15 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                  <div>
                                    <h3 className="font-extrabold text-lg text-slate-100 uppercase tracking-wider">{selClassName}</h3>
                                    <div className="flex flex-wrap gap-x-3 mt-1 text-xs text-slate-400 font-mono">
                                      <span>{examAcademicYear}</span>
                                      <span className="text-slate-700">·</span>
                                      <span>{examTerm}</span>
                                      <span className="text-slate-700">·</span>
                                      <span>{matchingStudents.length} student(s)</span>
                                      <span className="text-slate-700">·</span>
                                      <span>Max {examMaxPoints} pts / subject</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Desktop Marksheet Table */}
                                <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                                  <table className="w-full text-left text-xs min-w-max">
                                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                                      <tr>
                                        <th className="py-3.5 px-4 whitespace-nowrap">Student ID</th>
                                        <th className="py-3.5 px-4 whitespace-nowrap">Name</th>
                                        {subjects.map((sub) => (
                                          <th key={sub.id} className="py-3.5 px-3 text-center whitespace-nowrap font-mono min-w-[80px]">{sub.subjectName}</th>
                                        ))}
                                        <th className="py-3.5 px-3 text-center whitespace-nowrap">Total</th>
                                        <th className="py-3.5 px-3 text-center whitespace-nowrap">Avg</th>
                                        <th className="py-3.5 px-3 text-center whitespace-nowrap">Grade</th>
                                        <th className="py-3.5 px-4 whitespace-nowrap min-w-[180px]">Feedback</th>
                                        <th className="py-3.5 px-3 text-center whitespace-nowrap">Status</th>
                                        <th className="py-3.5 px-4 text-right whitespace-nowrap">Save</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                      {matchingStudents.map((student) => {
                                        const inputState = rowInputs[student.id] || { scores: {}, feedback: "" };
                                        const { total, average, grade, count } = getStudentTotalAndGrade(student.id);
                                        const hasSaved = exams.some(
                                          (e) =>
                                            e.studentId === student.id &&
                                            e.className === selClassName &&
                                            e.academicYear === examAcademicYear &&
                                            e.term === examTerm
                                        );

                                        return (
                                          <tr key={student.id} className={`hover:bg-slate-900/30 transition-colors ${hasSaved ? "" : "opacity-90"}`}>
                                            <td className="py-2.5 px-4 font-mono text-emerald-400 font-bold whitespace-nowrap">{student.id}</td>
                                            <td className="py-2.5 px-4 whitespace-nowrap">
                                              <span className="font-bold text-slate-100">{student.name}</span>
                                            </td>
                                            {subjects.map((sub) => (
                                              <td key={sub.id} className="py-2 px-2 text-center">
                                                <input
                                                  type="number" min="0" max={examMaxPoints} placeholder="—"
                                                  value={inputState.scores[sub.subjectName] || ""}
                                                  onChange={(e) => updateRowInput(student.id, sub.subjectName, e.target.value)}
                                                  className="w-16 bg-slate-900/80 border border-slate-800 focus:border-emerald-500/40 rounded py-1 px-1.5 text-center text-slate-100 font-bold text-xs focus:outline-none transition-colors"
                                                />
                                              </td>
                                            ))}
                                            <td className="py-2.5 px-3 text-center font-bold text-emerald-400 font-mono whitespace-nowrap">
                                              {count > 0 ? total : <span className="text-slate-700">—</span>}
                                            </td>
                                            <td className="py-2.5 px-3 text-center font-bold text-emerald-300 font-mono whitespace-nowrap">
                                              {count > 0 ? `${Math.round(average)}%` : <span className="text-slate-700">—</span>}
                                            </td>
                                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                              {count > 0 ? (
                                                <span className={`inline-flex px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide rounded border ${getGradeBadge(grade)}`}>
                                                  {grade}
                                                </span>
                                              ) : (
                                                <span className="text-slate-700">—</span>
                                              )}
                                            </td>
                                            <td className="py-2 px-4">
                                              <input
                                                type="text" placeholder="Instructor notes..."
                                                value={inputState.feedback}
                                                onChange={(e) => updateRowFeedback(student.id, e.target.value)}
                                                className="w-full bg-slate-900/80 border border-slate-800 focus:border-emerald-500/40 rounded py-1 px-2 text-xs text-slate-200 focus:outline-none"
                                              />
                                            </td>
                                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                              {hasSaved ? (
                                                <span className="inline-flex items-center gap-1 text-[9px] text-emerald-400 font-bold uppercase border border-emerald-500/20 bg-emerald-950/30 px-1.5 py-0.5 rounded">
                                                  ✓ Saved
                                                </span>
                                              ) : (
                                                <span className="inline-flex text-[9px] text-slate-500 font-bold uppercase border border-slate-700 bg-slate-900/60 px-1.5 py-0.5 rounded">
                                                  Not Saved
                                                </span>
                                              )}
                                            </td>
                                            <td className="py-2.5 px-4 text-right">
                                              <button
                                                type="button"
                                                onClick={() => handleSaveAllGrades(student.id, student.name, inputState)}
                                                className="py-1.5 px-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-all text-xs cursor-pointer shadow-sm"
                                              >
                                                {hasSaved ? "Update" : "Save"}
                                              </button>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>

                                {/* Mobile: card per student */}
                                <div className="md:hidden flex flex-col gap-4">
                                  {matchingStudents.map((student) => {
                                    const inputState = rowInputs[student.id] || { scores: {}, feedback: "" };
                                    const { average, count } = getStudentTotalAndGrade(student.id);
                                    const hasSavedMobile = exams.some(
                                      (e) =>
                                        e.studentId === student.id &&
                                        e.className === selClassName &&
                                        e.academicYear === examAcademicYear &&
                                        e.term === examTerm
                                    );

                                    return (
                                      <div key={student.id} className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                                        <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800 flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-emerald-950/70 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                            <span className="text-emerald-400 text-xs font-extrabold">{student.name.charAt(0).toUpperCase()}</span>
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <span className="font-bold text-slate-100 text-sm">{student.name}</span>
                                            <div className="text-[10px] text-emerald-400 font-mono">{student.id}</div>
                                          </div>
                                          <div className="flex items-center gap-2 shrink-0">
                                            {count > 0 && (
                                              <span className="font-mono text-emerald-400 text-xs font-bold">{Math.round(average)}%</span>
                                            )}
                                            {hasSavedMobile ? (
                                              <span className="inline-flex text-[9px] text-emerald-400 font-bold uppercase border border-emerald-500/20 bg-emerald-950/30 px-1.5 py-0.5 rounded">
                                                ✓ Saved
                                              </span>
                                            ) : (
                                              <span className="inline-flex text-[9px] text-slate-500 font-bold uppercase border border-slate-700 bg-slate-900/60 px-1.5 py-0.5 rounded">
                                                Not Saved
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="p-4 flex flex-col gap-3">
                                          <div className="grid grid-cols-2 gap-2">
                                            {subjects.map((sub) => (
                                              <div key={sub.id} className="flex flex-col gap-1">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{sub.subjectName}</label>
                                                <input
                                                  type="number" min="0" max={examMaxPoints} placeholder="—"
                                                  value={inputState.scores[sub.subjectName] || ""}
                                                  onChange={(e) => updateRowInput(student.id, sub.subjectName, e.target.value)}
                                                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/50 rounded py-1.5 px-2 text-center text-slate-100 font-bold text-xs focus:outline-none"
                                                />
                                              </div>
                                            ))}
                                          </div>
                                          <input
                                            type="text" placeholder="Instructor notes (optional)..."
                                            value={inputState.feedback}
                                            onChange={(e) => updateRowFeedback(student.id, e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/50 rounded py-1.5 px-3 text-xs text-slate-200 focus:outline-none"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => handleSaveAllGrades(student.id, student.name, inputState)}
                                            className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs cursor-pointer transition-colors"
                                          >
                                            {hasSavedMobile ? "Update Exam Marks" : "Save Exam Marks"}
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()
                        )}
                      </div>
                    </div>

                    {/* 3. RECORDED EXAM STUDENTS — EXPANDABLE ROWS */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col gap-5">
                      <div>
                        <h3 className="font-bold text-base text-slate-200 flex items-center gap-2">
                          <Award className="w-5 h-5 text-emerald-400" />
                          Recorded Exam Students
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Select a class to view students who have saved examination results. Expand any row to see the full marksheet.
                        </p>
                      </div>

                      {/* Class Dropdown */}
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                          Select Class to View Recorded Exams:
                        </label>
                        <select
                          value={registryClassId}
                          onChange={(e) => {
                            setRegistryClassId(e.target.value);
                            setExpandedRegistryKeys(new Set());
                            setRegistryEditKey(null);
                            setRegistryStudentSearch("");
                          }}
                          className="flex-1 sm:max-w-sm bg-slate-900 border border-slate-700 focus:border-emerald-500/50 rounded-xl py-2.5 px-4 text-sm text-slate-100 focus:outline-none cursor-pointer transition-colors"
                        >
                          <option value="">— Select a Class —</option>
                          {classes.map((cls) => (
                            <option key={cls.id} value={cls.id}>
                              {cls.className} ({cls.room})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* No class selected */}
                      {!registryClassId ? (
                        <div className="py-16 flex flex-col items-center gap-4 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
                          <div className="p-4 bg-slate-900 rounded-full border border-slate-800">
                            <GraduationCap className="w-8 h-8 text-slate-600" />
                          </div>
                          <div>
                            <p className="text-slate-400 text-sm font-semibold">Please select a class to view students with recorded exam results.</p>
                            <p className="text-slate-600 text-xs mt-1">Students with saved examination records will appear here.</p>
                          </div>
                        </div>
                      ) : (
                        (() => {
                          const regClass = classes.find((c) => c.id === registryClassId);
                          const regClassName = regClass ? regClass.className : "";

                          // All exams for this class
                          let allClassExams = exams.filter((e) => e.className === regClassName);

                          // Optional year/term filters
                          if (registryAcademicYear) allClassExams = allClassExams.filter((e) => e.academicYear === registryAcademicYear);
                          if (registryTerm) allClassExams = allClassExams.filter((e) => e.term === registryTerm);

                          // Build unique (studentId, academicYear, term) entries
                          const entryMap = new Map<string, { studentId: string; year: string; term: string }>();
                          allClassExams.forEach((e) => {
                            const key = `${e.studentId}|${e.academicYear}|${e.term}`;
                            if (!entryMap.has(key)) {
                              entryMap.set(key, { studentId: e.studentId, year: e.academicYear, term: e.term });
                            }
                          });
                          let entries = Array.from(entryMap.values());

                          // Search filter
                          if (registryStudentSearch.trim()) {
                            const q = registryStudentSearch.toLowerCase();
                            entries = entries.filter(({ studentId }) => {
                              const st = students.find((s) => s.id === studentId);
                              return st?.name.toLowerCase().includes(q) || studentId.toLowerCase().includes(q);
                            });
                          }

                          return (
                            <div className="flex flex-col gap-4">
                              {/* Class Banner + Filters */}
                              <div className="bg-gradient-to-r from-emerald-950/50 via-slate-900/80 to-slate-900/60 border border-emerald-500/15 rounded-xl px-5 py-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                  <div>
                                    <h4 className="font-extrabold text-lg text-slate-100 uppercase tracking-wider">{regClassName}</h4>
                                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-slate-400 font-mono">
                                      {regClass?.room && <span>Room: {regClass.room}</span>}
                                      {regClass?.instructor && (
                                        <>
                                          <span className="text-slate-700">·</span>
                                          <span>Instructor: {regClass.instructor}</span>
                                        </>
                                      )}
                                      <span className="text-slate-700">·</span>
                                      <span className="text-emerald-400 font-semibold">{entries.length} record(s) found</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Filter row */}
                              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="flex flex-col gap-1.5">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Academic Year</label>
                                  <select value={registryAcademicYear} onChange={(e) => setRegistryAcademicYear(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/50 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none cursor-pointer">
                                    <option value="">All Years</option>
                                    <option value="2025–2026">2025–2026</option>
                                    <option value="2026–2027">2026–2027</option>
                                    <option value="2027–2028">2027–2028</option>
                                  </select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Term</label>
                                  <select value={registryTerm} onChange={(e) => setRegistryTerm(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/50 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none cursor-pointer">
                                    <option value="">All Terms</option>
                                    <option value="Term 1">Term 1</option>
                                    <option value="Term 2">Term 2</option>
                                    <option value="Term 3">Term 3</option>
                                    <option value="Term 4">Term 4</option>
                                  </select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Search Student</label>
                                  <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                                    <input type="text" placeholder="Name or Student ID..."
                                      value={registryStudentSearch} onChange={(e) => setRegistryStudentSearch(e.target.value)}
                                      className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-800 focus:border-emerald-500/50 rounded-lg text-xs text-slate-100 focus:outline-none" />
                                  </div>
                                </div>
                              </div>

                              {/* Empty state */}
                              {entries.length === 0 ? (
                                <div className="py-12 flex flex-col items-center gap-3 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
                                  <FileText className="w-8 h-8 text-slate-700" />
                                  {registryStudentSearch.trim() ? (
                                    <p className="text-slate-500 text-sm">No matching recorded exam results found.</p>
                                  ) : (
                                    <>
                                      <p className="text-slate-400 text-sm font-semibold">No recorded examination results found for this class.</p>
                                      <p className="text-slate-600 text-xs">Use &ldquo;Enter Examination Marks&rdquo; above to record marks first.</p>
                                    </>
                                  )}
                                </div>
                              ) : (
                                <div className="flex flex-col gap-2">
                                  {entries.map(({ studentId, year, term }) => {
                                    const rowKey = `${studentId}|${year}|${term}`;
                                    const student = students.find((s) => s.id === studentId);
                                    if (!student) return null;

                                    const rowExams = allClassExams.filter(
                                      (e) => e.studentId === studentId && e.academicYear === year && e.term === term
                                    );

                                    // Build score map for this row
                                    const rowScores: { [subj: string]: number } = {};
                                    rowExams.forEach((e) => { rowScores[e.subject] = e.score; });

                                    let rTotal = 0, rCount = 0;
                                    subjects.forEach((sub) => {
                                      const s = rowScores[sub.subjectName];
                                      if (s !== undefined) { rTotal += s; rCount++; }
                                    });
                                    const rAvg = rCount > 0 ? rTotal / rCount : 0;
                                    const rGrade = rCount > 0 ? calculateGrade(rAvg) : "—";

                                    const isExpanded = expandedRegistryKeys.has(rowKey);
                                    const isEditing = registryEditKey === rowKey;

                                    const toggleExpand = () => {
                                      setExpandedRegistryKeys((prev) => {
                                        const next = new Set(prev);
                                        if (next.has(rowKey)) next.delete(rowKey);
                                        else next.add(rowKey);
                                        return next;
                                      });
                                      if (registryEditKey === rowKey) setRegistryEditKey(null);
                                    };

                                    return (
                                      <div key={rowKey} className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                                        {/* Summary Row */}
                                        <div className={`flex items-center gap-3 px-4 py-3 ${isExpanded ? "bg-slate-900/70 border-b border-slate-800" : "hover:bg-slate-900/30"} transition-colors`}>
                                          {/* Avatar */}
                                          <div className="w-8 h-8 rounded-full bg-emerald-950/70 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                            <span className="text-emerald-400 text-xs font-extrabold">{student.name.charAt(0)}</span>
                                          </div>
                                          {/* Info */}
                                          <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                              <span className="font-bold text-slate-100 text-sm">{student.name}</span>
                                              <span className="font-mono text-emerald-400 text-[10px] font-bold bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/50">{student.id}</span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-[10px] text-slate-400 font-mono">
                                              <span>{year}</span>
                                              <span className="text-slate-700">·</span>
                                              <span>{term}</span>
                                            </div>
                                          </div>
                                          {/* Stats */}
                                          <div className="hidden sm:flex items-center gap-3 shrink-0">
                                            {rCount > 0 && (
                                              <>
                                                <div className="text-right">
                                                  <div className="text-[10px] text-slate-500 uppercase font-bold">Total</div>
                                                  <div className="text-emerald-400 font-bold font-mono text-sm">{rTotal}</div>
                                                </div>
                                                <div className="text-right">
                                                  <div className="text-[10px] text-slate-500 uppercase font-bold">Avg</div>
                                                  <div className="text-emerald-300 font-bold font-mono text-sm">{Math.round(rAvg)}%</div>
                                                </div>
                                                <span className={`inline-flex px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide rounded border ${getGradeBadge(rGrade)}`}>{rGrade}</span>
                                              </>
                                            )}
                                          </div>
                                          {/* Actions */}
                                          <div className="flex items-center gap-1.5 shrink-0">
                                            <button type="button" onClick={toggleExpand}
                                              className="px-2.5 py-1 bg-slate-900 border border-slate-700 hover:border-emerald-500/30 hover:text-emerald-400 text-slate-400 text-xs font-bold rounded-lg transition-all flex items-center gap-1">
                                              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                                              {isExpanded ? "Hide" : "View"}
                                            </button>
                                            <button type="button"
                                              onClick={() => {
                                                const initScores: { [sub: string]: string } = {};
                                                subjects.forEach((sub) => {
                                                  const s = rowScores[sub.subjectName];
                                                  initScores[sub.subjectName] = s !== undefined ? s.toString() : "";
                                                });
                                                const foundFeedback = rowExams.find((e) => e.feedback && e.feedback.trim() !== "");
                                                setRegistryEditRowInputs({ scores: initScores, feedback: foundFeedback?.feedback ?? "" });
                                                setRegistryEditKey(rowKey);
                                                setExpandedRegistryKeys((prev) => { const n = new Set(prev); n.add(rowKey); return n; });
                                              }}
                                              className="px-2.5 py-1 bg-slate-900 border border-slate-700 hover:border-emerald-500/30 hover:text-emerald-400 text-slate-300 text-xs font-bold rounded-lg transition-all">
                                              Edit
                                            </button>
                                            <button type="button"
                                              onClick={() => handleDeleteStudentExams(studentId, student.name, rowExams)}
                                              className="p-1.5 hover:bg-rose-950/30 text-slate-500 hover:text-rose-400 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
                                              title="Delete this exam record">
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>

                                        {/* Mobile stats strip */}
                                        {rCount > 0 && (
                                          <div className="sm:hidden flex items-center gap-4 px-4 py-2 bg-slate-900/40 border-b border-slate-800/60">
                                            <span className="text-[10px] text-slate-500 uppercase font-bold">Total</span>
                                            <span className="text-emerald-400 font-bold font-mono text-xs">{rTotal}</span>
                                            <span className="text-slate-700">·</span>
                                            <span className="text-[10px] text-slate-500 uppercase font-bold">Avg</span>
                                            <span className="text-emerald-300 font-bold font-mono text-xs">{Math.round(rAvg)}%</span>
                                            <span className="text-slate-700">·</span>
                                            <span className={`inline-flex px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded border ${getGradeBadge(rGrade)}`}>{rGrade}</span>
                                          </div>
                                        )}

                                        {/* Expandable Details Panel */}
                                        <AnimatePresence>
                                          {isExpanded && (
                                            <motion.div key={`detail-${rowKey}`}
                                              initial={{ height: 0, opacity: 0 }}
                                              animate={{ height: "auto", opacity: 1 }}
                                              exit={{ height: 0, opacity: 0 }}
                                              transition={{ duration: 0.22, ease: "easeInOut" }}
                                              className="overflow-hidden">
                                              <div className="p-4 flex flex-col gap-4">
                                                {/* Detail header */}
                                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                                  <span className="text-slate-500 font-bold uppercase tracking-wide">Marksheet:</span>
                                                  <span className="text-slate-300 font-mono">{regClassName} · {year} · {term}</span>
                                                </div>

                                                {/* Edit mode */}
                                                {isEditing ? (
                                                  <div className="flex flex-col gap-3">
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                      {subjects.map((sub) => (
                                                        <div key={sub.id} className="flex flex-col gap-1">
                                                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{sub.subjectName}</label>
                                                          <input type="number" min="0" max="100" placeholder="—"
                                                            value={registryEditRowInputs.scores[sub.subjectName] || ""}
                                                            onChange={(e) => setRegistryEditRowInputs((prev) => ({
                                                              ...prev, scores: { ...prev.scores, [sub.subjectName]: e.target.value }
                                                            }))}
                                                            className="w-full bg-slate-900 border border-emerald-500/30 focus:border-emerald-400 rounded-lg py-1.5 px-2 text-center text-slate-100 font-bold text-xs focus:outline-none" />
                                                        </div>
                                                      ))}
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Feedback / Notes</label>
                                                      <input type="text" placeholder="Teacher notes..."
                                                        value={registryEditRowInputs.feedback}
                                                        onChange={(e) => setRegistryEditRowInputs((prev) => ({ ...prev, feedback: e.target.value }))}
                                                        className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500/50 rounded-lg py-1.5 px-3 text-xs text-slate-200 focus:outline-none" />
                                                    </div>
                                                    <div className="flex items-center gap-2 pt-1">
                                                      <button type="button"
                                                        onClick={() => {
                                                          handleRegistrySaveEdit(studentId, student.name);
                                                          setRegistryEditKey(null);
                                                        }}
                                                        className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors">
                                                        Save Changes
                                                      </button>
                                                      <button type="button" onClick={() => setRegistryEditKey(null)}
                                                        className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-colors">
                                                        Cancel
                                                      </button>
                                                    </div>
                                                  </div>
                                                ) : (
                                                  /* Read-only subject marksheet */
                                                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                                                    <table className="w-full text-xs min-w-max">
                                                      <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                                                        <tr>
                                                          {subjects.map((sub) => (
                                                            <th key={sub.id} className="py-3 px-4 text-center whitespace-nowrap font-mono">{sub.subjectName}</th>
                                                          ))}
                                                          <th className="py-3 px-4 text-center whitespace-nowrap text-emerald-400">Total</th>
                                                          <th className="py-3 px-4 text-center whitespace-nowrap text-emerald-300">Average</th>
                                                          <th className="py-3 px-4 text-center whitespace-nowrap">Grade</th>
                                                        </tr>
                                                      </thead>
                                                      <tbody>
                                                        <tr className="bg-slate-950">
                                                          {subjects.map((sub) => {
                                                            const s = rowScores[sub.subjectName];
                                                            return (
                                                              <td key={sub.id} className="py-3 px-4 text-center">
                                                                {s !== undefined
                                                                  ? <span className="font-bold text-slate-200 font-mono">{s}</span>
                                                                  : <span className="text-slate-700">—</span>}
                                                              </td>
                                                            );
                                                          })}
                                                          <td className="py-3 px-4 text-center font-bold text-emerald-400 font-mono">
                                                            {rCount > 0 ? rTotal : <span className="text-slate-700">—</span>}
                                                          </td>
                                                          <td className="py-3 px-4 text-center font-bold text-emerald-300 font-mono">
                                                            {rCount > 0 ? `${Math.round(rAvg)}%` : <span className="text-slate-700">—</span>}
                                                          </td>
                                                          <td className="py-3 px-4 text-center">
                                                            {rCount > 0
                                                              ? <span className={`inline-flex px-2 py-0.5 text-[9px] font-extrabold uppercase rounded border ${getGradeBadge(rGrade)}`}>{rGrade}</span>
                                                              : <span className="text-slate-700">—</span>}
                                                          </td>
                                                        </tr>
                                                      </tbody>
                                                    </table>
                                                  </div>
                                                )}
                                              </div>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })()
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* SUBJECTS MANAGEMENT SECTION */}
            {activeSection === "subjects" && (
              <motion.div
                key="subjects-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
              >
                {/* Form column */}
                <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col gap-5">
                  <div>
                    <h3 className="font-bold text-base text-slate-200">Register New Subject</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Add core classes and course subjects to registry.</p>
                  </div>

                  <form onSubmit={handleRegisterSubject} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Subject Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Mathematics"
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2.5 px-4 text-sm text-slate-100 focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Subject Code <span className="text-slate-600 font-normal">(Optional)</span></label>
                      <input
                        type="text"
                        placeholder="e.g. MTH-101"
                        value={newSubjectCode}
                        onChange={(e) => setNewSubjectCode(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2.5 px-4 text-sm text-slate-100 focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Description <span className="text-slate-600 font-normal">(Optional)</span></label>
                      <textarea
                        placeholder="Subject course summary..."
                        value={newSubjectDescription}
                        onChange={(e) => setNewSubjectDescription(e.target.value)}
                        rows={3}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none resize-none leading-relaxed"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
                    >
                      <Plus className="w-4 h-4" />
                      Register Subject
                    </button>
                  </form>
                </div>

                {/* Table column */}
                <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-slate-800/80">
                    <h3 className="font-bold text-base text-slate-200">Registered Subjects</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Total count: {subjects.length} subjects registered</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-950 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                        <tr>
                          <th className="py-4 px-6">Subject ID</th>
                          <th className="py-4 px-6">Subject Name</th>
                          <th className="py-4 px-6">Subject Code</th>
                          <th className="py-4 px-6">Description</th>
                          <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50 font-medium">
                        {subjects.map((subject) => (
                          <tr key={subject.id} className="hover:bg-slate-850/30 transition-colors">
                            <td className="py-4 px-6 font-mono text-emerald-400">{subject.id}</td>
                            <td className="py-4 px-6 text-slate-100">{subject.subjectName}</td>
                            <td className="py-4 px-6 text-slate-400 font-mono text-xs">{subject.subjectCode || "—"}</td>
                            <td className="py-4 px-6 text-slate-450 text-xs max-w-xs truncate" title={subject.description}>
                              {subject.description || "No description provided."}
                            </td>
                            <td className="py-4 px-6 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteConfirmMessage(`Deleting subject "${subject.subjectName}" (ID: ${subject.id}) will permanently remove it from active academic listings.`);
                                  setOnConfirmDeleteAction(() => async () => {
                                    const res = await deleteSubject(subject.id);
                                    if (res.success) {
                                      showToast(`Subject "${subject.subjectName}" deleted successfully`, "success");
                                    } else {
                                      showToast(res.error || "Failed to delete subject", "error");
                                    }
                                  });
                                  setDeleteModalOpen(true);
                                }}
                                className="p-1.5 hover:bg-rose-950/30 text-slate-500 hover:text-rose-400 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
                                title="Remove subject"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {subjects.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 px-6 text-center text-slate-500">
                              No subjects registered yet. Register subjects to begin curriculum grading.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* USER ACCOUNTS MANAGEMENT SECTION (SUPER ADMIN ONLY) */}
            {activeSection === "users" && currentUser?.role === "super_admin" && (
              <motion.div
                key="users-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-8"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Super Admin Access
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100 flex items-center gap-3 mt-1">
                    User Accounts & System Access
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Create, manage, and configure administrator authentication accounts and login permissions.
                  </p>
                </div>

                {/* User Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden">
                    <UserCheck className="w-10 h-10 text-purple-500/20 absolute right-4 top-4" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total Accounts</span>
                    <span className="block text-3xl font-bold font-mono text-slate-100 mt-2">{userAccounts.length}</span>
                    <span className="text-[10px] text-slate-500 block mt-1">System user credentials</span>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden">
                    <Shield className="w-10 h-10 text-emerald-500/20 absolute right-4 top-4" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Super Admins</span>
                    <span className="block text-3xl font-bold font-mono text-purple-400 mt-2">
                      {userAccounts.filter((u) => u.role === "super_admin").length}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">Full system privilege</span>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden">
                    <UserPlus className="w-10 h-10 text-blue-500/20 absolute right-4 top-4" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Admins</span>
                    <span className="block text-3xl font-bold font-mono text-blue-400 mt-2">
                      {userAccounts.filter((u) => u.role === "admin").length}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">Standard module access</span>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500/20 absolute right-4 top-4" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Active Accounts</span>
                    <span className="block text-3xl font-bold font-mono text-emerald-400 mt-2">
                      {userAccounts.filter((u) => u.status === "active").length}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      {userAccounts.filter((u) => u.status === "inactive").length} accounts disabled
                    </span>
                  </div>
                </div>

                {/* Form & Table Row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Create New Account Form */}
                  <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col gap-5">
                    <div>
                      <h3 className="font-bold text-base text-slate-200 flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-emerald-400" />
                        Create New Login Account
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Add a new administrative user with login credentials.
                      </p>
                    </div>

                    <form onSubmit={handleAddUserAccountSubmit} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Full Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Sarah Connor"
                          value={newUserFullName}
                          onChange={(e) => setNewUserFullName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2.5 px-4 text-sm text-slate-100 focus:outline-none transition-colors"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Email Address (Unique)</label>
                        <input
                          type="email"
                          placeholder="e.g. sarah@madrasa.com"
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2.5 px-4 text-sm text-slate-100 focus:outline-none transition-colors"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Password</label>
                        <div className="relative flex items-center">
                          <input
                            type={showNewUserPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={newUserPassword}
                            onChange={(e) => setNewUserPassword(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2.5 pl-4 pr-10 text-sm text-slate-100 focus:outline-none transition-colors"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                            className="absolute right-3 text-slate-500 hover:text-slate-300"
                          >
                            {showNewUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Confirm Password</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={newUserConfirmPassword}
                          onChange={(e) => setNewUserConfirmPassword(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2.5 px-4 text-sm text-slate-100 focus:outline-none transition-colors"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">User Role</label>
                          <select
                            value={newUserRole}
                            onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2.5 px-3 text-xs text-slate-100 focus:outline-none transition-colors"
                          >
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Initial Status</label>
                          <select
                            value={newUserStatus}
                            onChange={(e) => setNewUserStatus(e.target.value as AccountStatus)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2.5 px-3 text-xs text-slate-100 focus:outline-none transition-colors"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl transition-all flex items-center justify-center gap-2 mt-2 shadow-md hover:shadow-emerald-500/20"
                      >
                        <UserPlus className="w-4 h-4" />
                        Create Account
                      </button>
                    </form>
                  </div>

                  {/* Right Column: User Accounts Table */}
                  <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-base text-slate-200">System User Accounts</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Showing {userAccounts.length} user account records
                        </p>
                      </div>

                      {/* Filters */}
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          placeholder="Search users..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          className="bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-1.5 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                        />
                        <select
                          value={userRoleFilter}
                          onChange={(e) => setUserRoleFilter(e.target.value)}
                          className="bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-1.5 px-2 text-xs text-slate-100 focus:outline-none"
                        >
                          <option value="">All Roles</option>
                          <option value="super_admin">Super Admin</option>
                          <option value="admin">Admin</option>
                        </select>
                        <select
                          value={userStatusFilter}
                          onChange={(e) => setUserStatusFilter(e.target.value)}
                          className="bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-1.5 px-2 text-xs text-slate-100 focus:outline-none"
                        >
                          <option value="">All Statuses</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-950 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                          <tr>
                            <th className="py-4 px-6">User Name</th>
                            <th className="py-4 px-6">Email Address</th>
                            <th className="py-4 px-6">Role</th>
                            <th className="py-4 px-6">Status</th>
                            <th className="py-4 px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50 font-medium">
                          {userAccounts
                            .filter((u) => {
                              const q = userSearch.toLowerCase().trim();
                              if (q && !u.fullName.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) {
                                return false;
                              }
                              if (userRoleFilter && u.role !== userRoleFilter) return false;
                              if (userStatusFilter && u.status !== userStatusFilter) return false;
                              return true;
                            })
                            .map((user) => {
                              const isEditing = editingUserId === user.id;

                              if (isEditing) {
                                return (
                                  <tr key={user.id} className="bg-slate-900 border-b border-emerald-500/20">
                                    <td className="py-4 px-6">
                                      <input
                                        type="text"
                                        value={editUserFullName}
                                        onChange={(e) => setEditUserFullName(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded py-1 px-2 text-xs text-slate-100 focus:outline-none"
                                      />
                                    </td>
                                    <td className="py-4 px-6">
                                      <input
                                        type="email"
                                        value={editUserEmail}
                                        onChange={(e) => setEditUserEmail(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded py-1 px-2 text-xs text-slate-100 focus:outline-none"
                                      />
                                    </td>
                                    <td className="py-4 px-6">
                                      <select
                                        value={editUserRole}
                                        onChange={(e) => setEditUserRole(e.target.value as UserRole)}
                                        className="bg-slate-950 border border-slate-800 rounded py-1 px-2 text-xs text-slate-100 focus:outline-none"
                                      >
                                        <option value="admin">Admin</option>
                                        <option value="super_admin">Super Admin</option>
                                      </select>
                                    </td>
                                    <td className="py-4 px-6">
                                      <select
                                        value={editUserStatus}
                                        onChange={(e) => setEditUserStatus(e.target.value as AccountStatus)}
                                        className="bg-slate-950 border border-slate-800 rounded py-1 px-2 text-xs text-slate-100 focus:outline-none"
                                      >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                      </select>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        <button
                                          type="button"
                                          onClick={() => handleSaveUserAccountEdit(user.id)}
                                          className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded text-xs transition-colors"
                                        >
                                          Save
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setEditingUserId(null)}
                                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded text-xs transition-colors"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              }

                              return (
                                <tr key={user.id} className="hover:bg-slate-950/40 transition-colors">
                                  <td className="py-4 px-6 font-bold text-slate-100 flex items-center gap-2">
                                    {user.fullName}
                                    {user.id === currentUser?.id && (
                                      <span className="text-[9px] bg-slate-800 text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded font-mono">
                                        You
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-4 px-6 text-slate-300 text-xs font-mono">{user.email}</td>
                                  <td className="py-4 px-6">
                                    <span
                                      className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase border ${user.role === "super_admin"
                                          ? "bg-purple-950/50 text-purple-300 border-purple-500/30"
                                          : "bg-blue-950/50 text-blue-300 border-blue-500/30"
                                        }`}
                                    >
                                      {user.role === "super_admin" ? "Super Admin" : "Admin"}
                                    </span>
                                  </td>
                                  <td className="py-4 px-6">
                                    <button
                                      type="button"
                                      onClick={() => toggleUserAccountStatus(user.id)}
                                      className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase border transition-all flex items-center gap-1 ${user.status === "active"
                                          ? "bg-emerald-950/50 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/60"
                                          : "bg-rose-950/50 text-rose-400 border-rose-500/30 hover:bg-rose-900/60"
                                        }`}
                                      title="Click to toggle account status"
                                    >
                                      {user.status === "active" ? (
                                        <>
                                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                          <span>Active</span>
                                        </>
                                      ) : (
                                        <>
                                          <Ban className="w-3 h-3 text-rose-400" />
                                          <span>Inactive</span>
                                        </>
                                      )}
                                    </button>
                                  </td>
                                  <td className="py-4 px-6 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => startEditUserAccount(user)}
                                        className="p-1.5 hover:bg-emerald-950/30 text-slate-400 hover:text-emerald-400 rounded-lg transition-colors border border-transparent hover:border-emerald-500/20"
                                        title="Edit account details"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteUserAccountModal(user.id, user.fullName)}
                                        className="p-1.5 hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
                                        title="Delete account"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
        {/* Custom Deletion Confirmation Modal */}
        <AnimatePresence>
          {deleteModalOpen && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative"
              >
                {/* Top border accent line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500 rounded-t-2xl" />

                <h3 className="text-base font-bold text-slate-100 mb-2">Confirm Deletion</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Confirm if you wish to proceed with this deletion:
                </p>

                <div className="w-full bg-slate-950 border border-slate-850 rounded-xl p-4 text-xs text-slate-300 mb-5 leading-relaxed font-semibold">
                  {deleteConfirmMessage}
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteModalOpen(false);
                      setOnConfirmDeleteAction(null);
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onConfirmDeleteAction) {
                        onConfirmDeleteAction();
                      }
                      setDeleteModalOpen(false);
                      setOnConfirmDeleteAction(null);
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-slate-100 font-bold rounded-xl text-xs shadow-md shadow-rose-500/10 hover:shadow-rose-500/20 transition-all"
                  >
                    Confirm Delete
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Student View Details Modal */}
        <AnimatePresence>
          {selectedStudentDetail && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative my-8"
              >
                {/* Decorative Accent */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-t-3xl" />

                {/* Header */}
                <div className="flex justify-between items-start gap-4 mb-6">
                  <div>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider font-mono bg-emerald-950/40 px-2 py-0.5 rounded border border-cyan-850">
                      Student Audit Profile
                    </span>
                    <h3 className="text-xl font-bold text-slate-100 mt-1">{selectedStudentDetail.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">ID: {selectedStudentDetail.id} | {selectedStudentDetail.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedStudentDetail(null)}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors border border-slate-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body */}
                <div className="flex flex-col gap-6 max-h-[60vh] overflow-y-auto pr-1">
                  {/* 1. Academic Details Section */}
                  <div className="flex flex-col gap-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-emerald-400" />
                      Academic Standing & Enrollment
                    </h4>
                    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-950/60 border border-slate-850 rounded-2xl text-xs">
                      <div>
                        <span className="text-slate-500 font-semibold block">Registered Class:</span>
                        <span className="text-slate-200 font-bold mt-0.5 block">{selectedStudentDetail.gradeGroup}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-semibold block">Current Year:</span>
                        <span className="text-slate-200 font-mono font-bold mt-0.5 block">{selectedStudentDetail.academicYear || "2025–2026"}</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Examinations Transcript */}
                  <div className="flex flex-col gap-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                      Examination Report Transcript
                    </h4>
                    {(() => {
                      const studentExams = exams.filter((e) => e.studentId === selectedStudentDetail.id);
                      if (studentExams.length === 0) {
                        return (
                          <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl text-center text-xs text-slate-500 italic">
                            No grades or exam scores recorded for this student yet.
                          </div>
                        );
                      }

                      // Group exams by term
                      const examsByTerm: { [term: string]: Exam[] } = {};
                      studentExams.forEach((e) => {
                        if (!examsByTerm[e.term]) examsByTerm[e.term] = [];
                        examsByTerm[e.term].push(e);
                      });

                      return (
                        <div className="flex flex-col gap-4">
                          {Object.keys(examsByTerm).sort().map((term) => {
                            const termExams = examsByTerm[term];
                            const total = termExams.reduce((sum, e) => sum + parseInt(e.score.toString() || "0", 10), 0);
                            const average = termExams.length > 0 ? total / termExams.length : 0;
                            const grade = calculateGrade(average);

                            return (
                              <div key={term} className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4 flex flex-col gap-3">
                                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                                  <span className="text-xs font-extrabold text-slate-300 font-mono uppercase">{term}</span>
                                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${getGradeBadge(grade)}`}>
                                    {grade}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium">
                                  {termExams.map((e) => (
                                    <div key={e.id} className="flex justify-between items-center p-2 bg-slate-900/50 rounded-lg">
                                      <span className="text-slate-400 font-semibold">{e.subject}</span>
                                      <span className="font-mono text-emerald-400 font-bold">{e.score}%</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex justify-between items-center pt-2 text-xs border-t border-slate-900 font-bold font-mono">
                                  <span className="text-slate-500">Average Score:</span>
                                  <span className="text-slate-200">{average.toFixed(1)}% (Total: {total})</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {/* 3. Fee Ledger */}
                  <div className="flex flex-col gap-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-emerald-400" />
                      Billing & Fees Ledger Statements
                    </h4>
                    {(() => {
                      const studentFees = fees.filter((f) => f.studentId === selectedStudentDetail.id);
                      const totalCharges = studentFees
                        .filter((f) => f.transactionType === "Charge")
                        .reduce((sum, f) => sum + (parseFloat(String(f.amount)) || 0), 0);
                      const totalPayments = studentFees
                        .filter((f) => f.transactionType === "Payment")
                        .reduce((sum, f) => sum + (parseFloat(String(f.paid)) || 0), 0);
                      const outstandingBalance = Math.max(0, totalCharges - totalPayments);

                      return (
                        <div className="flex flex-col gap-4">
                          {/* Summary metrics row */}
                          <div className="grid grid-cols-3 gap-2 text-center p-3 bg-slate-950 border border-slate-850 rounded-2xl text-xs font-mono font-bold">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] uppercase font-bold text-slate-500">Total Charges</span>
                              <span className="text-slate-200">{formatCurrency(totalCharges)}</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] uppercase font-bold text-slate-500">Total Payments</span>
                              <span className="text-emerald-400">{formatCurrency(totalPayments)}</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] uppercase font-bold text-slate-500">Outstanding Balance</span>
                              <span className="text-rose-400">{formatCurrency(outstandingBalance)}</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setShowInlineForm(showInlineForm === "charge" ? "" : "charge");
                                setInlineChargeDate(new Date().toISOString().split("T")[0]);
                              }}
                              className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-955 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Add Charge
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowInlineForm(showInlineForm === "payment" ? "" : "payment");
                                setInlinePaymentDate(new Date().toISOString().split("T")[0]);
                              }}
                              className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-955 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Record Payment
                            </button>
                          </div>

                          {/* Inline Form: Add Charge */}
                          {showInlineForm === "charge" && (
                            <form onSubmit={handleInlineChargeSubmit} className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl flex flex-col gap-3">
                              <h5 className="text-[10px] font-bold text-amber-500 uppercase tracking-wider font-mono">Create Charge</h5>

                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase">Charge Description</label>
                                <input
                                  type="text"
                                  placeholder="Description (e.g. Monthly Tuition)"
                                  value={inlineChargeDescription}
                                  onChange={(e) => setInlineChargeDescription(e.target.value)}
                                  className="bg-slate-900 border border-slate-800 focus:border-emerald-500/50 rounded-lg py-1.5 px-2.5 text-xs text-slate-100 focus:outline-none"
                                  required
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase">Amount ($)</label>
                                  <input
                                    type="number"
                                    placeholder="Amount"
                                    value={inlineChargeAmount}
                                    onChange={(e) => setInlineChargeAmount(e.target.value)}
                                    className="bg-slate-900 border border-slate-800 focus:border-emerald-500/50 rounded-lg py-1.5 px-2.5 text-xs text-slate-100 focus:outline-none font-bold"
                                    required
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase">Charge Date</label>
                                  <input
                                    type="date"
                                    value={inlineChargeDate}
                                    onChange={(e) => setInlineChargeDate(e.target.value)}
                                    className="bg-slate-900 border border-slate-800 focus:border-emerald-500/50 rounded-lg py-1.5 px-2.5 text-xs text-slate-100 focus:outline-none"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase">Notes (Optional)</label>
                                <input
                                  type="text"
                                  placeholder="Notes"
                                  value={inlineChargeNotes}
                                  onChange={(e) => setInlineChargeNotes(e.target.value)}
                                  className="bg-slate-900 border border-slate-800 focus:border-emerald-500/50 rounded-lg py-1.5 px-2.5 text-xs text-slate-100 focus:outline-none"
                                />
                              </div>

                              <div className="flex justify-end gap-2 pt-2 border-t border-slate-900">
                                <button
                                  type="button"
                                  onClick={() => setShowInlineForm("")}
                                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg text-xs"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-955 font-bold rounded-lg text-xs"
                                >
                                  Submit Charge
                                </button>
                              </div>
                            </form>
                          )}

                          {/* Inline Form: Record Payment */}
                          {showInlineForm === "payment" && (
                            <form onSubmit={handleInlinePaymentSubmit} className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl flex flex-col gap-3">
                              <h5 className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider font-mono">Record Payment</h5>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase font-bold font-mono">Amount Paid ($)</label>
                                  <input
                                    type="number"
                                    placeholder="Amount"
                                    value={inlinePaymentAmount}
                                    onChange={(e) => setInlinePaymentAmount(e.target.value)}
                                    className="bg-slate-900 border border-slate-800 focus:border-emerald-500/50 rounded-lg py-1.5 px-2.5 text-xs text-slate-100 focus:outline-none font-bold"
                                    required
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase">Payment Date</label>
                                  <input
                                    type="date"
                                    value={inlinePaymentDate}
                                    onChange={(e) => setInlinePaymentDate(e.target.value)}
                                    className="bg-slate-900 border border-slate-800 focus:border-emerald-500/50 rounded-lg py-1.5 px-2.5 text-xs text-slate-100 focus:outline-none"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase">Method</label>
                                  <select
                                    value={inlinePaymentMethod}
                                    onChange={(e) => setInlinePaymentMethod(e.target.value)}
                                    className="bg-slate-900 border border-slate-800 focus:border-emerald-500/50 rounded-lg py-1.5 px-2.5 text-xs text-slate-100 focus:outline-none cursor-pointer"
                                    required
                                  >
                                    <option value="EVCplus">EVCplus</option>
                                    <option value="eDahab">eDahab</option>
                                    <option value="ZAAD">ZAAD</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Premier Wallet">Premier Wallet</option>
                                  </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase">Notes (Optional)</label>
                                  <input
                                    type="text"
                                    placeholder="Notes"
                                    value={inlinePaymentNotes}
                                    onChange={(e) => setInlinePaymentNotes(e.target.value)}
                                    className="bg-slate-900 border border-slate-800 focus:border-emerald-500/50 rounded-lg py-1.5 px-2.5 text-xs text-slate-100 focus:outline-none"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end gap-2 pt-2 border-t border-slate-900">
                                <button
                                  type="button"
                                  onClick={() => setShowInlineForm("")}
                                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg text-xs"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs"
                                >
                                  Submit Payment
                                </button>
                              </div>
                            </form>
                          )}

                          {/* Charges history list */}
                          <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Charge History</span>
                            <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto">
                              {studentFees.filter(f => f.transactionType === "Charge").map((f) => (
                                <div key={f.id} className="flex justify-between items-center p-3 bg-slate-950/60 border border-slate-850 rounded-xl text-xs">
                                  <div className="flex flex-col">
                                    <span className="font-bold text-slate-200">{f.feeName}</span>
                                    <span className="text-[10px] text-slate-500 font-mono mt-0.5">Date: {new Date(f.date || "").toLocaleDateString()}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="font-mono text-slate-200 font-bold">{formatCurrency(f.amount)}</span>
                                    <span className="text-[9px] text-slate-500 font-mono block mt-0.5">Ref: {f.referenceNumber}</span>
                                  </div>
                                </div>
                              ))}
                              {studentFees.filter(f => f.transactionType === "Charge").length === 0 && (
                                <div className="p-3 bg-slate-950/20 border border-slate-900 rounded-xl text-center text-xs text-slate-500 italic">
                                  No charges found.
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Payments history list */}
                          <div className="flex flex-col gap-2 mt-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Payment History</span>
                            <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto">
                              {studentFees.filter(f => f.transactionType === "Payment").map((f) => (
                                <div key={f.id} className="flex justify-between items-center p-3 bg-slate-950/60 border border-slate-850 rounded-xl text-xs">
                                  <div className="flex flex-col">
                                    <span className="font-bold text-emerald-400">Payment Received ({f.paymentMethod})</span>
                                    <span className="text-[10px] text-slate-500 font-mono mt-0.5">Date: {new Date(f.date || "").toLocaleDateString()}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="font-mono text-emerald-400 font-bold">{formatCurrency(f.paid)}</span>
                                    <span className="text-[9px] text-slate-500 font-mono block mt-0.5">Ref: {f.referenceNumber}</span>
                                  </div>
                                </div>
                              ))}
                              {studentFees.filter(f => f.transactionType === "Payment").length === 0 && (
                                <div className="p-3 bg-slate-950/20 border border-slate-900 rounded-xl text-center text-xs text-slate-500 italic">
                                  No payments found.
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end border-t border-slate-800 pt-5 mt-6">
                  <button
                    type="button"
                    onClick={() => setSelectedStudentDetail(null)}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
                  >
                    Close Profile Audit
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
