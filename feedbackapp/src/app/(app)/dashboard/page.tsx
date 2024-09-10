'use client'
import React, { use, useCallback, useEffect } from 'react'
import { Message, User } from '@/model/User'
import { useToast } from '@/components/ui/use-toast'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { acceptMessageSchema } from '@/schemas/acceptMessageSchema'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Loader2, RefreshCcw } from 'lucide-react'
import MessageCard from '@/components/MessageCard'

const page = () => {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [isloading, setIsLoading] = React.useState(true)
  const [isSwitchLoading, setIsSwitchLoading] = React.useState(false)
  const toast: any = useToast()
  const handleDeleteMessage = (messageId: string) => {
    setMessages((prevMessages) => prevMessages.filter((message) => message._id !== messageId))
  }
  const { data: session } = useSession()
  const form = useForm(
    {
      resolver: zodResolver(acceptMessageSchema)
    },
  )
  const { register, watch, setValue } = form;

  const acceptMessages = watch('acceptMessages')
  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true)
    try {
      const response = await axios.get('/api/accept-messages')
      setValue('acceptMessages', response.data.isAcceptingMessages)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast({
        title: "Error",
        description: axiosError.response?.data.message || 'An unexpected error occurred',
        variant: 'destructive'
      })
    } finally {
      setIsSwitchLoading(false)
    }
  }, [setValue])
  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    setIsLoading(true)
    setIsSwitchLoading(true)
    try {
      const response = await axios.get<ApiResponse>('/api/messages')
      setMessages(response.data.messages || [])
      if (refresh) {
        toast({
          title: "Refreshed Messages",
          description: "Showing the latest messages",
        })
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast({
        title: "Error",
        description: axiosError.response?.data.message || 'An unexpected error occurred',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
      setIsSwitchLoading(false)
    }
  }, [setIsLoading, setMessages])

  useEffect(() => {
    if (!session || !session?.user) return
    fetchMessages()
    fetchAcceptMessages()
  }, [session, setValue, fetchAcceptMessages, fetchMessages])

  //handle accept messages
  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>('/api/accept-messages', {
        isAcceptingMessages: !acceptMessages
      })
      setValue('acceptMessages', !acceptMessages)
      toast({
        title: response.data.message,
        varient: 'default'
      })
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast({
        title: "Error",
        description: axiosError.response?.data.message || 'An unexpected error occurred',
        variant: 'destructive'
      })
    }
  }
  const { username } = session?.user as User
  const baseUrl = `${window.location.protocol}//${window.location.host}`
  const profileUrl = `${baseUrl}/u/${username}`

  const copytoClipboard = () => {
    navigator.clipboard.writeText(profileUrl)
    toast({
      title: "Copied to Clipboard",
      description: "Your profile URL has been copied to your clipboard",
    })
  }

    if (!session || !session.user) {
      return (
        <div>
          <p>You need to be logged in to view this page</p>
        </div>
      )
    }

    return (<>
      <div className='my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white'>
        <h1 className='text-4xl font-bold mb-4'>User Dashboard</h1>
        <div className='flex items-center'>
          <input
            type='text'
            value={profileUrl}
            disabled
            className='input input-bordered w-full p-2 mr-2'
          />
          <Button onClick={copytoClipboard}>Copy</Button>
        </div>
        <div className='mb-4'>
          <Switch
            {...register("acceptMessages")}
            checked={acceptMessages}
            onCheckedChange={handleSwitchChange}
            disabled={isSwitchLoading}
          />
          <span className='ml-2'>Accept Messages: {acceptMessages ? "On" : "Off"}</span>
        </div>
        <Separator />
        <Button
          className='mt-4'
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            fetchMessages(true)
          }}
        >
          {isloading ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <RefreshCcw className='h-4 w-4' />
          )}
        </Button>
        <div className='mt-4 grid grid-cols-1 md:grid-cols-2 gap-6'>
          {messages.length > 0 ? (
            messages.map((message, index) => (
            <MessageCard
              // key={message._id}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
            <p>No messages to displzy.</p>
          )}
        </div>
      </div>
    </>)
  }

  export default page
