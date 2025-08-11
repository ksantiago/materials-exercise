/**
 * A/B Test Context – Experiment Variations Provider
 *
 * Purpose:
 * Expose current experiment variations to the React tree so UI can render
 * experiment-specific layouts/controls without wiring vendor code everywhere.
 *
 * How it works:
 * - On mount, reads variations from Dynamic Yield (`window.DYO.getUserObjectsAndVariations()`).
 * - Falls back to `sampleVariations` in non-production or when no assignments exist,
 *   so engineers can develop/test without vendor dependencies.
 * - Initializes every test to its control group via `allAbTests`, then selectively
 *   flips to the active test group if the vendor assignment matches.
 *
 * Key responsibilities:
 * - Provide a lightweight key→variation map (e.g., { "PDP Layout": "test" }).
 * - Keep experiment logic isolated from presentational components.
 * - Fail safe in SSR/CI/local dev (no `window`, no DYO) by defaulting to control/sample.
 *
 * Usage:
 * - Wrap pages with <AbTestProvider>.
 * - Read current variations via `useAbTestContext()` and branch UI as needed.
 *
 * Notes:
 * - Context value is intentionally simple (POJO) for easy unit testing.
 * - If vendor API shape changes, only this provider and `allAbTests` need updates.
 */

import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import allAbTests, {
  sampleVariations,
} from "context/AbTestContext/allAbTestsConstants";

interface AbTestContextValue {
  [key: string]: string;
}

interface VariationsObject {
  objectId: number;
  objectName: string;
  conditionName: string;
  conditionId: number;
  objectType: string;
  variations: string[];
  variationIds: number[];
}

const { NODE_ENV } = process.env;

// Expose a simple key→variation map to consumers.
const AbTestContext = createContext<AbTestContextValue>(null as unknown as AbTestContextValue);
AbTestContext.displayName = "Ab Test Context";

export const useAbTestContext = () => {
  const context = useContext(AbTestContext);
  return context;
};

const AbTestProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // Seed every test with its control group so UI has deterministic defaults.
  const initialVariation = allAbTests.reduce(
    (acc, testObject) => ({
      ...acc,
      [testObject.testName]: testObject.controlGroup,
    }),
    {}
  );

  const [abTestVariation, setAbTestVariation] = useState(initialVariation);

  useEffect(() => {
    // Guard for client-only vendor API; fall back to sample data in dev/no-assignment cases.
    if (typeof window !== "undefined" && (window as any).DYO?.getUserObjectsAndVariations) {
      const variations =
        (window as any).DYO.getUserObjectsAndVariations().length === 0 ||
        NODE_ENV !== "production"
          ? sampleVariations
          : ((window as any).DYO.getUserObjectsAndVariations() as VariationsObject[]);

      variations.forEach((testObject) => {
        const { objectName, variations } = testObject;
        const [variation] = variations;

        const currentTest = allAbTests.find(
          (test) => test.testName === objectName
        );

        if (currentTest?.testGroup === variation) {
          setAbTestVariation((prevState) => ({
            ...prevState,
            [currentTest.testName]: variation,
          }));
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AbTestContext.Provider value={abTestVariation}>
      {children}
    </AbTestContext.Provider>
  );
};

export default AbTestProvider;
