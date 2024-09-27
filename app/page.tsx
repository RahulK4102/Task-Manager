import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, LayoutDashboard, Users, Calendar } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b border-gray-800">
        <Link className="flex items-center justify-center" href="#">
          <CheckCircle className="h-6 w-6 mr-2 text-blue-500" />
          <span className="font-bold text-xl">Task Manager</span>
        </Link>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Manage Tasks with Ease
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-400 md:text-xl">
                  Task Manager helps you organize, track, and complete your tasks efficiently. Boost your productivity today!
                </p>
              </div>
              <div>
                <Button asChild>
                  <Link href="/signupORlogin">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-800">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Features</h2>
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-gray-700">
                <LayoutDashboard className="h-12 w-12 mb-2 text-blue-500" />
                <h3 className="text-xl font-bold">Intuitive Dashboard</h3>
                <p className="text-gray-300 text-center">Get a clear overview of all your tasks at a glance.</p>
              </div>
              <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-gray-700">
                <Users className="h-12 w-12 mb-2 text-blue-500" />
                <h3 className="text-xl font-bold">Team Collaboration</h3>
                <p className="text-gray-300 text-center">Easily share and assign tasks within your team.</p>
              </div>
              <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-gray-700">
                <Calendar className="h-12 w-12 mb-2 text-blue-500" />
                <h3 className="text-xl font-bold">Smart Scheduling</h3>
                <p className="text-gray-300 text-center">Set deadlines and get reminders for your tasks.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
