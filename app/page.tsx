"use client";

import { useEffect, useState } from "react";

type View = "today" | "progress" | "plan" | "settings";
type CheckInResult = "on-plan" | "slip" | null;
type SupportStep = "pause" | "breathe" | "replace" | "done";
type Profile = {
  displayName: string;
  habit: string;
  approach: string;
  reason: string;
  dangerDays: string;
  dangerStart: string;
  dangerEnd: string;
  replacementPlan: string;
  reminderEnabled: boolean;
  reminderDays: string;
  reminderTime: string;
};
type CheckIn = {
  id: number;
  result: "on-plan" | "slip";
  urgeLevel: number;
  trigger: string;
  note: string;
  createdAt: string;
};

const triggers = ["After work", "Stress", "Boredom", "Around others"];

const habitOptions = [
  "Alcohol",
  "Weed",
  "Nicotine or vaping",
  "Gambling",
  "Social media",
  "Overspending",
  "Porn",
  "Junk food",
];

const reasonOptions = [
  "I want better health and energy",
  "I want to feel in control again",
  "I want to save money",
  "I want stronger relationships",
  "I want more time and focus",
  "I want to prove I can change",
];

const replacementOptions = [
  "Take a 10-minute walk",
  "Call or text someone I trust",
  "Eat, shower, then exercise",
  "Drink water and leave the situation",
  "Do something with my hands for 10 minutes",
  "Go somewhere the habit is not available",
];

const planOptions = [
  {
    name: "Quit completely",
    detail: "Stop on a date you choose and build a plan around staying stopped.",
  },
  {
    name: "Reduce gradually",
    detail: "Work down from your current baseline with realistic targets.",
  },
  {
    name: "Set boundaries",
    detail: "Choose limits around days, situations, time, or amount.",
  },
  {
    name: "Take a break",
    detail: "Pause for a set period, then decide what comes next.",
  },
] as const;

const navItems: { id: View; label: string; icon: IconName }[] = [
  { id: "today", label: "Today", icon: "home" },
  { id: "progress", label: "Progress", icon: "chart" },
  { id: "plan", label: "Plan", icon: "calendar" },
  { id: "settings", label: "Settings", icon: "settings" },
];

type IconName =
  | "home"
  | "chart"
  | "calendar"
  | "settings"
  | "lock"
  | "clipboard"
  | "clock"
  | "lifebuoy"
  | "check"
  | "arrow"
  | "shield"
  | "spark"
  | "bell"
  | "download"
  | "trash"
  | "close";

function Icon({
  name,
  size = 24,
  strokeWidth = 1.9,
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  const paths: Record<IconName, React.ReactNode> = {
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10M9 20v-6h6v6" />
      </>
    ),
    chart: (
      <>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20V7" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08A1.7 1.7 0 0 0 8.94 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.57 15 1.7 1.7 0 0 0 3 14H3v-4h.08A1.7 1.7 0 0 0 4.6 8.94a1.7 1.7 0 0 0-.34-1.88L4.2 7l2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.57 1.7 1.7 0 0 0 10 3V3h4v.08A1.7 1.7 0 0 0 15.06 4.6a1.7 1.7 0 0 0 1.88-.34L17 4.2 19.83 7l-.06.06A1.7 1.7 0 0 0 19.43 9 1.7 1.7 0 0 0 21 10h.08v4H21a1.7 1.7 0 0 0-1.6 1Z" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
      </>
    ),
    clipboard: (
      <>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 4.5V3h6v1.5M9 10l1.5 1.5L14 8M9 16h6" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v6l4 2" />
      </>
    ),
    lifebuoy: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" />
        <path d="m5.6 5.6 3.6 3.6M14.8 14.8l3.6 3.6M18.4 5.6l-3.6 3.6M9.2 14.8l-3.6 3.6" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    arrow: <path d="m9 18 6-6-6-6" />,
    shield: (
      <>
        <path d="M12 3 4.5 6v5.4c0 4.7 3.2 8.2 7.5 9.6 4.3-1.4 7.5-4.9 7.5-9.6V6L12 3Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3 1.2 4.1L17 9l-3.8 1.9L12 15l-1.2-4.1L7 9l3.8-1.9L12 3Z" />
        <path d="m19 15 .6 2.1L22 18l-2.4.9L19 21l-.6-2.1L16 18l2.4-.9L19 15Z" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12M7 10l5 5 5-5M4 21h16" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6" />
      </>
    ),
    close: <path d="m6 6 12 12M18 6 6 18" />,
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function formatTimer(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function Home() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [view, setView] = useState<View>("today");
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [editPlanOpen, setEditPlanOpen] = useState(false);
  const [editAnswersOpen, setEditAnswersOpen] = useState(false);
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [checkInResult, setCheckInResult] = useState<CheckInResult>(null);
  const [urgeLevel, setUrgeLevel] = useState(3);
  const [selectedTrigger, setSelectedTrigger] = useState("After work");
  const [supportStep, setSupportStep] = useState<SupportStep>("pause");
  const [secondsLeft, setSecondsLeft] = useState(600);
  const [replacement, setReplacement] = useState("Eat, shower, then train");
  const [planMethod, setPlanMethod] = useState("Quit completely");
  const [draftMethod, setDraftMethod] = useState("Quit completely");
  const [completedCheckIn, setCompletedCheckIn] = useState(false);
  const [toast, setToast] = useState("");
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  });

  useEffect(() => {
    fetch("/api/profile", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(response.status === 401 ? "Please sign in to continue." : "Could not load your private plan.");
        return response.json();
      })
      .then((data) => {
        setProfile(data.profile);
        if (data.profile) {
          setPlanMethod(data.profile.approach);
          setReplacement(data.profile.replacementPlan);
        }
      })
      .catch((error: Error) => setProfileError(error.message))
      .finally(() => setProfileLoading(false));
    fetch("/api/check-ins", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : { checkIns: [] })
      .then((data) => setCheckIns(data.checkIns ?? []))
      .catch(() => setCheckIns([]));
  }, []);

  useEffect(() => {
    if (!supportOpen || supportStep === "done" || secondsLeft <= 0) return;
    const timer = window.setInterval(
      () => setSecondsLeft((value) => Math.max(0, value - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [supportOpen, supportStep, secondsLeft]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!checkInOpen && !supportOpen && !editPlanOpen && !remindersOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCheckInOpen(false);
        setSupportOpen(false);
        setEditPlanOpen(false);
        setRemindersOpen(false);
      }
    };
    document.body.classList.add("modal-open");
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [checkInOpen, supportOpen, editPlanOpen, remindersOpen]);

  const openSupport = () => {
    setSecondsLeft(600);
    setSupportStep("pause");
    setSupportOpen(true);
  };

  const saveCheckIn = async () => {
    if (!checkInResult) return;
    const response = await fetch("/api/check-ins", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        result: checkInResult,
        urgeLevel,
        trigger: selectedTrigger,
      }),
    });
    if (!response.ok) {
      setToast("Your check-in could not be saved. Try again.");
      return;
    }
    const data = await response.json();
    setCheckIns((current) => [data.checkIn, ...current]);
    setCompletedCheckIn(true);
    setCheckInOpen(false);
    setCheckInResult(null);
    setToast(
      checkInResult === "slip"
        ? "Logged honestly. Your next choice starts now."
        : "Check-in saved. Keep going.",
    );
  };

  const savePlan = () => {
    setPlanMethod(draftMethod);
    setEditPlanOpen(false);
    setToast("Your plan was updated.");
  };

  if (profileLoading) {
    return <main className="loading-screen"><span className="brand-mark">Q</span><p>Loading your private plan…</p></main>;
  }

  if (profileError) {
    return <main className="loading-screen"><span className="brand-mark">Q</span><h1>Quit Anything</h1><p>{profileError}</p><a className="primary-button" href="/signin-with-chatgpt?return_to=%2F">Sign in with ChatGPT</a></main>;
  }

  if (!profile) {
    return <Onboarding onComplete={(saved) => {
      setProfile(saved);
      setPlanMethod(saved.approach);
      setReplacement(saved.replacementPlan);
    }} />;
  }

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Main navigation">
        <button
          className="brand"
          onClick={() => setView("today")}
          aria-label="Quit Anything home"
        >
          <span className="brand-mark">Q</span>
          <span>Quit Anything</span>
        </button>
        <nav className="side-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${view === item.id ? "active" : ""}`}
              onClick={() => setView(item.id)}
              aria-current={view === item.id ? "page" : undefined}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="side-privacy">
          <Icon name="lock" size={18} />
          <div>
            <strong>Private by default</strong>
            <span>Only you can see this.</span>
          </div>
        </div>
      </aside>

      <div className="main-column">
        <header className="mobile-header">
          <button
            className="brand"
            onClick={() => setView("today")}
            aria-label="Quit Anything home"
          >
            <span className="brand-mark">Q</span>
            <span>Quit Anything</span>
          </button>
          <span className="privacy-pill">
            <Icon name="lock" size={15} />
            Private
          </span>
        </header>

        <div className="content">
          {view === "today" && (
            <TodayView
              greeting={greeting}
              profile={profile}
              completedCheckIn={completedCheckIn}
              openCheckIn={() => {
                setCheckInResult(null);
                setCheckInOpen(true);
              }}
              openSupport={openSupport}
              goToProgress={() => setView("progress")}
              checkIns={checkIns}
            />
          )}
          {view === "progress" && <ProgressView checkIns={checkIns} />}
          {view === "plan" && (
            <PlanView
              profile={profile}
              planMethod={planMethod}
              openEdit={() => {
                setDraftMethod(planMethod);
                setEditPlanOpen(true);
              }}
              openSupport={openSupport}
            />
          )}
          {view === "settings" && (
            <SettingsView
              profile={profile}
              openReminders={() => setRemindersOpen(true)}
              editAnswers={() => setEditAnswersOpen(true)}
            />
          )}
        </div>
      </div>

      <nav className="bottom-nav" aria-label="Mobile navigation">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={view === item.id ? "active" : ""}
            onClick={() => setView(item.id)}
            aria-current={view === item.id ? "page" : undefined}
          >
            <Icon name={item.icon} size={21} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {checkInOpen && (
        <CheckInDialog
          result={checkInResult}
          setResult={setCheckInResult}
          urgeLevel={urgeLevel}
          setUrgeLevel={setUrgeLevel}
          selectedTrigger={selectedTrigger}
          setSelectedTrigger={setSelectedTrigger}
          close={() => setCheckInOpen(false)}
          save={saveCheckIn}
        />
      )}

      {supportOpen && (
        <SupportDialog
          step={supportStep}
          setStep={setSupportStep}
          secondsLeft={secondsLeft}
          replacement={replacement}
          setReplacement={setReplacement}
          close={() => setSupportOpen(false)}
        />
      )}

      {editPlanOpen && (
        <EditPlanDialog
          draftMethod={draftMethod}
          setDraftMethod={setDraftMethod}
          close={() => setEditPlanOpen(false)}
          save={savePlan}
        />
      )}
      {editAnswersOpen && (
        <div className="full-screen-editor">
          <Onboarding
            initialProfile={profile}
            editing
            onCancel={() => setEditAnswersOpen(false)}
            onComplete={(saved) => {
              setProfile(saved);
              setPlanMethod(saved.approach);
              setReplacement(saved.replacementPlan);
              setEditAnswersOpen(false);
              setToast("Your answers were updated.");
            }}
          />
        </div>
      )}
      {remindersOpen && (
        <ReminderDialog
          profile={profile}
          close={() => setRemindersOpen(false)}
          save={(saved) => {
            setProfile(saved);
            setRemindersOpen(false);
            setToast("Your reminder schedule was saved.");
          }}
        />
      )}

      {toast && (
        <div className="toast" role="status">
          <span className="toast-check">
            <Icon name="check" size={16} strokeWidth={2.4} />
          </span>
          {toast}
        </div>
      )}
    </main>
  );
}

function Onboarding({
  onComplete,
  initialProfile,
  editing = false,
  onCancel,
}: {
  onComplete: (profile: Profile) => void;
  initialProfile?: Profile;
  editing?: boolean;
  onCancel?: () => void;
}) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(() => ({
    displayName: initialProfile?.displayName ?? "",
    habit: initialProfile?.habit ?? "",
    approach: initialProfile?.approach ?? "Quit completely",
    reason: initialProfile?.reason ?? "",
    dangerDays: initialProfile?.dangerDays
      ? initialProfile.dangerDays.split(",").filter(Boolean)
      : [] as string[],
    dangerStart: initialProfile?.dangerStart ?? "17:00",
    dangerEnd: initialProfile?.dangerEnd ?? "20:00",
    replacementPlan: initialProfile?.replacementPlan ?? "",
    reminderEnabled: initialProfile?.reminderEnabled ?? true,
    reminderDays: initialProfile?.reminderDays ?? "Mon,Tue,Wed,Thu,Fri",
    reminderTime: initialProfile?.reminderTime ?? "16:30",
  }));
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save your plan.");
      onComplete(data.profile);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save your plan.");
    } finally {
      setSaving(false);
    }
  };

  const canContinue =
    (step === 0 && form.habit.trim()) ||
    step === 1 ||
    (step === 2 && form.reason.trim()) ||
    (step === 3 && form.dangerDays.length > 0) ||
    (step === 4 && form.replacementPlan.trim());

  return (
    <main className="onboarding-shell">
      <div className="onboarding-brand">
        <span className="brand-mark">Q</span> Quit Anything
        {editing && <button className="editor-close" onClick={onCancel} aria-label="Close editor"><Icon name="close" size={19} /></button>}
      </div>
      <section className="onboarding-card">
        <div className="onboarding-progress"><span style={{ width: `${((step + 1) / 5) * 100}%` }} /></div>
        <p className="eyebrow">{editing ? "EDIT YOUR ANSWERS" : "YOUR PRIVATE PLAN"} · {step + 1} OF 5</p>
        {step === 0 && <>
          <h1>What do you want to change?</h1>
          <p>Choose an option or write your own. Only you can see this.</p>
          <div className="preset-grid" aria-label="Common habits and behaviors">
            {habitOptions.map((option) => (
              <button
                type="button"
                key={option}
                className={form.habit === option ? "selected" : ""}
                aria-pressed={form.habit === option}
                onClick={() => setForm({ ...form, habit: option })}
              >
                {option}
              </button>
            ))}
          </div>
          <label>Or write your own<input value={form.habit} onChange={(event) => setForm({ ...form, habit: event.target.value })} placeholder="Another habit or behavior" /></label>
          <label>What should we call you? <span>(optional)</span><input value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} placeholder="Your first name" /></label>
        </>}
        {step === 1 && <>
          <h1>How do you want to approach it?</h1>
          <p>You can change this later without losing your progress.</p>
          <div className="choice-list">{planOptions.map((option) => <button key={option.name} className={form.approach === option.name ? "selected" : ""} onClick={() => setForm({ ...form, approach: option.name })}><strong>{option.name}</strong><span>{option.detail}</span></button>)}</div>
        </>}
        {step === 2 && <>
          <h1>Why does this matter to you?</h1>
          <p>Pick the reason that feels closest. We’ll show it when an urge hits.</p>
          <div className="preset-list" aria-label="Common reasons for changing">
            {reasonOptions.map((option) => (
              <button
                type="button"
                key={option}
                className={form.reason === option ? "selected" : ""}
                aria-pressed={form.reason === option}
                onClick={() => setForm({ ...form, reason: option })}
              >
                {option}
              </button>
            ))}
          </div>
          <label>Or write your own<textarea value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} placeholder="Tell us what matters most to you…" /></label>
        </>}
        {step === 3 && <>
          <h1>When are you most at risk?</h1>
          <p>Pick the days and time when support should be ready.</p>
          <div className="day-picker">{days.map((day) => <button key={day} className={form.dangerDays.includes(day) ? "selected" : ""} onClick={() => setForm({ ...form, dangerDays: form.dangerDays.includes(day) ? form.dangerDays.filter((item) => item !== day) : [...form.dangerDays, day] })}>{day}</button>)}</div>
          <div className="time-row"><label>Starts<input type="time" value={form.dangerStart} onChange={(event) => setForm({ ...form, dangerStart: event.target.value })} /></label><label>Ends<input type="time" value={form.dangerEnd} onChange={(event) => setForm({ ...form, dangerEnd: event.target.value })} /></label></div>
        </>}
        {step === 4 && <>
          <h1>What will you do instead?</h1>
          <p>Choose a small action you can start immediately.</p>
          <div className="preset-list" aria-label="Replacement actions">
            {replacementOptions.map((option) => (
              <button
                type="button"
                key={option}
                className={form.replacementPlan === option ? "selected" : ""}
                aria-pressed={form.replacementPlan === option}
                onClick={() => setForm({ ...form, replacementPlan: option })}
              >
                {option}
              </button>
            ))}
          </div>
          <label>Or write your own<textarea value={form.replacementPlan} onChange={(event) => setForm({ ...form, replacementPlan: event.target.value })} placeholder="Describe your first next move…" /></label>
          <div className="privacy-note"><Icon name="lock" size={18} /><span>Your answers are saved privately to your account.</span></div>
        </>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="onboarding-actions">
          {step > 0 && <button className="secondary-button" onClick={() => setStep(step - 1)}>Back</button>}
          <button className="primary-button" disabled={!canContinue || saving} onClick={() => step < 4 ? setStep(step + 1) : save()}>{saving ? "Saving…" : step === 4 ? (editing ? "Save my answers" : "Start my plan") : "Continue"}</button>
        </div>
      </section>
    </main>
  );
}

function PageHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <span className="desktop-privacy">
        <Icon name="lock" size={19} />
        Private by default
      </span>
    </div>
  );
}

function TodayView({
  greeting,
  profile,
  completedCheckIn,
  openCheckIn,
  openSupport,
  goToProgress,
  checkIns,
}: {
  greeting: string;
  profile: Profile;
  completedCheckIn: boolean;
  openCheckIn: () => void;
  openSupport: () => void;
  goToProgress: () => void;
  checkIns: CheckIn[];
}) {
  const onPlan = checkIns.filter((item) => item.result === "on-plan").length;
  const rate = checkIns.length ? Math.round((onPlan / checkIns.length) * 100) : 0;
  return (
    <>
      <PageHeading
        title={`${greeting}, ${profile.displayName.split(" ")[0]}`}
        subtitle="One choice at a time."
      />

      <section className="today-grid" aria-label="Today overview">
        <article className="focus-card plan-card">
          <div className="icon-orb lime">
            <Icon name={completedCheckIn ? "check" : "clipboard"} />
          </div>
          <p className="card-label lime-text">
            {completedCheckIn ? "CHECK-IN COMPLETE" : "YOUR PLAN"}
          </p>
          <h2>
            {completedCheckIn
              ? "You showed up for yourself"
              : profile.replacementPlan}
          </h2>
          <button
            className={`primary-button ${completedCheckIn ? "complete" : ""}`}
            onClick={openCheckIn}
          >
            {completedCheckIn ? "Review check-in" : "Start check-in"}
          </button>
        </article>

        <article className="focus-card danger-card">
          <div className="icon-orb coral">
            <Icon name="clock" />
          </div>
          <p className="card-label coral-text">NEXT DANGER WINDOW</p>
          <h2>{profile.dangerDays || "Your chosen days"} · {profile.dangerStart}–{profile.dangerEnd}</h2>
          <p className="card-note">
            After work is when you are most likely to give in.
          </p>
          <button className="support-button" onClick={openSupport}>
            <Icon name="lifebuoy" size={21} />
            I need support now
          </button>
        </article>

        <button className="focus-card stat-card" onClick={goToProgress}>
          <div className="stat-topline">
            <div className="icon-orb lime small">
              <Icon name="chart" size={21} />
            </div>
            <p className="card-label lime-text">PROGRESS</p>
          </div>
          <h2>{checkIns.length ? `${onPlan} of ${checkIns.length} check-ins on plan` : "Your progress starts today"}</h2>
          <div className="progress-track" aria-label={`${rate} percent on plan`}>
            <span style={{ width: `${rate}%` }} />
          </div>
          <span className="card-link">
            See what is working <Icon name="arrow" size={16} />
          </span>
        </button>

        <article className="focus-card stat-card summary-card">
          <div className="stat-topline">
            <div className="icon-orb neutral small">
              <Icon name="spark" size={21} />
            </div>
            <p className="card-label">WEEKLY SUMMARY</p>
          </div>
          <h2>{checkIns.length ? `${rate}% on plan · ${checkIns.length} check-ins` : "No check-ins yet"}</h2>
          <p className="card-note">
            {checkIns.length ? "Your honest history is building a clearer plan." : "Complete your first check-in when you are ready."}
          </p>
        </article>
      </section>
    </>
  );
}

function ProgressView({ checkIns }: { checkIns: CheckIn[] }) {
  const lastSeven = [...checkIns].slice(0, 7).reverse();
  const onPlan = checkIns.filter((item) => item.result === "on-plan").length;
  const rate = checkIns.length ? Math.round((onPlan / checkIns.length) * 100) : 0;
  const triggerCounts = checkIns.reduce<Record<string, number>>((counts, item) => {
    counts[item.trigger] = (counts[item.trigger] ?? 0) + 1;
    return counts;
  }, {});
  const commonTriggers = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1]).slice(0, 2);

  return (
    <>
      <PageHeading
        eyebrow="YOUR PROGRESS"
        title="Direction, not perfection."
        subtitle="A slip is information. Your next choice still counts."
      />

      <section className="metric-grid" aria-label="Progress metrics">
        <Metric value={`${onPlan} of ${checkIns.length}`} label="check-ins on plan" accent="lime" />
        <Metric value={String(checkIns.length)} label="honest check-ins" />
        <Metric value={`${rate}%`} label="on-plan rate" />
        <Metric value={checkIns.length ? String(Math.max(...checkIns.map((item) => item.urgeLevel))) : "—"} label="highest urge logged" />
      </section>

      <section className="progress-layout">
        <article className="focus-card chart-card">
          <div className="section-title">
            <div>
              <p className="card-label">THIS WEEK</p>
              <h2>{checkIns.length ? "Your recent check-ins" : "Your history starts here"}</h2>
            </div>
            <span className="trend-badge">{rate}%</span>
          </div>
          {lastSeven.length ? <div className="week-chart" aria-label="Recent check-in activity chart">
            {lastSeven.map((item) => (
              <div className="bar-column" key={item.id}>
                <div className="bar-track">
                  <span
                    className={item.result === "on-plan" ? "good" : "slip"}
                    style={{ height: `${Math.max(24, item.urgeLevel * 20)}%` }}
                  />
                </div>
                <small>{new Date(item.createdAt).toLocaleDateString(undefined, { weekday: "narrow" })}</small>
              </div>
            ))}
          </div> : <p className="empty-state">Complete your first check-in to see your real patterns and progress.</p>}
          <div className="chart-legend">
            <span>
              <i className="legend-dot lime-dot" /> On plan
            </span>
            <span>
              <i className="legend-dot coral-dot" /> Slip
            </span>
          </div>
        </article>

        <article className="focus-card patterns-card">
          <p className="card-label">WHAT YOU ARE LEARNING</p>
          <h2>Your patterns</h2>
          {commonTriggers.length ? commonTriggers.map(([trigger, count], index) => (
            <div className="pattern-row" key={trigger}>
              <span className="pattern-rank">{index + 1}</span>
              <div><strong>{trigger}</strong><small>{index ? "Second most common" : "Most common trigger"}</small></div>
              <b>{count}×</b>
            </div>
          )) : <p className="empty-state compact">Your trigger patterns will appear after a few check-ins.</p>}
          <div className="pattern-insight">
            <Icon name="spark" size={20} />
            <p>
              {checkIns.length ? "Every honest check-in makes tomorrow’s plan more useful." : "No streak pressure—just record the next honest check-in."}
            </p>
          </div>
        </article>
      </section>
    </>
  );
}

function Metric({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent?: "lime";
}) {
  return (
    <article className={`metric-card ${accent === "lime" ? "accent" : ""}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}

function PlanView({
  profile,
  planMethod,
  openEdit,
  openSupport,
}: {
  profile: Profile;
  planMethod: string;
  openEdit: () => void;
  openSupport: () => void;
}) {
  return (
    <>
      <PageHeading
        eyebrow="YOUR PLAN"
        title="Ready before the urge hits."
        subtitle="Your plan should fit your life—not punish you."
      />

      <section className="plan-layout">
        <article className="focus-card goal-card">
          <div className="goal-heading">
            <div className="goal-mark">
              <Icon name="shield" />
            </div>
            <div>
              <p className="card-label">ACTIVE GOAL</p>
              <h2>Regain control of {profile.habit}</h2>
            </div>
          </div>
          <div className="goal-details">
            <div>
              <span>Approach</span>
              <strong>{planMethod}</strong>
            </div>
            <div>
              <span>Started</span>
              <strong>Your plan is active</strong>
            </div>
            <div>
              <span>Main reason</span>
              <strong>{profile.reason}</strong>
            </div>
          </div>
          <button className="secondary-button" onClick={openEdit}>
            Change my approach
          </button>
        </article>

        <article className="focus-card window-card">
          <p className="card-label coral-text">HIGH-RISK WINDOWS</p>
          <h2>Know when to act early</h2>
          <div className="window-row">
            <span>{profile.dangerDays || "SET"}</span>
            <div>
              <strong>{profile.dangerStart}–{profile.dangerEnd}</strong>
              <small>Your selected high-risk window</small>
            </div>
          </div>
        </article>

        <article className="focus-card action-plan-card">
          <p className="card-label lime-text">WHEN AN URGE HITS</p>
          <h2>Your next three moves</h2>
          <ol className="action-list">
            <li>
              <span>1</span>
              <div>
                <strong>{profile.replacementPlan}</strong>
                <small>Start with the action you chose.</small>
              </div>
            </li>
            <li>
              <span>2</span>
              <div>
                <strong>Take a shower</strong>
                <small>Break the work-to-urge pattern.</small>
              </div>
            </li>
            <li>
              <span>3</span>
              <div>
                <strong>Train for 30 minutes</strong>
                <small>Even a short session counts.</small>
              </div>
            </li>
          </ol>
          <button className="support-button" onClick={openSupport}>
            <Icon name="lifebuoy" size={20} />
            Practice the urge plan
          </button>
        </article>

        <article className="focus-card trigger-card">
          <p className="card-label">KNOWN TRIGGERS</p>
          <h2>What to watch for</h2>
          <div className="tag-list">
            {triggers.map((trigger) => (
              <span key={trigger}>{trigger}</span>
            ))}
          </div>
          <p className="card-note">
            Check-ins will help this list become more accurate over time.
          </p>
        </article>
      </section>
    </>
  );
}

function SettingsView({
  profile,
  openReminders,
  editAnswers,
}: {
  profile: Profile;
  openReminders: () => void;
  editAnswers: () => void;
}) {
  return (
    <>
      <PageHeading
        eyebrow="SETTINGS"
        title="Your data. Your rules."
        subtitle="Keep support useful without exposing what you are working on."
      />

      <section className="settings-list">
        <article className="settings-card">
          <div className="settings-icon">
            <Icon name="lock" />
          </div>
          <div className="settings-copy">
            <strong>Privacy</strong>
            <span>Your goal and check-ins are visible only to you.</span>
          </div>
          <span className="status-chip">Private</span>
        </article>

        <button
          className="settings-card"
          onClick={openReminders}
        >
          <div className="settings-icon">
            <Icon name="bell" />
          </div>
          <div className="settings-copy">
            <strong>Check-in reminders</strong>
            <span>
              {profile.reminderEnabled
                ? `${profile.reminderDays || "No days"} at ${profile.reminderTime} · private wording`
                : "Reminders are off"}
            </span>
          </div>
          <Icon name="arrow" size={19} />
        </button>

        <button className="settings-card" onClick={editAnswers}>
          <div className="settings-icon">
            <Icon name="clipboard" />
          </div>
          <div className="settings-copy">
            <strong>Edit my answers</strong>
            <span>Update your goal, reason, risk window, and replacement action.</span>
          </div>
          <Icon name="arrow" size={19} />
        </button>

        <button
          className="settings-card"
          onClick={() => undefined}
        >
          <div className="settings-icon">
            <Icon name="download" />
          </div>
          <div className="settings-copy">
            <strong>Export my data</strong>
            <span>Download your goals, check-ins, and progress.</span>
          </div>
          <Icon name="arrow" size={19} />
        </button>

        <button
          className="settings-card danger-setting"
          onClick={() => undefined}
        >
          <div className="settings-icon">
            <Icon name="trash" />
          </div>
          <div className="settings-copy">
            <strong>Delete my account</strong>
            <span>Permanently remove your account and private data.</span>
          </div>
          <Icon name="arrow" size={19} />
        </button>
      </section>

      <p className="prototype-note">
        Quit Anything supports behavior change. It does not provide medical
        treatment or emergency services.
      </p>
    </>
  );
}

function DialogShell({
  children,
  close,
  label,
  emergency = false,
}: {
  children: React.ReactNode;
  close: () => void;
  label: string;
  emergency?: boolean;
}) {
  return (
    <div className={`modal-backdrop ${emergency ? "emergency" : ""}`}>
      <section
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-label={label}
      >
        <button className="close-button" onClick={close} aria-label="Close">
          <Icon name="close" size={21} />
        </button>
        {children}
      </section>
    </div>
  );
}

function CheckInDialog({
  result,
  setResult,
  urgeLevel,
  setUrgeLevel,
  selectedTrigger,
  setSelectedTrigger,
  close,
  save,
}: {
  result: CheckInResult;
  setResult: (result: CheckInResult) => void;
  urgeLevel: number;
  setUrgeLevel: (value: number) => void;
  selectedTrigger: string;
  setSelectedTrigger: (trigger: string) => void;
  close: () => void;
  save: () => void;
}) {
  return (
    <DialogShell close={close} label="Daily check-in">
      <div className="dialog-kicker">
        <Icon name="clipboard" size={20} />
        DAILY CHECK-IN
      </div>
      <h2>How did today go?</h2>
      <p className="dialog-intro">
        Honest answers help your plan get stronger. There is no shame here.
      </p>

      <div className="result-options" role="group" aria-label="Today result">
        <button
          className={result === "on-plan" ? "selected good" : ""}
          onClick={() => setResult("on-plan")}
        >
          <span>
            <Icon name="check" size={20} />
          </span>
          <strong>I stayed on plan</strong>
        </button>
        <button
          className={result === "slip" ? "selected slip" : ""}
          onClick={() => setResult("slip")}
        >
          <span>↺</span>
          <strong>I had a slip</strong>
        </button>
      </div>

      {result && (
        <div className="checkin-details">
          {result === "slip" && (
            <div className="recovery-message">
              <strong>This does not erase your progress.</strong>
              <span>We are learning what happened so the next plan is better.</span>
            </div>
          )}

          <label className="range-label" htmlFor="urge-range">
            <span>Strongest urge today</span>
            <strong>{urgeLevel} / 5</strong>
          </label>
          <input
            id="urge-range"
            type="range"
            min="1"
            max="5"
            value={urgeLevel}
            onChange={(event) => setUrgeLevel(Number(event.target.value))}
          />

          <fieldset className="trigger-fieldset">
            <legend>What was the biggest trigger?</legend>
            <div className="chip-options">
              {triggers.map((trigger) => (
                <button
                  type="button"
                  key={trigger}
                  className={selectedTrigger === trigger ? "selected" : ""}
                  onClick={() => setSelectedTrigger(trigger)}
                >
                  {trigger}
                </button>
              ))}
            </div>
          </fieldset>

          <button className="primary-button modal-primary" onClick={save}>
            Save check-in
          </button>
        </div>
      )}
    </DialogShell>
  );
}

function SupportDialog({
  step,
  setStep,
  secondsLeft,
  replacement,
  setReplacement,
  close,
}: {
  step: SupportStep;
  setStep: (step: SupportStep) => void;
  secondsLeft: number;
  replacement: string;
  setReplacement: (value: string) => void;
  close: () => void;
}) {
  return (
    <DialogShell close={close} label="Immediate urge support" emergency>
      <div className="dialog-kicker coral-text">
        <Icon name="lifebuoy" size={20} />
        SUPPORT RIGHT NOW
      </div>

      {step === "pause" && (
        <>
          <h2>You do not have to decide right now.</h2>
          <p className="dialog-intro">
            Give the urge ten minutes. Stay here and make the next small move.
          </p>
          <div className="timer">
            <span>{formatTimer(secondsLeft)}</span>
            <small>pause before acting</small>
          </div>
          <blockquote>
            “I’m doing this because I want to build the life I know I can have.”
          </blockquote>
          <button
            className="primary-button modal-primary"
            onClick={() => setStep("breathe")}
          >
            Start a 60-second reset
          </button>
          <button
            className="text-button"
            onClick={() => setStep("replace")}
          >
            Skip breathing—give me another move
          </button>
        </>
      )}

      {step === "breathe" && (
        <>
          <h2>Slow the moment down.</h2>
          <p className="dialog-intro">
            Breathe in for 4, hold for 4, breathe out for 6.
          </p>
          <div className="breathing-orb">
            <span>Breathe</span>
          </div>
          <button
            className="primary-button modal-primary"
            onClick={() => setStep("replace")}
          >
            Choose my next move
          </button>
        </>
      )}

      {step === "replace" && (
        <>
          <h2>What will you do instead?</h2>
          <p className="dialog-intro">
            Pick something small enough to start immediately.
          </p>
          <div className="replacement-options">
            {[
              "Eat, shower, then train",
              "Walk outside for 10 minutes",
              "Call someone I trust",
              "Leave the situation",
            ].map((option) => (
              <button
                key={option}
                className={replacement === option ? "selected" : ""}
                onClick={() => setReplacement(option)}
              >
                <span className="radio-mark" />
                {option}
              </button>
            ))}
          </div>
          <button
            className="primary-button modal-primary"
            onClick={() => setStep("done")}
          >
            Commit to this move
          </button>
        </>
      )}

      {step === "done" && (
        <div className="support-complete">
          <div className="success-ring">
            <Icon name="check" size={34} strokeWidth={2.4} />
          </div>
          <p className="card-label lime-text">NEXT CHOICE MADE</p>
          <h2>Now do only this:</h2>
          <strong>{replacement}</strong>
          <p>
            You do not need to solve forever. You only need to protect the next
            ten minutes.
          </p>
          <button className="primary-button modal-primary" onClick={close}>
            I&apos;m moving now
          </button>
        </div>
      )}

      <p className="safety-line">
        If you may be in immediate danger, contact local emergency services.
      </p>
    </DialogShell>
  );
}

function ReminderDialog({
  profile,
  close,
  save,
}: {
  profile: Profile;
  close: () => void;
  save: (profile: Profile) => void;
}) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const [enabled, setEnabled] = useState(profile.reminderEnabled);
  const [selectedDays, setSelectedDays] = useState(
    profile.reminderDays.split(",").filter(Boolean),
  );
  const [time, setTime] = useState(profile.reminderTime);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const saveSchedule = async () => {
    setSaving(true);
    setError("");
    try {
      if (enabled && "Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
      }
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...profile,
          reminderEnabled: enabled,
          reminderDays: selectedDays,
          reminderTime: time,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save reminders.");
      save(data.profile);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save reminders.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DialogShell close={close} label="Check-in reminder schedule">
      <div className="dialog-kicker">
        <Icon name="bell" size={20} />
        CHECK-IN REMINDERS
      </div>
      <h2>Choose when support should show up.</h2>
      <p className="dialog-intro">
        Notifications use private wording and never name your habit.
      </p>

      <label className="reminder-toggle">
        <span>
          <strong>Reminders</strong>
          <small>{enabled ? "On" : "Off"}</small>
        </span>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(event) => setEnabled(event.target.checked)}
        />
      </label>

      {enabled && (
        <div className="reminder-fields">
          <fieldset className="trigger-fieldset">
            <legend>Reminder days</legend>
            <div className="day-picker">
              {days.map((day) => (
                <button
                  type="button"
                  key={day}
                  className={selectedDays.includes(day) ? "selected" : ""}
                  onClick={() =>
                    setSelectedDays((current) =>
                      current.includes(day)
                        ? current.filter((item) => item !== day)
                        : [...current, day],
                    )
                  }
                >
                  {day}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="reminder-time">
            Reminder time
            <input type="time" value={time} onChange={(event) => setTime(event.target.value)} />
          </label>
        </div>
      )}

      {error && <p className="form-error">{error}</p>}
      <button
        className="primary-button modal-primary"
        onClick={saveSchedule}
        disabled={saving || (enabled && selectedDays.length === 0)}
      >
        {saving ? "Saving…" : "Save reminder schedule"}
      </button>
      <p className="safety-line">
        Your browser may ask for notification permission after you save.
      </p>
    </DialogShell>
  );
}

function EditPlanDialog({
  draftMethod,
  setDraftMethod,
  close,
  save,
}: {
  draftMethod: string;
  setDraftMethod: (value: string) => void;
  close: () => void;
  save: () => void;
}) {
  return (
    <DialogShell close={close} label="Change goal approach">
      <div className="dialog-kicker">
        <Icon name="clipboard" size={20} />
        CHANGE YOUR APPROACH
      </div>
      <h2>What does progress look like now?</h2>
      <p className="dialog-intro">
        Your approach can change without deleting what you have learned.
      </p>
      <div className="method-options">
        {planOptions.map((option) => (
          <button
            key={option.name}
            className={draftMethod === option.name ? "selected" : ""}
            onClick={() => setDraftMethod(option.name)}
          >
            <span className="radio-mark" />
            <div>
              <strong>{option.name}</strong>
              <small>{option.detail}</small>
            </div>
          </button>
        ))}
      </div>
      <button className="primary-button modal-primary" onClick={save}>
        Update my plan
      </button>
    </DialogShell>
  );
}
