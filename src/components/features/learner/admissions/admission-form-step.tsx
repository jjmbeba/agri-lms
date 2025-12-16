"use client";

import { revalidateLogic, useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import FormError from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdmissionFormContext } from "./admission-form-context";
import type { AdmissionFormData } from "./admission-form-schema";
import { admissionFormSchema } from "./admission-form-schema";

type AdmissionFormStepProps = {
  handleNextStep: () => void;
  handleBackStep: () => void;
  disableBackStep?: boolean;
  courseName: string;
  departmentName: string;
  userEmail?: string;
};

const AdmissionFormStep = ({
  handleNextStep,
  handleBackStep,
  disableBackStep = false,
  courseName,
  departmentName,
  userEmail = "",
}: AdmissionFormStepProps) => {
  const { setFormData, formData } = useAdmissionFormContext();

  const form = useForm({
    defaultValues: {
      applicantPersonalDetails: {
        title:
          (formData?.applicantPersonalDetails?.title as
            | "Mr."
            | "Mrs."
            | "Miss") ?? ("Mr." as const),
        name: formData?.applicantPersonalDetails?.name ?? "",
        idNo: formData?.applicantPersonalDetails?.idNo ?? "",
        email: formData?.applicantPersonalDetails?.email ?? userEmail,
        phone: formData?.applicantPersonalDetails?.phone ?? "",
        county: formData?.applicantPersonalDetails?.county ?? "",
        subCounty: formData?.applicantPersonalDetails?.subCounty ?? "",
        ward: formData?.applicantPersonalDetails?.ward ?? "",
      },
      nextOfKinDetails: {
        name: formData?.nextOfKinDetails?.name ?? "",
        relationship: formData?.nextOfKinDetails?.relationship ?? "",
        phoneNo: formData?.nextOfKinDetails?.phoneNo ?? "",
      },
      declaration: {
        signature: formData?.declaration?.signature ?? "",
        date:
          formData?.declaration?.date ?? new Date().toISOString().split("T")[0],
      },
      courseSelection: {
        department: departmentName,
        courseName,
        courseMode:
          (formData?.courseSelection?.courseMode as
            | "Fully virtual"
            | "Partially virtual") ?? ("Fully virtual" as const),
        feeTerms:
          (formData?.courseSelection?.feeTerms as
            | "per module"
            | "for full course") ?? ("for full course" as const),
      },
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: admissionFormSchema,
    },
    onSubmit: ({ value }) => {
      setFormData(value as AdmissionFormData);
      handleNextStep();
    },
  });

  // Sync form with context data when it changes
  useEffect(() => {
    if (formData) {
      form.setFieldValue(
        "applicantPersonalDetails",
        formData.applicantPersonalDetails
      );
      form.setFieldValue("nextOfKinDetails", formData.nextOfKinDetails);
      form.setFieldValue("declaration", formData.declaration);
      form.setFieldValue("courseSelection", formData.courseSelection);
    }
  }, [formData, form]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="flex max-h-[60vh] flex-col gap-6 overflow-y-auto">
        {/* Section 1: Applicant Personal Details */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Applicant Personal Details</h3>

          <form.Field name="applicantPersonalDetails.title">
            {(field) => (
              <div className="grid gap-3">
                <Label htmlFor="title">Title *</Label>
                <Select
                  defaultValue={field.state.value}
                  onValueChange={(value) =>
                    field.handleChange(value as "Mr." | "Mrs." | "Miss")
                  }
                >
                  <SelectTrigger
                    aria-invalid={field.state.meta.errors.length > 0}
                    id="title"
                  >
                    <SelectValue placeholder="Select title" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mr.">Mr.</SelectItem>
                    <SelectItem value="Mrs.">Mrs.</SelectItem>
                    <SelectItem value="Miss">Miss</SelectItem>
                  </SelectContent>
                </Select>
                {field.state.meta.errors.map((error) => (
                  <FormError
                    key={error?.message}
                    message={error?.message ?? ""}
                  />
                ))}
              </div>
            )}
          </form.Field>

          <form.Field name="applicantPersonalDetails.name">
            {(field) => (
              <div className="grid gap-3">
                <Label htmlFor="name">Name *</Label>
                <Input
                  aria-invalid={field.state.meta.errors.length > 0}
                  id="name"
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter your full name"
                  value={field.state.value}
                />
                {field.state.meta.errors.map((error) => (
                  <FormError
                    key={error?.message}
                    message={error?.message ?? ""}
                  />
                ))}
              </div>
            )}
          </form.Field>

          <form.Field name="applicantPersonalDetails.idNo">
            {(field) => (
              <div className="grid gap-3">
                <Label htmlFor="idNo">ID Number *</Label>
                <Input
                  aria-invalid={field.state.meta.errors.length > 0}
                  id="idNo"
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter your ID number"
                  value={field.state.value}
                />
                {field.state.meta.errors.map((error) => (
                  <FormError
                    key={error?.message}
                    message={error?.message ?? ""}
                  />
                ))}
              </div>
            )}
          </form.Field>

          <form.Field name="applicantPersonalDetails.email">
            {(field) => (
              <div className="grid gap-3">
                <Label htmlFor="email">Email *</Label>
                <Input
                  aria-invalid={field.state.meta.errors.length > 0}
                  disabled
                  id="email"
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter your email address"
                  type="email"
                  value={field.state.value}
                />
                {field.state.meta.errors.map((error) => (
                  <FormError
                    key={error?.message}
                    message={error?.message ?? ""}
                  />
                ))}
              </div>
            )}
          </form.Field>

          <form.Field name="applicantPersonalDetails.phone">
            {(field) => (
              <div className="grid gap-3">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  aria-invalid={field.state.meta.errors.length > 0}
                  id="phone"
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter your phone number"
                  type="tel"
                  value={field.state.value}
                />
                {field.state.meta.errors.map((error) => (
                  <FormError
                    key={error?.message}
                    message={error?.message ?? ""}
                  />
                ))}
              </div>
            )}
          </form.Field>

          <div className="grid gap-4 md:grid-cols-3">
            <form.Field name="applicantPersonalDetails.county">
              {(field) => (
                <div className="grid gap-3">
                  <Label htmlFor="county">County *</Label>
                  <Input
                    aria-invalid={field.state.meta.errors.length > 0}
                    id="county"
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Enter county"
                    value={field.state.value}
                  />
                  {field.state.meta.errors.map((error) => (
                    <FormError
                      key={error?.message}
                      message={error?.message ?? ""}
                    />
                  ))}
                </div>
              )}
            </form.Field>

            <form.Field name="applicantPersonalDetails.subCounty">
              {(field) => (
                <div className="grid gap-3">
                  <Label htmlFor="subCounty">Sub County *</Label>
                  <Input
                    aria-invalid={field.state.meta.errors.length > 0}
                    id="subCounty"
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Enter sub county"
                    value={field.state.value}
                  />
                  {field.state.meta.errors.map((error) => (
                    <FormError
                      key={error?.message}
                      message={error?.message ?? ""}
                    />
                  ))}
                </div>
              )}
            </form.Field>

            <form.Field name="applicantPersonalDetails.ward">
              {(field) => (
                <div className="grid gap-3">
                  <Label htmlFor="ward">Ward *</Label>
                  <Input
                    aria-invalid={field.state.meta.errors.length > 0}
                    id="ward"
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Enter ward"
                    value={field.state.value}
                  />
                  {field.state.meta.errors.map((error) => (
                    <FormError
                      key={error?.message}
                      message={error?.message ?? ""}
                    />
                  ))}
                </div>
              )}
            </form.Field>
          </div>
        </div>

        {/* Section 2: Next of Kin Details */}
        <div className="space-y-4 border-t pt-4">
          <h3 className="font-semibold text-lg">Next of Kin Details</h3>

          <form.Field name="nextOfKinDetails.name">
            {(field) => (
              <div className="grid gap-3">
                <Label htmlFor="nextOfKinName">Name *</Label>
                <Input
                  aria-invalid={field.state.meta.errors.length > 0}
                  id="nextOfKinName"
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter next of kin name"
                  value={field.state.value}
                />
                {field.state.meta.errors.map((error) => (
                  <FormError
                    key={error?.message}
                    message={error?.message ?? ""}
                  />
                ))}
              </div>
            )}
          </form.Field>

          <form.Field name="nextOfKinDetails.relationship">
            {(field) => (
              <div className="grid gap-3">
                <Label htmlFor="relationship">Relationship *</Label>
                <Input
                  aria-invalid={field.state.meta.errors.length > 0}
                  id="relationship"
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g., Spouse, Parent, Sibling"
                  value={field.state.value}
                />
                {field.state.meta.errors.map((error) => (
                  <FormError
                    key={error?.message}
                    message={error?.message ?? ""}
                  />
                ))}
              </div>
            )}
          </form.Field>

          <form.Field name="nextOfKinDetails.phoneNo">
            {(field) => (
              <div className="grid gap-3">
                <Label htmlFor="nextOfKinPhone">Phone Number *</Label>
                <Input
                  aria-invalid={field.state.meta.errors.length > 0}
                  id="nextOfKinPhone"
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter next of kin phone number"
                  type="tel"
                  value={field.state.value}
                />
                {field.state.meta.errors.map((error) => (
                  <FormError
                    key={error?.message}
                    message={error?.message ?? ""}
                  />
                ))}
              </div>
            )}
          </form.Field>
        </div>

        {/* Section 3: Declaration */}
        <div className="space-y-4 border-t pt-4">
          <h3 className="font-semibold text-lg">Declaration</h3>

          <form.Field name="declaration.signature">
            {(field) => (
              <div className="grid gap-3">
                <Label htmlFor="signature">Signature *</Label>
                <Input
                  aria-invalid={field.state.meta.errors.length > 0}
                  id="signature"
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter your signature (full name)"
                  value={field.state.value}
                />
                {field.state.meta.errors.map((error) => (
                  <FormError
                    key={error?.message}
                    message={error?.message ?? ""}
                  />
                ))}
              </div>
            )}
          </form.Field>

          <form.Field name="declaration.date">
            {(field) => (
              <div className="grid gap-3">
                <Label htmlFor="date">Date *</Label>
                <Input
                  aria-invalid={field.state.meta.errors.length > 0}
                  disabled
                  id="date"
                  onChange={(e) => field.handleChange(e.target.value)}
                  type="date"
                  value={field.state.value}
                />
                {field.state.meta.errors.map((error) => (
                  <FormError
                    key={error?.message}
                    message={error?.message ?? ""}
                  />
                ))}
              </div>
            )}
          </form.Field>
        </div>

        {/* Section 4: Course Selection */}
        <div className="space-y-4 border-t pt-4">
          <h3 className="font-semibold text-lg">Course Selection</h3>

          <form.Field name="courseSelection.department">
            {(field) => (
              <div className="grid gap-3">
                <Label htmlFor="department">Department *</Label>
                <Input disabled id="department" value={field.state.value} />
                <p className="text-muted-foreground text-xs">
                  This field is pre-filled based on your course selection
                </p>
              </div>
            )}
          </form.Field>

          <form.Field name="courseSelection.courseName">
            {(field) => (
              <div className="grid gap-3">
                <Label htmlFor="courseName">Course Name *</Label>
                <Input disabled id="courseName" value={field.state.value} />
                <p className="text-muted-foreground text-xs">
                  This field is pre-filled based on your course selection
                </p>
              </div>
            )}
          </form.Field>

          <form.Field name="courseSelection.courseMode">
            {(field) => (
              <div className="grid gap-3">
                <Label>Course Mode *</Label>
                <RadioGroup
                  onValueChange={(value) =>
                    field.handleChange(
                      value as "Fully virtual" | "Partially virtual"
                    )
                  }
                  value={field.state.value}
                >
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem id="fully-virtual" value="Fully virtual" />
                    <Label
                      className="flex-1 cursor-pointer font-normal"
                      htmlFor="fully-virtual"
                    >
                      Fully virtual
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem
                      id="partially-virtual"
                      value="Partially virtual"
                    />
                    <Label
                      className="flex-1 cursor-pointer font-normal"
                      htmlFor="partially-virtual"
                    >
                      Partially virtual
                    </Label>
                  </div>
                </RadioGroup>
                {field.state.meta.errors.map((error) => (
                  <FormError
                    key={error?.message}
                    message={error?.message ?? ""}
                  />
                ))}
              </div>
            )}
          </form.Field>

          <form.Field name="courseSelection.feeTerms">
            {(field) => (
              <div className="grid gap-3">
                <Label>Fee Terms *</Label>
                <RadioGroup
                  onValueChange={(value) =>
                    field.handleChange(
                      value as "per module" | "for full course"
                    )
                  }
                  value={field.state.value}
                >
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem id="per-module" value="per module" />
                    <Label
                      className="flex-1 cursor-pointer font-normal"
                      htmlFor="per-module"
                    >
                      Per module
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem
                      id="for-full-course"
                      value="for full course"
                    />
                    <Label
                      className="flex-1 cursor-pointer font-normal"
                      htmlFor="for-full-course"
                    >
                      For full course
                    </Label>
                  </div>
                </RadioGroup>
                {field.state.meta.errors.map((error) => (
                  <FormError
                    key={error?.message}
                    message={error?.message ?? ""}
                  />
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <div className="flex items-center gap-4 border-t pt-4">
              <Button
                disabled={disableBackStep}
                onClick={handleBackStep}
                type="button"
                variant="outline"
              >
                Back
              </Button>
              <Button disabled={!canSubmit || isSubmitting} type="submit">
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Proceed to Payment"
                )}
              </Button>
            </div>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
};

export default AdmissionFormStep;
