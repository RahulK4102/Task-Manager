import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function page() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-100">
      <Card className="w-[90%] max-w-[600px] bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center mb-2">Welcome to TaskManager</CardTitle>
          <CardDescription className="text-gray-400 text-center text-lg">
            Organize your tasks, boost your productivity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>Create and organize tasks effortlessly</li>
            <li>Set priorities and due dates</li>
            <li>Track your progress with our intuitive Kanban board</li>
          </ul>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/signupORlogin">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}