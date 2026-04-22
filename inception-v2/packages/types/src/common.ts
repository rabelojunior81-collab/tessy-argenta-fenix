// ============================================================================
// Common Types & Utilities
// ============================================================================

/**
 * ISO 8601 timestamp string with timezone
 * @example "2026-03-12T23:06:37.076Z"
 */
export type ISO8601String = string;

/**
 * UUID v4 string
 * @example "550e8400-e29b-41d4-a716-446655440000"
 */
export type UUID = string;

/**
 * JSON-serializable primitive types
 */
export type JSONPrimitive = string | number | boolean | null;

/**
 * JSON-serializable value
 */
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;

/**
 * JSON-serializable object
 */
export interface JSONObject {
  [key: string]: JSONValue;
}

/**
 * JSON-serializable array
 */
export interface JSONArray extends Array<JSONValue> {}

/**
 * Result type for operations that can fail
 * Similar to Rust's Result<T, E>
 */
export type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };

/**
 * Nullable type shorthand
 */
export type Nullable<T> = T | null;

/**
 * Optional type shorthand
 */
export type Optional<T> = T | undefined;

/**
 * Deep readonly type
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
