"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Option } from "../types";

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void; // string, NOT event
  options: Option[];
  placeholder?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
}) => (
  <div className="flex flex-col gap-1">
    <Label>{label}</Label>
    <Select value={value} onValueChange={onChange}> {/* onValueChange passes string, not event */}
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option._id} value={option._id}>
            {option.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
