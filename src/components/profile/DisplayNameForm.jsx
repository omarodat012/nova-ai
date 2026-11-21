import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { CircleAlert, CircleCheck, LoaderCircle, Save, UserPen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { TextField } from '../forms/FormFields.jsx';
import FormMessage from './FormMessage.jsx';

const MAX_LENGTH = 80;

// Lets any signed-in account change the name shown in the navbar and the account menu.
// `hint` is the line under the field.
export default function DisplayNameForm({ hint, className = '' }) {
  const { t } = useLanguage();
  const { user, updateDisplayName } = useAuth();
  const savedName = user.displayName?.trim() ?? '';
  const [name, setName] = useState(savedName);
  // 'idle' | 'saving' | 'saved' | 'required' | 'error'
  const [status, setStatus] = useState('idle');

  const saving = status === 'saving';
  const dirty = name.trim() !== savedName;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving || !dirty) return;
    if (!name.trim()) {
      setStatus('required');
      return;
    }

    setStatus('saving');
    try {
      await updateDisplayName(name);
      setName(name.trim());
      setStatus('saved');
    } catch (error) {
      console.error('[NOVA AI] Could not save the display name.', error);
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className={className}>
      <fieldset disabled={saving} className="min-w-0 space-y-4">
        <TextField
          icon={UserPen}
          label={t('profile.displayName.label')}
          type="text"
          name="displayName"
          autoComplete="nickname"
          maxLength={MAX_LENGTH}
          placeholder={t('profile.displayName.placeholder')}
          hint={hint}
          value={name}
          error={status === 'required' ? 'required' : undefined}
          onChange={(event) => {
            setName(event.target.value);
            setStatus('idle');
          }}
        />

        <AnimatePresence mode="wait" initial={false}>
          {status === 'error' && (
            <FormMessage key="error" tone="error" icon={CircleAlert}>
              {t('profile.displayName.error')}
            </FormMessage>
          )}
          {status === 'saved' && (
            <FormMessage key="saved" tone="success" icon={CircleCheck}>
              {t('profile.displayName.saved')}
            </FormMessage>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={!dirty}
          className="btn btn-primary btn-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {saving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
          {t(saving ? 'profile.form.saving' : 'profile.displayName.save')}
        </button>
      </fieldset>
    </form>
  );
}
