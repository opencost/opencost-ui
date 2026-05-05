import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Modal } from "@carbon/react";
import { useLocation } from "react-router";
import {
  markTutorialWizardCompleted,
  readTutorialWizardCompleted,
} from "~/constants/tutorial-wizard";

const STEP_CONTENT: { title: string; body: string }[] = [
  {
    title: "Welcome to OpenCost",
    body: "OpenCost helps you understand Kubernetes and cloud spend in one place. This short tour introduces the sidebar: where you open dashboards for live widget layouts, and reports for saved cost views. You can leave the tour anytime with Skip.",
  },
  {
    title: "Dashboards",
    body: "Use Dashboards to build board-style pages with charts, tables, and summaries side by side. Duplicate or edit layouts, then open any dashboard from the list. The sidebar entry is highlighted while you read this step.",
  },
  {
    title: "Reporting",
    body: "Reports hold saved cost allocation configurations you can reopen, adjust, and share—ideal for recurring analysis. Open Reports from the sidebar (highlighted now) when you are ready to try it.",
  },
];

export type TutorialNavHighlight = "dashboards" | "reports" | null;

export interface TutorialWizardContextValue {
  isTutorialOpen: boolean;
  tutorialStep: 0 | 1 | 2;
  isTutorialActive: boolean;
  navHighlight: TutorialNavHighlight;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
}

const TutorialWizardContext = createContext<TutorialWizardContextValue | null>(
  null,
);

export function TutorialWizardProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isHome = location.pathname === "/";

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<0 | 1 | 2>(0);

  useLayoutEffect(() => {
    if (!isHome) {
      setIsOpen(false);
      return;
    }
    if (readTutorialWizardCompleted()) {
      setIsOpen(false);
      return;
    }
    setIsOpen(true);
    setStep(0);
  }, [isHome]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const skipTutorial = useCallback(() => {
    markTutorialWizardCompleted();
    close();
  }, [close]);

  const completeTutorial = useCallback(() => {
    markTutorialWizardCompleted();
    close();
  }, [close]);

  const nextStep = useCallback(() => {
    setStep((s) => (s < 2 ? ((s + 1) as 0 | 1 | 2) : s));
  }, []);

  const prevStep = useCallback(() => {
    setStep((s) => (s > 0 ? ((s - 1) as 0 | 1 | 2) : s));
  }, []);

  const navHighlight: TutorialNavHighlight = useMemo(() => {
    if (!isOpen || !isHome) return null;
    if (step === 1) return "dashboards";
    if (step === 2) return "reports";
    return null;
  }, [isOpen, isHome, step]);

  const isTutorialActive = isOpen && isHome;

  const value = useMemo(
    () => ({
      isTutorialOpen: isOpen,
      tutorialStep: step,
      isTutorialActive,
      navHighlight,
      nextStep,
      prevStep,
      skipTutorial,
      completeTutorial,
    }),
    [
      isOpen,
      step,
      isTutorialActive,
      navHighlight,
      nextStep,
      prevStep,
      skipTutorial,
      completeTutorial,
    ],
  );

  return (
    <TutorialWizardContext.Provider value={value}>
      {children}
      <TutorialWizardModal />
    </TutorialWizardContext.Provider>
  );
}

export function useTutorialWizard(): TutorialWizardContextValue {
  const ctx = useContext(TutorialWizardContext);
  if (!ctx) {
    throw new Error("useTutorialWizard must be used within TutorialWizardProvider");
  }
  return ctx;
}

export function useTutorialWizardOptional(): TutorialWizardContextValue | null {
  return useContext(TutorialWizardContext);
}

function TutorialWizardModal() {
  const location = useLocation();
  const {
    isTutorialOpen,
    tutorialStep,
    nextStep,
    prevStep,
    skipTutorial,
    completeTutorial,
  } = useTutorialWizard();

  const open = isTutorialOpen && location.pathname === "/";
  const step = STEP_CONTENT[tutorialStep] ?? STEP_CONTENT[0];
  const isLast = tutorialStep === 2;

  return (
    <Modal
      open={open}
      passiveModal
      onRequestClose={skipTutorial}
      modalHeading={`Tutorial · Step ${tutorialStep + 1} of 3`}
      size="sm"
      aria-label="OpenCost getting started tutorial"
    >
      <div className="mb-2">
        <h3 className="m-0 text-lg font-semibold text-[#161616]">{step.title}</h3>
        <p className="mt-3 mb-0 text-sm leading-relaxed text-[#525252]">{step.body}</p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#e0e0e0] pt-5">
        {tutorialStep > 0 ? (
          <button
            type="button"
            className="rounded border border-[#8d8d8d] bg-transparent px-4 py-2 text-sm font-medium text-[#161616] hover:bg-[#f4f4f4]"
            onClick={prevStep}
          >
            Back
          </button>
        ) : null}
        <button
          type="button"
          className="rounded bg-[#0f62fe] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0353e9]"
          onClick={isLast ? completeTutorial : nextStep}
        >
          {isLast ? "Finish" : "Next"}
        </button>
        <button
          type="button"
          className="rounded px-4 py-2 text-sm font-medium text-[#0f62fe] hover:underline"
          onClick={skipTutorial}
        >
          Skip tutorial
        </button>
      </div>
    </Modal>
  );
}
