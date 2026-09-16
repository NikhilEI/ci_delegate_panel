"use client";

import { countries } from "@/lib/countries";

export default function CountrySelect({ id, name, value, onChange, className = "form-control form-select", placeholder = "Choose a Country" }) {
  return (
    <select
      id={id}
      name={name}
      className={className}
      value={value}
      required
      onChange={(event) => {
        const option = event.target.selectedOptions[0];
        onChange({
          name: event.target.value,
          code: option ? option.getAttribute("data-countrycode") || "" : "",
        });
      }}
    >
      <option value="">{placeholder}</option>
      {countries.map((country, index) => (
        <option key={`${country.name}-${country.iso}-${index}`} value={country.name} data-countrycode={country.code}>
          {country.name} (+{country.code})
        </option>
      ))}
    </select>
  );
}
