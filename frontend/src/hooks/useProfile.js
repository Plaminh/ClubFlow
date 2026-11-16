import { useState } from 'react';
import { useDemoSession } from '../contexts/demoSession.js';
import * as profileService from '../services/profileService.js';
import useAction from './useAction.js';
import useServiceData from './useServiceData.js';

/**
 * Current user's profile plus the simulated save action. The caller is keyed
 * by the session epoch (see ProfilePage), so `saved` never outlives the
 * account or dataset it was saved for.
 */
export default function useProfile() {
  const { accountId, updateCurrentAccount } = useDemoSession();
  // Shown right after a save, while the reload it triggers is still in flight.
  const [saved, setSaved] = useState(null);
  const query = useServiceData(profileService.getProfile);
  const action = useAction();

  async function save(payload) {
    const result = await action.run(() => profileService.updateProfile(payload));
    if (result.ok) {
      setSaved(result.value);
      updateCurrentAccount(result.value);
    }
    return result;
  }

  const data = saved && saved.id === accountId && query.data ? saved : query.data;
  return { ...query, data, save, saving: action.pending, saveError: action.error, clearSaveError: action.clearError };
}
