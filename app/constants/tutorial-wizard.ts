export const TUTORIAL_WIZARD_STORAGE_KEY = "opencost-tutorial-wizard-completed";

export function readTutorialWizardCompleted(): boolean {
  try {
    return localStorage.getItem(TUTORIAL_WIZARD_STORAGE_KEY) === "1";
  } catch {
    return true;
  }
}

export function markTutorialWizardCompleted(): void {
  try {
    localStorage.setItem(TUTORIAL_WIZARD_STORAGE_KEY, "1");
  } catch {
  }
}
