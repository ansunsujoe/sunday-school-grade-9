import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-4xl">✝</div>
          <h1 className="mt-2 text-2xl font-semibold text-stone-900">Grade 9 Sunday School</h1>
          <p className="mt-1 text-sm text-stone-600">Sign in with the account your teacher gave you.</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
