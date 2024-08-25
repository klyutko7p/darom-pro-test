import { defineStore } from "pinia";
import { useToast } from "vue-toastification";

const toast = useToast();

interface ValidationRule {
  field: string;
  message: string;
  validate: (value: any) => boolean;
}

export const useFunctionsStore = defineStore("functions", () => {
  function checkValidation(data: Record<string, any>, rules: ValidationRule[]) {
    for (const rule of rules) {
      const value = data[rule.field];
      if (!rule.validate(value)) {
        toast.error(rule.message);
        return false;
      }
    }
    return true;
  }

  return {
    checkValidation,
  };
});
