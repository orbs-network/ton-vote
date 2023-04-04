import { create } from "zustand";
import { FormData } from "./form";

interface Store {
  preview: boolean;
  setPreview: (value: boolean) => void;
  formData: FormData;
  setFormData: (value: FormData) => void;
}
export const useCreateProposalStore = create<Store>((set) => ({
  preview: false,
  setPreview: (preview) => set({ preview }),
  formData: {title:'', description:''} as FormData,
  setFormData: (formData) => set({ formData }),
}));
