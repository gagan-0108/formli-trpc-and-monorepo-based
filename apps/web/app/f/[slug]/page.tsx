"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { resolveThemeStyles } from "~/lib/theme";
import { FieldRenderer } from "./_components/field-renderer";

type FormStep = "welcome" | "email" | "question" | "submitting" | "thankyou";

// ─── Validation ───────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateField(field: { type: string; required: boolean }, value: string): string | null {
  if (field.required && (!value || value.trim() === "")) return "This field is required";
  if (value && field.type === "email" && !EMAIL_REGEX.test(value)) return "Please enter a valid email";
  if (value && field.type === "number" && isNaN(Number(value))) return "Please enter a valid number";
  return null;
}

// ─── Page ─────────────────────────────────────────────────────
export default function PublicFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();

  const { data: form, isLoading, error } = trpc.form.getBySlug.useQuery({ slug });
  const submitMutation = trpc.response.submit.useMutation({
    onSuccess: () => setStep("thankyou"),
    onError: (err) => {
      toast.error(err.message);
      setStep("question");
    },
  });

  const [step, setStep] = useState<FormStep>("welcome");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [email, setEmail] = useState("");

  const fields = form?.fields || [];
  const currentField = fields[currentQuestion];
  const totalQuestions = fields.length;
  const hasWelcome = !!(form?.welcomeTitle || form?.welcomeDescription);
  const collectEmail = form?.collectEmail || false;

  // Theme
  const theme = resolveThemeStyles(form?.theme as any);
  const { primaryColor, textColor } = theme;
  const bgColor = theme.container.backgroundColor as string;

  // Progress
  const progress = totalQuestions > 0
    ? ((currentQuestion + (step === "thankyou" ? 1 : 0)) / totalQuestions) * 100
    : 0;

  // Auto-skip welcome if no welcome content
  useEffect(() => {
    if (form && !hasWelcome && !collectEmail) setStep("question");
    else if (form && !hasWelcome && collectEmail) setStep("email");
  }, [form, hasWelcome, collectEmail]);

  // ─── Navigation ───────────────────────────────────────────
  const goNext = useCallback(() => {
    if (step === "welcome") {
      setStep(collectEmail ? "email" : "question");
      return;
    }

    if (step === "email") {
      if (collectEmail && email.trim() && !EMAIL_REGEX.test(email)) {
        setErrors((prev) => ({ ...prev, _email: "Please enter a valid email" }));
        return;
      }
      setErrors((prev) => ({ ...prev, _email: "" }));
      setStep("question");
      return;
    }

    if (!currentField) return;
    const value = answers[currentField.id] || "";
    const fieldError = validateField(currentField, value);
    if (fieldError) {
      setErrors((prev) => ({ ...prev, [currentField.id]: fieldError }));
      return;
    }
    setErrors((prev) => ({ ...prev, [currentField.id]: "" }));

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((q) => q + 1);
    } else {
      handleSubmit();
    }
  }, [step, currentField, answers, currentQuestion, totalQuestions, email, collectEmail]);

  const goPrev = useCallback(() => {
    if (step === "question" && currentQuestion > 0) setCurrentQuestion((q) => q - 1);
    else if (step === "question" && currentQuestion === 0 && collectEmail) setStep("email");
    else if (step === "question" && currentQuestion === 0 && hasWelcome) setStep("welcome");
    else if (step === "email" && hasWelcome) setStep("welcome");
  }, [step, currentQuestion, collectEmail, hasWelcome]);

  const handleSubmit = () => {
    if (!form) return;
    setStep("submitting");
    const answerList = fields
      .map((f) => ({ fieldId: f.id, value: answers[f.id] || "" }))
      .filter((a) => a.value.trim() !== "");
    submitMutation.mutate({
      formId: form.id,
      answers: answerList,
      ...(email ? { respondentEmail: email } : {}),
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext]);

  // ─── Loading / Error States ───────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: bgColor }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: textColor }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-black text-white">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Form Not Available</h1>
          <p className="text-zinc-500 text-sm mb-6">
            {error.message || "This form is not currently accepting responses."}
          </p>
          <Button variant="outline" onClick={() => router.push("/")} className="border-zinc-800 text-zinc-400 rounded-full">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (!form || fields.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-black text-white">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">No Questions</h1>
          <p className="text-zinc-500 text-sm">This form has no questions to fill out.</p>
        </div>
      </div>
    );
  }

  // ─── Main Render ──────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={theme.container}>
      {/* Progress Bar */}
      {step === "question" && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div
            className="h-0.5 transition-all duration-500 ease-out"
            style={{ width: `${progress}%`, backgroundColor: primaryColor }}
          />
        </div>
      )}

      {/* ===== WELCOME ===== */}
      {step === "welcome" && (
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-lg text-center form-slide-enter">
            <h1 className="text-3xl sm:text-5xl font-bold mb-4 leading-tight">
              {form.welcomeTitle || form.title}
            </h1>
            {(form.welcomeDescription || form.description) && (
              <p className="text-lg opacity-60 mb-10 leading-relaxed">
                {form.welcomeDescription || form.description}
              </p>
            )}
            <Button
              onClick={goNext}
              size="lg"
              className="rounded-full px-10 h-12 text-base"
              style={{ backgroundColor: primaryColor, color: bgColor }}
            >
              {form.welcomeButtonText || "Start"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* ===== EMAIL ===== */}
      {step === "email" && (
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-lg w-full form-slide-enter">
            <div className="flex items-center gap-2 mb-4 opacity-50 text-sm">Before we start</div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">What&apos;s your email?</h2>
            <p className="text-sm opacity-50 mb-8">So we can follow up on your response.</p>
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, _email: "" }));
              }}
              placeholder="name@example.com"
              className="text-lg border-0 border-b-2 rounded-none bg-transparent focus-visible:ring-0 px-0 h-auto py-2"
              style={{ borderColor: `${textColor}20` }}
              autoFocus
            />
            {errors._email && (
              <p className="text-sm mt-3 text-red-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                {errors._email}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ===== QUESTION ===== */}
      {step === "question" && currentField && (
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-lg">
            <div key={currentField.id} className="form-slide-enter">
              <div className="flex items-center gap-2 mb-4 opacity-40 text-sm">
                <span>{currentQuestion + 1} → {totalQuestions}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                {currentField.label}
                {currentField.required && <span style={{ color: primaryColor }}> *</span>}
              </h2>
              {currentField.description && (
                <p className="text-sm opacity-50 mb-6">{currentField.description}</p>
              )}
              <div className="mt-6">
                <FieldRenderer
                  field={currentField}
                  value={answers[currentField.id] || ""}
                  onChange={(value) => {
                    setAnswers((prev) => ({ ...prev, [currentField.id]: value }));
                    setErrors((prev) => ({ ...prev, [currentField.id]: "" }));
                  }}
                  primaryColor={primaryColor}
                  textColor={textColor}
                />
              </div>
              {errors[currentField.id] && (
                <p className="text-sm mt-3 text-red-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  {errors[currentField.id]}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== SUBMITTING ===== */}
      {step === "submitting" && (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
        </div>
      )}

      {/* ===== THANK YOU ===== */}
      {step === "thankyou" && (
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-md text-center form-slide-enter">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-8"
              style={{ border: `1px solid ${textColor}20` }}
            >
              <Check className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold mb-3">{form.thankYouTitle || "Thank you"}</h1>
            <p className="opacity-50 mb-8">{form.thankYouMessage || "Your response has been submitted."}</p>
            {form.thankYouButtonText && form.thankYouButtonUrl && (
              <a href={form.thankYouButtonUrl} target="_blank" rel="noopener noreferrer">
                <Button
                  className="rounded-full px-8 mb-4"
                  style={{ backgroundColor: primaryColor, color: bgColor }}
                >
                  {form.thankYouButtonText}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
            )}
            <div className="mt-4">
              <a href="/" className="text-xs opacity-30 hover:opacity-50 transition-opacity">
                Create your own form with formli
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ===== NAVIGATION FOOTER ===== */}
      {(step === "question" || step === "email") && (
        <div className="sticky bottom-0 p-4">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={goPrev}
              disabled={step === "email" && !hasWelcome}
              className="opacity-60 hover:opacity-100"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <Button
                onClick={goNext}
                disabled={submitMutation.isPending}
                className="rounded-full px-6"
                style={{ backgroundColor: primaryColor, color: bgColor }}
              >
                {step === "question" && currentQuestion === totalQuestions - 1 ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Submit
                  </>
                ) : (
                  <>
                    OK
                    <Check className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
              <span className="text-xs opacity-30 hidden sm:inline">
                press <kbd className="px-1.5 py-0.5 rounded" style={{ backgroundColor: `${textColor}10` }}>Enter ↵</kbd>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Branding */}
      {step !== "thankyou" && (
        <div className="text-center pb-4">
          <a href="/" className="text-xs opacity-20 hover:opacity-40 transition-opacity">
            Powered by formli
          </a>
        </div>
      )}
    </div>
  );
}
