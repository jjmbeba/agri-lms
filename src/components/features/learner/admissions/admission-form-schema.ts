// biome-ignore lint/performance/noNamespaceImport: Recommended by Zod
import * as z from "zod";

export const admissionFormSchema = z.object({
  applicantPersonalDetails: z.object({
    title: z.enum(["Mr.", "Mrs.", "Miss"], {
      message: "Please select a title",
    }),
    name: z.string().min(1, {
      message: "Name is required",
    }),
    idNo: z.string().min(1, {
      message: "ID Number is required",
    }),
    email: z.string().email({
      message: "Please enter a valid email address",
    }),
    phone: z.string().min(1, {
      message: "Phone number is required",
    }),
    county: z.string().min(1, {
      message: "County is required",
    }),
    subCounty: z.string().min(1, {
      message: "Sub County is required",
    }),
    ward: z.string().min(1, {
      message: "Ward is required",
    }),
  }),
  nextOfKinDetails: z.object({
    name: z.string().min(1, {
      message: "Next of kin name is required",
    }),
    relationship: z.string().min(1, {
      message: "Relationship is required",
    }),
    phoneNo: z.string().min(1, {
      message: "Next of kin phone number is required",
    }),
  }),
  declaration: z.object({
    signature: z.string().min(1, {
      message: "Signature is required",
    }),
    date: z.string().min(1, {
      message: "Date is required",
    }),
  }),
  courseSelection: z.object({
    department: z.string().min(1, {
      message: "Department is required",
    }),
    courseName: z.string().min(1, {
      message: "Course name is required",
    }),
    courseMode: z.enum(["Fully virtual", "Partially virtual"], {
      message: "Please select a course mode",
    }),
    feeTerms: z.enum(["per module", "for full course"], {
      message: "Please select fee terms",
    }),
  }),
});

export type AdmissionFormData = z.infer<typeof admissionFormSchema>;
