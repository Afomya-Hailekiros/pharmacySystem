// app/page.tsx
"use client"
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://student-registration-system-jr0t.onrender.com";

type Student = {
  _id: string;
  studentId?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  age?: number;
  phoneNumber?: string;
  address?: { city?: string };
};

export default async function Home() {
  let students: Student[] = [];

  try {
    const res = await fetch(`${API}/api/v1/students`, { cache: "no-store" });
    const json = await res.json().catch(() => ({}));
    students = json?.data ?? [];
  } catch (err) {
    // don't crash the whole page — show empty state instead
    console.error("Failed to fetch students on homepage", err);
    students = [];
  }

  const total = students.length;
  const recent = students.slice(0, 4); // show up to 4 recent students

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <header className="flex items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <Image src="/next.svg" alt="App logo" width={48} height={48} priority />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">🎓 Student Admin</h1>
              <p className="text-sm text-slate-600">A lightweight dashboard for managing students </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/students" className="inline-block">
              <Button>Open Students</Button>
            </Link>

            <a
              href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="outline">Deploy</Button>
            </a>
          </div>
        </header>

        {/* Stats / Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-5">
            <p className="text-sm text-slate-500">Total students</p>
            <div className="mt-2 flex items-end justify-between">
              <p className="text-3xl font-bold">{total}</p>
              <p className="text-xs text-slate-400">Updated live</p>
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-sm text-slate-500">Quick actions</p>
            <div className="mt-3 flex flex-col gap-2">
              <Link href="/students">
                <Button className="w-full">View students</Button>
              </Link>
              <Link href="/students">
                <Button variant="outline" className="w-full">Add student</Button>
              </Link>
            </div>
          </Card>

          <Card className="p-5">
  <p className="text-sm text-slate-500">Welcome</p>
  <ul className="mt-3 list-disc pl-5 text-sm text-slate-600 space-y-1">
    <li>Use the <span className="font-semibold">Students</span> page to manage student records.</li>
    <li>You can add, edit, and delete student information anytime.</li>
    <li>This system helps you keep all student details organized in one place.</li>
    <li>Navigate through the menu above to access different sections.</li>
  </ul>
</Card>

        </section>

        {/* Recent students preview */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent students</h2>
            <Link href="/students" className="text-sm text-slate-500 hover:underline">View all</Link>
          </div>

          {recent.length === 0 ? (
            <Card className="p-6 text-slate-600">No students yet — go to the Students page to add one.</Card>
          ) : (
            <div className="grid gap-3">
              {recent.map((s) => (
                <Card key={s._id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{s.fullName ?? `${s.firstName ?? ""} ${s.lastName ?? ""}`}</p>
                    <p className="text-sm text-slate-500">{s.studentId ?? "—"} · {s.gender ?? "—"}</p>
                    <p className="text-sm text-slate-500">{s.address?.city ?? "-"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">{s.age ?? "-" } years</p>
                    <p className="text-xs text-slate-400">{s.phoneNumber ?? "-"}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-12 text-sm text-slate-500 text-center border-t pt-6">
  <p className="text-slate-600">
    © {new Date().getFullYear()} Student Registration System. All rights reserved.
  </p>
  <p className="mt-1 text-slate-400">
    Built with <span className="text-purple-600 font-semibold">Next.js</span> &{" "}
    <span className="text-yellow-500 font-semibold">ShadCN UI</span>
  </p>
</footer>

      </div>
    </div>
  );
}
