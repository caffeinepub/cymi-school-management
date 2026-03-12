import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { useState } from "react";

export default function NewAdmissionPage() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);

  const [docs, setDocs] = useState({
    birthCert: false,
    tc: false,
    marksheet: false,
    photos: false,
    aadhar: false,
  });

  function handleSubmit() {
    setSubmitted(true);
    setTimeout(() => navigate({ to: "/admissions/all" }), 1500);
  }

  function handleDraft() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const SectionHeader = ({ title }: { title: string }) => (
    <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3 pb-1 border-b border-blue-100">
      {title}
    </h3>
  );

  const Field = ({
    label,
    id,
    type = "text",
    options,
  }: { label: string; id: string; type?: string; options?: string[] }) => (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-gray-600">
        {label}
      </label>
      {options ? (
        <select
          id={id}
          data-ocid={`new_admission.${id}.select`}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">Select</option>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : (
        <Input id={id} data-ocid={`new_admission.${id}.input`} type={type} />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserPlus className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-800">New Admission</h1>
            <p className="text-sm text-gray-500">
              Fill in the details to register a new student admission
            </p>
          </div>
        </div>
        <div className="flex gap-2 text-sm">
          <button
            type="button"
            onClick={() => navigate({ to: "/admissions/all" })}
            className="text-blue-600 hover:underline"
          >
            All Admissions
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">New</span>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {submitted && (
          <div
            data-ocid="new_admission.success_state"
            className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 text-green-800 font-medium"
          >
            Admission submitted successfully! Redirecting...
          </div>
        )}
        {saved && (
          <div
            data-ocid="new_admission.loading_state"
            className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 text-blue-800"
          >
            Draft saved!
          </div>
        )}

        {/* Student Information */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <SectionHeader title="Student Information" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="First Name" id="first_name" />
            <Field label="Last Name" id="last_name" />
            <Field label="Date of Birth" id="dob" type="date" />
            <Field
              label="Gender"
              id="gender"
              options={["Male", "Female", "Other"]}
            />
            <Field label="Nationality" id="nationality" />
            <Field
              label="Religion"
              id="religion"
              options={["Hindu", "Muslim", "Christian", "Sikh", "Other"]}
            />
            <Field
              label="Category"
              id="category"
              options={["General", "OBC", "SC", "ST"]}
            />
            <Field label="Aadhar Number" id="aadhar" />
          </div>
        </div>

        {/* Academic Details */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <SectionHeader title="Academic Details" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field
              label="Class Applying For"
              id="class_applied"
              options={Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`)}
            />
            <Field
              label="Section"
              id="section"
              options={["A", "B", "C", "D"]}
            />
            <Field label="Previous School" id="prev_school" />
            <Field
              label="Board"
              id="board"
              options={["CBSE", "ICSE", "State Board", "Other"]}
            />
            <Field label="% in Last Exam" id="prev_percent" type="number" />
            <Field
              label="Academic Year"
              id="academic_year"
              options={["2026-27", "2025-26"]}
            />
          </div>
        </div>

        {/* Parent / Guardian Info */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <SectionHeader title="Parent / Guardian Information" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Father's Name" id="father_name" />
            <Field label="Father's Occupation" id="father_occ" />
            <Field label="Father's Phone" id="father_phone" type="tel" />
            <Field label="Mother's Name" id="mother_name" />
            <Field label="Mother's Occupation" id="mother_occ" />
            <Field label="Mother's Phone" id="mother_phone" type="tel" />
            <Field label="Email" id="email" type="email" />
            <Field label="Emergency Contact" id="emergency" type="tel" />
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <SectionHeader title="Address" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="col-span-2 flex flex-col gap-1">
              <label
                htmlFor="res_address"
                className="text-xs font-medium text-gray-600"
              >
                Residential Address
              </label>
              <textarea
                id="res_address"
                data-ocid="new_admission.res_address.textarea"
                rows={2}
                className="border rounded-md px-3 py-2 text-sm resize-none"
              />
            </div>
            <Field label="City" id="city" />
            <Field
              label="State"
              id="state"
              options={[
                "Maharashtra",
                "Delhi",
                "Karnataka",
                "Tamil Nadu",
                "UP",
                "Gujarat",
                "Rajasthan",
                "Other",
              ]}
            />
            <Field label="PIN Code" id="pin" />
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <SectionHeader title="Documents Checklist" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(
              [
                ["birthCert", "Birth Certificate"],
                ["tc", "Transfer Certificate (TC)"],
                ["marksheet", "Previous Marksheet"],
                ["photos", "Passport Photos (x4)"],
                ["aadhar", "Aadhar Card Copy"],
              ] as [keyof typeof docs, string][]
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  data-ocid={`new_admission.${key}.checkbox`}
                  checked={docs[key]}
                  onChange={(e) =>
                    setDocs((d) => ({ ...d, [key]: e.target.checked }))
                  }
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm text-gray-700">{label}</span>
                {docs[key] && <span className="text-green-500 text-xs">✓</span>}
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pb-6">
          <Button
            data-ocid="new_admission.cancel_button"
            variant="outline"
            onClick={() => navigate({ to: "/admissions/all" })}
          >
            Cancel
          </Button>
          <Button
            data-ocid="new_admission.secondary_button"
            variant="outline"
            onClick={handleDraft}
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            Save as Draft
          </Button>
          <Button
            data-ocid="new_admission.submit_button"
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Submit Application
          </Button>
        </div>
      </div>
    </div>
  );
}
