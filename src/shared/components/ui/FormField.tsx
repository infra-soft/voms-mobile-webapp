import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const inputBase =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-sage-700 focus:border-sage-700 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed';

const inputError = 'border-red-500 focus:ring-red-500 focus:border-red-500';

function FieldWrapper({ id, label, helpText, error, required, children }: {
  id: string; label?: string; helpText?: string; error?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      {helpText && !error && <p id={`${id}-help`} className="mt-1 text-xs text-slate-500">{helpText}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

export interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string; label?: string; helpText?: string; error?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ id, label, helpText, error, className, required, ...props }, ref) => (
    <FieldWrapper id={id} label={label} helpText={helpText} error={error} required={required}>
      <input
        id={id} ref={ref}
        aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
        aria-invalid={!!error} required={required}
        className={cn(inputBase, error && inputError, className)}
        {...props}
      />
    </FieldWrapper>
  ),
);
FormField.displayName = 'FormField';

export interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string; label?: string; helpText?: string; error?: string;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ id, label, helpText, error, className, required, ...props }, ref) => (
    <FieldWrapper id={id} label={label} helpText={helpText} error={error} required={required}>
      <textarea
        id={id} ref={ref}
        aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
        aria-invalid={!!error} required={required}
        className={cn(inputBase, 'resize-y min-h-[80px]', error && inputError, className)}
        {...props}
      />
    </FieldWrapper>
  ),
);
FormTextarea.displayName = 'FormTextarea';
