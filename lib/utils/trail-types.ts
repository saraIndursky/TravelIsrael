import { createTypeHelpers } from "./custom-types";

export const BASE_TRAIL_TYPES = ["הליכה", "מים", "טיפוס", "אופניים", "רכיבה"] as const;

export const trailTypes = createTypeHelpers(BASE_TRAIL_TYPES);

export const buildTrailTypeOptions = trailTypes.buildOptions;
export const isNewTrailType = trailTypes.isNew;
