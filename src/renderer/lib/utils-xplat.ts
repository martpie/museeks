/**
 * Various utilities for helping with x-platform development. Linked to the
 * preload script and the fact Node.JS should not be exposed on the webcontents
 * side.
 */

export const getPlatform = (): NodeJS.Platform => window.__museeks.platform;
