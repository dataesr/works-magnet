import './styles.scss';

export default function CustomToggle({ checked, disabled, label, onChange }) {
  return (
    <div>
      <span className={`${disabled ? 'disabled-text' : ''}`}>
        {label}
      </span>
      <br />
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label className="switch" htmlFor={`${label}-switch`} title={label}>
        <input
          id={`${label}-switch`}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          label={label}
          onChange={onChange}
        />
        <span className={`slider round ${disabled ? 'disabled' : ''}`} />
      </label>
    </div>
  );
}
