import { forwardRef } from 'react'
import DatePicker, { registerLocale } from 'react-datepicker'
import { he } from 'date-fns/locale'
import 'react-datepicker/dist/react-datepicker.css'
import './BirthdayPicker.css'

registerLocale('he', he)

const CURRENT_YEAR = new Date().getFullYear()

const CustomInput = forwardRef(({ value, onClick, placeholder, style }, ref) => (
  <input
    ref={ref}
    value={value || ''}
    onClick={onClick}
    onChange={() => {}}
    readOnly
    dir="ltr"
    placeholder={placeholder}
    style={style}
  />
))
CustomInput.displayName = 'BirthdayPickerInput'

// value: 'YYYY-MM-DD' string or ''
// onChange: (isoString: string) => void
// inputStyle: style object for the <input> element
// style: style object for the outer wrapper div
export default function BirthdayPicker({ value, onChange, inputStyle, style }) {
  const selected = value
    ? (() => {
        const [y, m, d] = value.split('-').map(Number)
        return new Date(y, m - 1, d)
      })()
    : null

  function handleChange(date) {
    if (!date) { onChange(''); return }
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    onChange(`${y}-${m}-${d}`)
  }

  return (
    <div className="birthday-picker-wrapper" style={style}>
      <DatePicker
        locale="he"
        selected={selected}
        onChange={handleChange}
        dateFormat="dd/MM/yyyy"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        minDate={new Date(1940, 0, 1)}
        maxDate={new Date()}
        yearDropdownItemNumber={CURRENT_YEAR - 1939}
        placeholderText="DD/MM/YYYY"
        customInput={<CustomInput style={inputStyle} />}
        popperPlacement="bottom-start"
        showPopperArrow={false}
        popperProps={{ strategy: 'fixed' }}
      />
    </div>
  )
}
