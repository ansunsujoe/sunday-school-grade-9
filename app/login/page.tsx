import { LogoMark } from "@/components/icons";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <LogoMark className="mx-auto size-14" />
          <h1 className="mt-5 font-display text-3xl font-semibold text-slate-50">
            Grade 9 Sunday School
          </h1>
          <p className="mt-2 text-sm text-slate-400">Sign in with the account your teacher gave you.</p>
        </div>
        <div className="rounded-2xl border border-line bg-night-900/70 p-6 shadow-2xl shadow-black/40 backdrop-blur-sm">
          <LoginForm />
        </div>
        <figure className="mt-10 text-center">
          <blockquote className="font-display text-lg text-slate-300 italic">
            “Your word is a lamp for my feet, a light on my path.”
          </blockquote>
          <figcaption className="mt-1 text-xs tracking-[0.2em] text-amber-300/70 uppercase">
            Psalm 119:105
          </figcaption>
        </figure>
      </div>
    </main>
  );
}
