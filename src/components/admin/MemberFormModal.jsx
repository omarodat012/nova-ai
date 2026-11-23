import { useState } from 'react';
import { BadgeCheck, CircleAlert, GraduationCap, LoaderCircle, Mail, Phone, Save, User, Users } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { memberRoles } from '../../data/memberRoles.js';
import { subteams } from '../../data/subteams.js';
import { useFormFields } from '../../hooks/useFormFields.js';
import { addMember, updateMember } from '../../services/membersService.js';
import { isValidEmail, isValidPhone, toLatinDigits } from '../../utils/validation.js';
import { SelectField, TextField } from '../forms/FormFields.jsx';
import StudentSection, { EMPTY_STUDENT_VALUES, STUDENT_FIELDS } from '../forms/StudentSection.jsx';
import Modal from '../ui/Modal.jsx';

const FIELD_ORDER = ['fullName', 'phone', 'email', 'subteam', 'role', ...STUDENT_FIELDS];

function toFormValues(member) {
  if (!member) {
    return {
      fullName: '',
      phone: '',
      email: '',
      subteam: '',
      role: 'member',
      isStudent: false,
      ...EMPTY_STUDENT_VALUES,
    };
  }

  return {
    fullName: member.fullName ?? '',
    phone: member.phone ?? '',
    email: member.email ?? '',
    subteam: member.subteam ?? '',
    role: member.role ?? 'member',
    isStudent: Boolean(member.isStudent),
    major: member.major ?? '',
    university: member.university ?? '',
    academicYear: member.academicYear ?? '',
  };
}

// Phone and email are optional here (admins may not have them for every member) but must be valid when given.
// The supervisor oversees the whole team, so she does not need a SubTeam either.
function validate(values) {
  const errors = {};

  if (!values.fullName.trim()) errors.fullName = 'required';
  if (values.phone.trim() && !isValidPhone(values.phone)) errors.phone = 'phone';
  if (values.email.trim() && !isValidEmail(values.email)) errors.email = 'email';
  if (!values.subteam && values.role !== 'supervisor') errors.subteam = 'required';
  if (!values.role) errors.role = 'required';
  if (values.isStudent) {
    STUDENT_FIELDS.forEach((name) => {
      if (!values[name].trim()) errors[name] = 'required';
    });
  }

  return errors;
}

function toMember(values) {
  return {
    fullName: values.fullName.trim(),
    phone: toLatinDigits(values.phone.trim()) || null,
    email: values.email.trim().toLowerCase() || null,
    subteam: values.subteam || null,
    role: values.role,
    isStudent: values.isStudent,
    major: values.isStudent ? values.major.trim() : null,
    university: values.isStudent ? values.university.trim() : null,
    academicYear: values.isStudent ? values.academicYear : null,
  };
}

function MemberForm({ member, supervisor, onClose }) {
  const { t, localize } = useLanguage();
  const { values, fieldProps, toggleStudent, validateAll } = useFormFields(toFormValues(member), validate);
  const [status, setStatus] = useState('idle');
  const saving = status === 'saving';
  const isSupervisor = values.role === 'supervisor';
  // NOVA AI has one Faculty Supervisor: the role is locked while another member holds it.
  const supervisorTaken = Boolean(supervisor) && supervisor.id !== member?.id;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving || (isSupervisor && supervisorTaken) || !validateAll(event.currentTarget, FIELD_ORDER)) return;

    setStatus('saving');
    try {
      await (member
        ? updateMember(member.id, toMember(values), member.emailLower ?? member.email)
        : addMember(toMember(values)));
      onClose();
    } catch (error) {
      console.error('[NOVA AI] Could not save the member.', error);
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="px-6 pb-7 pt-12 sm:px-8">
      <h2 id="member-form-title" className="text-2xl font-bold">
        {t(member ? 'admin.members.editTitle' : 'admin.members.addTitle')}
      </h2>
      <p className="mt-1.5 text-sm text-muted">{t('form.requiredNote')}</p>

      <fieldset disabled={saving} className="mt-6 min-w-0 space-y-5">
        <TextField
          icon={User}
          label={t('form.fullName')}
          type="text"
          placeholder={t('admin.members.namePlaceholder')}
          {...fieldProps('fullName')}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            icon={Phone}
            label={t('form.phone')}
            type="tel"
            inputMode="tel"
            placeholder="+962 7X XXX XXXX"
            dir="ltr"
            required={false}
            {...fieldProps('phone')}
          />
          <TextField
            icon={Mail}
            label={t('form.email')}
            type="email"
            inputMode="email"
            placeholder="member@example.com"
            dir="ltr"
            required={false}
            {...fieldProps('email')}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            icon={Users}
            label={t('form.subteam')}
            placeholder={t('form.subteamPlaceholder')}
            required={!isSupervisor}
            {...fieldProps('subteam')}
          >
            {subteams.map((team) => (
              <option key={team.id} value={team.id} className="bg-surface text-white">
                {localize(team.name)} {team.emoji}
              </option>
            ))}
          </SelectField>
          <SelectField
            icon={BadgeCheck}
            label={t('admin.members.role')}
            placeholder={t('admin.members.rolePlaceholder')}
            {...fieldProps('role')}
          >
            {memberRoles.map((role) => (
              <option
                key={role.id}
                value={role.id}
                disabled={role.id === 'supervisor' && supervisorTaken}
                className="bg-surface text-white"
              >
                {localize(role.label)}
              </option>
            ))}
          </SelectField>
        </div>

        {(isSupervisor || supervisorTaken) && (
          <p className="flex items-start gap-2.5 rounded-2xl border border-amber-300/40 bg-amber-300/10 px-4 py-3 text-sm font-medium leading-relaxed text-amber-100">
            <GraduationCap className="mt-0.5 size-4 shrink-0 text-amber-300" />
            <span>
              {supervisorTaken ? (
                <>
                  {t('admin.members.supervisorTaken')}{' '}
                  <strong className="[overflow-wrap:anywhere]">{supervisor.fullName}</strong>
                </>
              ) : (
                t('admin.members.supervisorHint')
              )}
            </span>
          </p>
        )}

        <StudentSection
          checked={values.isStudent}
          onToggle={toggleStudent}
          fieldProps={fieldProps}
          label={t('admin.members.isStudent')}
          hint={t('admin.members.isStudentHint')}
        />

        {status === 'error' && (
          <p
            role="alert"
            className="flex items-center gap-2 rounded-2xl border border-bow/40 bg-bow/10 px-4 py-3 text-sm font-medium"
          >
            <CircleAlert className="size-4 shrink-0 text-bow" />
            {t('admin.errors.action')}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn btn-ghost">
            {t('admin.common.cancel')}
          </button>
          <button type="submit" className="btn btn-primary disabled:cursor-wait disabled:opacity-80">
            {saving ? <LoaderCircle className="size-5 animate-spin" /> : <Save className="size-5" />}
            {t(saving ? 'admin.common.saving' : 'admin.common.save')}
          </button>
        </div>
      </fieldset>
    </form>
  );
}

// `member` is the document being edited, or null to register a new member.
// `supervisor` is the member currently holding the supervisor role, or null when the role is free.
export default function MemberFormModal({ open, member, supervisor, onClose }) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="member-form-title" className="max-w-2xl">
      <MemberForm member={member} supervisor={supervisor} onClose={onClose} />
    </Modal>
  );
}
