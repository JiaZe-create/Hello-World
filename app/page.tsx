import { connection } from "next/server";
import { getCourses, type Course } from "@/lib/courses";

export default async function Home() {
  await connection();
  let courses: Course[] = [];
  let failed = false;
  try {
    courses = await getCourses();
  } catch (error) {
    failed = true;
    console.error(error instanceof Error ? error.message : "Unable to load courses.");
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-24">
      <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Course catalog</p>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Explore the courses</h1>
      <p className="mt-5 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">A place to discover your next subject.</p>
      {failed ? (
        <div role="alert" className="mt-10 rounded-2xl border border-amber-300 bg-amber-50 p-6 text-amber-950">
          <h2 className="font-semibold">Courses are temporarily unavailable</h2>
          <p className="mt-2">Please try refreshing this page in a moment.</p>
        </div>
      ) : courses.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-zinc-300 p-6">No courses have been added yet.</p>
      ) : (
        <>
          <p className="mb-5 mt-12 text-sm text-zinc-500">{courses.length} {courses.length === 1 ? "course" : "courses"} available</p>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <li key={course.id} className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{course.code}</p>
                <h2 className="mt-4 text-xl font-semibold">{course.title}</h2>
                <p className="mt-3 leading-7 text-zinc-600 dark:text-zinc-400">{course.description}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
