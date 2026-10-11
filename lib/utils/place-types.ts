import { MAX_TYPE_LENGTH, OTHER_TYPE, createTypeHelpers } from "./custom-types";

export const OTHER_PLACE_TYPE = OTHER_TYPE;
export const MAX_PLACE_TYPE_LENGTH = MAX_TYPE_LENGTH;

export const BASE_PLACE_TYPES = [
  "מוזיאון",
  "חוף",
  "אתר מורשת",
  "גן לאומי",
  "שוק",
  "עיר עתיקה",
  "מערה",
  "מרכז קניות",
  "מצודה",
  "פארק",
  "אתר דתי",
] as const;

export const placeTypes = createTypeHelpers(BASE_PLACE_TYPES);

export const normalizePlaceType = placeTypes.normalize;
export const buildPlaceTypeOptions = placeTypes.buildOptions;
export const resolvePlaceType = placeTypes.resolve;
export const isNewPlaceType = placeTypes.isNew;
