import browser from 'webextension-polyfill';
import { WebExtBackgroundService } from './webext-background.service';

/**
 * Registers background startup handlers.
 *
 * MV3 service workers (and Firefox MV3 background scripts) can start for events other than
 * onInstalled/onStartup (e.g. alarms, runtime messages) without those events firing, so
 * readiness is ensured idempotently on every start via WebExtBackgroundService.ensureReady
 * instead of a one-time startup flag.
 */
export const registerBackgroundStartup = (backgroundSvc: WebExtBackgroundService): void => {
  const kick = (reason?: string): void => {
    backgroundSvc.ensureReady(reason).catch(() => {
      // Install failures are already reported via $exceptionHandler and the
      // readiness guard is reset so a later event can retry
    });
  };

  browser.runtime.onInstalled.addListener((details) => {
    kick(details.reason);
  });

  browser.runtime.onStartup.addListener(() => {
    kick();
  });

  // The worker may have started for another event — ensure readiness here too
  kick();
};
