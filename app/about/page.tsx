import { Card } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-purple-700 mb-4">About This System</h1>
      <Card className="p-5">
        <p className="text-slate-700 leading-relaxed">
          The <span className="font-semibold text-purple-600">Student Registration System</span> 
          is designed to make managing student records simple and efficient.  
          It allows registrars and administrators to:
        </p>

        <ul className="mt-4 list-disc pl-5 text-slate-600 space-y-2">
          <li>Add new students and store their details securely.</li>
          <li>Edit student information when updates are needed.</li>
          <li>Delete records for students who are no longer enrolled.</li>
          <li>Quickly search and organize data for smooth administration.</li>
        </ul>

        <p className="mt-4 text-slate-700">
          This platform was built with <span className="font-semibold">Next.js</span> and{" "}
          <span className="font-semibold">ShadCN UI</span> to ensure a modern, 
          reliable, and user-friendly experience.
        </p>
      </Card>
    </div>
  );
}
