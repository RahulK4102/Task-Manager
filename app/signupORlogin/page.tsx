'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import axios from 'axios'

export default function LoginSignupPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup'
      const payload = isLogin ? { email, password } : { username, email, password }
      
      const response = await axios.post(endpoint, payload, {
        headers: { 'Content-Type': 'application/json' },
      })

      const userData = response.data
      localStorage.setItem('token', userData.token)
      router.push('/task')
    } catch (error) {
      setError(`An error occurred. Please try again. ${error}`)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setError('')
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <Card className="w-[350px] bg-gray-800 text-gray-100 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{isLogin ? 'Log In' : 'Sign Up'}</CardTitle>
          <CardDescription className="text-gray-400">
            {isLogin ? 'Enter your credentials to access your account.' : 'Create a new account to get started.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              {!isLogin && (
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="username" className="text-gray-300">Username</Label>
                  <Input 
                    id="username" 
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500"
                  />
                </div>
              )}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500"
                />
              </div>
            </div>
            {error && (
              <Alert variant="destructive" className="mt-4 bg-red-900 text-red-100 border-red-800">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button className="w-full mt-4 bg-blue-600 text-white hover:bg-blue-700" type="submit">
              {isLogin ? 'Log In' : 'Sign Up'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <Button
              variant="link"
              className="text-blue-400 hover:text-blue-300 p-0"
              onClick={toggleMode}
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}