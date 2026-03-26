import { useState } from "react";

export function useForm(initial) {
  const [values, setValues] = useState(initial);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const set = (name, value) => setValues((prev) => ({ ...prev, [name]: value }));
  const reset = () => setValues(initial);

  return { values, handleChange, set, reset, setValues };
}
