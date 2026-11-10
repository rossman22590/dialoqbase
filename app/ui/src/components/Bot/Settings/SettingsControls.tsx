import React from "react";

// A `ui-switch` that works as an antd Form control (use with
// valuePropName="checked"). onChange gets a boolean, like antd's Switch.
export const SwitchControl = ({
  checked,
  onChange,
  disabled,
  label,
  id,
}: {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label: string;
  id?: string;
}) => (
  <button
    id={id}
    type="button"
    role="switch"
    aria-checked={!!checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => onChange?.(!checked)}
    className="ui-switch disabled:cursor-not-allowed disabled:opacity-50"
  >
    <span />
  </button>
);

// One row in a bordered list of toggles: text on the left, switch on the right.
export const ToggleRow = ({
  label,
  help,
  children,
  first,
}: {
  label: React.ReactNode;
  help?: React.ReactNode;
  children: React.ReactNode;
  first?: boolean;
}) => (
  <div
    className={`flex items-center gap-4 px-4 py-3 ${
      first ? "" : "border-t border-line"
    }`}
  >
    <div className="min-w-0 flex-1">
      <p className="m-0 text-sm font-medium text-fg">{label}</p>
      {help && <p className="m-0 mt-0.5 text-[13px] text-fg-muted">{help}</p>}
    </div>
    {children}
  </div>
);
