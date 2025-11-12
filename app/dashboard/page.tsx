import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { StreakDashboard } from "@/components/streak/streak-dashboard"
import { CreateStreakModal } from "@/components/streak/create-streak-modal"
import { streakService } from "@/lib/services/streak.service"
import { createStreakSchema } from "@/lib/validations/streak"

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user?.id) {
    redirect("/sign-in")
  }

  const userId = session.user.id

  const handleCreateStreak = async (data: {
    title: string
    description?: string
    category: string
    type: string
    maxParticipants: number
    timezone: string
    reminderTime?: string
  }) => {
    "use server"

    try {
      const validatedData = createStreakSchema.parse({
        ...data,
        createdBy: userId,
      })

      await streakService.createStreak(validatedData)
    } catch (error) {
      console.error("Error creating streak:", error)
      throw new Error(error instanceof Error ? error.message : "Failed to create streak")
    }
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <StreakDashboard
          userId={userId}
          className="px-4 lg:px-6"
        />

        {/* Floating Create Streak Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <CreateStreakModal
            onCreateStreak={handleCreateStreak}
            trigger={
              <button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline font-medium">Create Streak</span>
              </button>
            }
          />
        </div>
      </div>
    </div>
  )
}