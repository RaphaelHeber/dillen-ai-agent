"use client"

import { Brand } from "@/components/ui/brand"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SubmitButton } from "@/components/ui/submit-button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { StepContainer } from "@/components/setup/step-container"
import { ProfileStep } from "@/components/setup/profile-step"
import { FinishStep } from "@/components/setup/finish-step"

export const SETUP_STEP_COUNT = 2 // Reduced to 2 steps: Profile and Finish

export default function SetupPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [error, setError] = useState<string>("")

  // Profile Step
  const [displayName, setDisplayName] = useState("")
  const [username, setUsername] = useState("")
  const [usernameAvailable, setUsernameAvailable] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (!session) {
        return router.push("/login")
      }

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single()

        if (profile?.has_onboarded) {
          // If user has already onboarded, redirect to home workspace
          const { data: workspace } = await supabase
            .from("workspaces")
            .select("*")
            .eq("user_id", session.user.id)
            .eq("is_home", true)
            .single()

          if (workspace) {
            return router.push(`/${workspace.id}/chat`)
          }
        }

        if (profile) {
          setUsername(profile.username || "")
          setDisplayName(profile.display_name || "")
        }

        setLoading(false)
      } catch (error) {
        console.error("Setup error:", error)
        setError("Failed to load profile")
        setLoading(false)
      }
    }

    checkSession()
  }, [router, supabase])

  const handleShouldProceed = async (proceed: boolean) => {
    if (proceed) {
      if (currentStep === SETUP_STEP_COUNT) {
        await handleSaveSetup()
      } else {
        setCurrentStep(currentStep + 1)
      }
    } else {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSaveSetup = async () => {
    try {
      const {
        data: { session }
      } = await supabase.auth.getSession()
      if (!session) return router.push("/login")

      // Update profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          username: username,
          has_onboarded: true,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", session.user.id)
        .select()
        .single()

      if (profileError) throw profileError

      // Create home workspace if it doesn't exist
      const { data: workspace, error: workspaceError } = await supabase
        .from("workspaces")
        .insert([
          {
            name: `${displayName}'s Workspace`,
            user_id: session.user.id,
            is_home: true
          }
        ])
        .select()
        .single()

      if (workspaceError) throw workspaceError

      return router.push(`/${workspace.id}/chat`)
    } catch (error) {
      console.error("Save setup error:", error)
      setError("Failed to save setup")
    }
  }

  const renderStep = (stepNum: number) => {
    switch (stepNum) {
      case 1:
        return (
          <StepContainer
            stepDescription="Let's create your profile."
            stepNum={currentStep}
            stepTitle="Welcome to Dillen AI Agent"
            onShouldProceed={handleShouldProceed}
            showNextButton={!!(username && usernameAvailable)}
            showBackButton={false}
          >
            <ProfileStep
              username={username}
              usernameAvailable={usernameAvailable}
              displayName={displayName}
              onUsernameAvailableChange={setUsernameAvailable}
              onUsernameChange={setUsername}
              onDisplayNameChange={setDisplayName}
            />
          </StepContainer>
        )

      case 2:
        return (
          <StepContainer
            stepDescription="You're all set!"
            stepNum={currentStep}
            stepTitle="Setup Complete"
            onShouldProceed={handleShouldProceed}
            showNextButton={true}
            showBackButton={true}
          >
            <FinishStep displayName={displayName} />
          </StepContainer>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="flex h-full items-center justify-center">
      {renderStep(currentStep)}
    </div>
  )
}
