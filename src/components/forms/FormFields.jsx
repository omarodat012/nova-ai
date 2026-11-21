import { useId } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, CircleAlert } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';

// `error` is a key under `form.errors` in the translations.
function FieldShell({ id, label, error, hint, required, children }) {
  const { t } = useLanguage();

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-muted">
        {label}
        {required && (
          <>
            {' '}
            <span aria-hidden="true" className="text-bow">
              *
            </span>
          </>
        )}
      </label>
      {children}
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            id={`${id}-error`}
            className="overflow-hidden text-sm font-medium text-bow"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <span className="flex items-center gap-1.5 pt-1.5">
              <CircleAlert className="size-4 shrink-0" />
              {t(`form.errors.${error}`)}
            </span>
          </motion.p>
        )}
      </AnimatePresence>
      {hint && !error && <p className="mt-1.5 text-sm text-muted">{hint}</p>}
    </div>
  );
}

function controlProps(id, error, required) {
  return {
    id,
    'aria-required': required,
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? `${id}-error` : undefined,
  };
}

// `dir` pins the text direction of a field (phone numbers, emails, single-language copy) on either page direction.
export function TextField({ icon: Icon, label, error, hint, dir, required = true, ...inputProps }) {
  const id = useId();
  const { dir: pageDir } = useLanguage();
  const spacing = dir && dir !== pageDir ? 'pe-10 text-end' : 'ps-10';

  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required}>
      <div className="relative">
        <Icon className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-logo-blue" />
        <input dir={dir} className={`field ${spacing}`} {...controlProps(id, error, required)} {...inputProps} />
      </div>
    </FieldShell>
  );
}

export function TextAreaField({ label, error, hint, dir, required = true, rows = 3, ...textareaProps }) {
  const id = useId();

  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required}>
      <textarea
        dir={dir}
        rows={rows}
        className="field block resize-y leading-relaxed"
        {...controlProps(id, error, required)}
        {...textareaProps}
      />
    </FieldShell>
  );
}

export function SelectField({ icon: Icon, label, error, hint, placeholder, value, required = true, children, ...selectProps }) {
  const id = useId();

  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required}>
      <div className="relative">
        <Icon className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-logo-blue" />
        <select
          value={value}
          className={`field cursor-pointer appearance-none px-10 ${value ? '' : 'text-muted/60'}`}
          {...controlProps(id, error, required)}
          {...selectProps}
        >
          {/* An optional select can be set back to "no choice". */}
          <option value="" disabled={required} className={required ? undefined : 'bg-surface text-white'}>
            {placeholder}
          </option>
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute end-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
      </div>
    </FieldShell>
  );
}
