import { useState } from 'react';
import { EMPTY_STUDENT_VALUES } from '../components/forms/StudentSection.jsx';

// Shared state for the validated forms: `validate(values)` returns { fieldName: errorKey }.
// A field only shows its error once it has been touched (blurred, or after a failed submit).
export function useFormFields(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const errors = validate(values);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((current) => ({ ...current, [name]: true }));
  };

  return {
    values,
    setValues,
    fieldProps: (name) => ({
      name,
      value: values[name],
      onChange: handleChange,
      onBlur: handleBlur,
      error: touched[name] ? errors[name] : undefined,
    }),
    // Switching off clears the study fields; either way they start again without error messages.
    toggleStudent: (event) => {
      const isStudent = event.target.checked;
      setValues((current) => (isStudent ? { ...current, isStudent } : { ...current, isStudent, ...EMPTY_STUDENT_VALUES }));
      setTouched((current) => ({ ...current, major: false, university: false, academicYear: false }));
    },
    // Returns true when valid; otherwise reveals every error and focuses the first invalid field.
    validateAll: (form, fieldOrder) => {
      const firstInvalid = fieldOrder.find((name) => errors[name]);
      if (!firstInvalid) return true;
      setTouched(Object.fromEntries(fieldOrder.map((name) => [name, true])));
      form.elements[firstInvalid]?.focus();
      return false;
    },
    reset: (nextValues) => {
      setValues(nextValues);
      setTouched({});
    },
  };
}
