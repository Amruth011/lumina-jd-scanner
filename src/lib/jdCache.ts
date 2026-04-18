/**
 * JD Decode Cache
 * ================
 * Ensures the same JD text always produces the same decoded result.
 * 
 * Problem: The AI-based decode-jd function is non-deterministic — calling it
 * multiple times with the same JD text produces slightly different skill lists
 * (different names, different importance values, different count). This causes
 * the resume match score to fluctuate even when nothing changed.
 * 
 * Solution: Cache decoded results keyed by a hash of the normalized JD text.
 * - In-memory cache for the current session
 * - localStorage persistence across page reloads
 * - Normalization strips whitespace/case differences so minor formatting
 *   changes don't create cache misses
 */

import type { DecodeResult } from "@/types/jd";

const CACHE_STORAGE_KEY = "lumina_jd_decode_cache";
const MAX_CACHE_ENTRIES = 50; // Prevent unbounded localStorage growth

// ── Text Normalization ──
// Strips irrelevant whitespace/formatting so "same content" always matches
function normalizeJdText(text: string): string {
  return text
    .toLowerCase()
    // Remove zero-width spaces and other invisible characters
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    // Normalize all whitespace (including tabs, newlines, non-breaking spaces) to single space
    .replace(/[\s\xa0]+/g, " ")
    .trim();
}

// ── Deterministic Hash ──
// Simple but effective string hash (djb2 variant) — fast, no crypto overhead.
// Two different JD texts producing the same hash is astronomically unlikely
// for real-world job descriptions.
async function hashText(text: string): Promise<string> {
  // Use the Web Crypto API for a proper SHA-256 hash
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

interface CacheEntry {
  hash: string;
  result: DecodeResult;
  timestamp: number;
}

// ── In-memory cache (current session) ──
const memoryCache = new Map<string, DecodeResult>();

// ── Load from localStorage ──
function loadPersistedCache(): CacheEntry[] {
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) return [];
    const entries: CacheEntry[] = JSON.parse(raw);
    // Validate structure
    if (!Array.isArray(entries)) return [];
    return entries.filter(
      (e) => e.hash && e.result && e.result.skills && Array.isArray(e.result.skills)
    );
  } catch {
    return [];
  }
}

// ── Save to localStorage ──
function persistCache(entries: CacheEntry[]): void {
  try {
    // Keep only the most recent entries
    const trimmed = entries.slice(-MAX_CACHE_ENTRIES);
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

/**
 * Look up a cached decode result for the given JD text.
 * Returns the cached DecodeResult if found, or null if cache miss.
 */
export async function getCachedDecode(jdText: string): Promise<DecodeResult | null> {
  const normalized = normalizeJdText(jdText);
  const hash = await hashText(normalized);

  // 1. Check in-memory cache first (fastest)
  if (memoryCache.has(hash)) {
    return memoryCache.get(hash)!;
  }

  // 2. Check persisted cache
  const entries = loadPersistedCache();
  const found = entries.find((e) => e.hash === hash);
  if (found) {
    // Promote to memory cache
    memoryCache.set(hash, found.result);
    return found.result;
  }

  return null;
}

/**
 * Store a decode result in the cache, keyed by the JD text.
 */
export async function setCachedDecode(jdText: string, result: DecodeResult): Promise<void> {
  const normalized = normalizeJdText(jdText);
  const hash = await hashText(normalized);

  // Store in memory
  memoryCache.set(hash, result);

  // Persist to localStorage
  const entries = loadPersistedCache();
  // Remove old entry for same hash if exists
  const filtered = entries.filter((e) => e.hash !== hash);
  filtered.push({ hash, result, timestamp: Date.now() });
  persistCache(filtered);
}

/**
 * Clear all cached decode results.
 */
export function clearDecodeCache(): void {
  memoryCache.clear();
  try {
    localStorage.removeItem(CACHE_STORAGE_KEY);
  } catch {
    // ignore
  }
}
