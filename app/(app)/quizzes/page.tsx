import { redirect } from "next/navigation";

// Quizzes are listed in the Content tab now, under the lessons.
export default function QuizzesPage() {
  redirect("/content#quizzes");
}
