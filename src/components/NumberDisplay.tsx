import { NumericFormat } from "react-number-format";

export function NumberDisplay({
  value,
  decimalScale = 2,
  prefix,
  className = "",
  suffix,
}: {
  value?: string | number;
  decimalScale?: number;
  prefix?: string;
  className?: string;
  suffix?: string;
}) {
  if (value === "0") {
    return <>0</>;
  }

  return (
    <NumericFormat
      type="text"
      valueIsNumericString={true}
      value={value}
      allowLeadingZeros
      thousandSeparator=","
      className={`number-display ${className}`}
      displayType="text"
      decimalScale={decimalScale}
      prefix={prefix}
      suffix={suffix}
    />
  );
}

