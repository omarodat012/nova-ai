import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Building2, CalendarDays, GraduationCap } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { academicYears } from '../../data/academicYears.js';
import { SelectField, TextField } from './FormFields.jsx';

export const STUDENT_FIELDS = ['major', 'university', 'academicYear'];
export const EMPTY_STUDENT_VALUES = { major: '', university: '', academicYear: '' };

// The "university student" switch plus the three study fields it reveals.
// `fieldProps(name)` supplies name/value/onChange/onBlur/error for each field.
export default function StudentSection({ checked, onToggle, fieldProps, label, hint }) {
  const { t, localize } = useLanguage();

  return (
    <div>
      <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-edge bg-space/40 px-4 py-3.5 transition-colors hover:border-logo-blue/50">
        <span className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-edge bg-electric/15 text-logo-blue">
            <GraduationCap className="size-5" />
          </span>
          <span>
            <span className="block font-bold">{label ?? t('form.isStudent')}</span>
            <span className="block text-sm text-muted">{hint ?? t('form.isStudentHint')}</span>
          </span>
        </span>
        <input type="checkbox" name="isStudent" checked={checked} onChange={onToggle} className="peer sr-only" />
        <span
          aria-hidden="true"
          className="relative h-7 w-12 shrink-0 rounded-full bg-space ring-1 ring-edge transition-colors after:absolute after:start-1 after:top-1 after:size-5 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-[image:var(--gradient-brand)] peer-checked:ring-transparent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-electric ltr:peer-checked:after:translate-x-5 rtl:peer-checked:after:-translate-x-5"
        />
      </label>

      <AnimatePresence initial={false}>
        {checked && (
          <motion.div
            key="student-fields"
            className="-mx-1 -mb-1 overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="grid gap-5 px-1 pb-1 pt-5 sm:grid-cols-2">
              <TextField
                icon={BookOpen}
                label={t('form.major')}
                type="text"
                maxLength={120}
                placeholder={t('form.majorPlaceholder')}
                {...fieldProps('major')}
              />
              <TextField
                icon={Building2}
                label={t('form.university')}
                type="text"
                autoComplete="organization"
                maxLength={120}
                placeholder={t('form.universityPlaceholder')}
                {...fieldProps('university')}
              />
              <div className="sm:col-span-2">
                <SelectField
                  icon={CalendarDays}
                  label={t('form.academicYear')}
                  placeholder={t('form.academicYearPlaceholder')}
                  {...fieldProps('academicYear')}
                >
                  {academicYears.map((year) => (
                    <option key={year.id} value={year.id} className="bg-surface text-white">
                      {localize(year.label)}
                    </option>
                  ))}
                </SelectField>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
