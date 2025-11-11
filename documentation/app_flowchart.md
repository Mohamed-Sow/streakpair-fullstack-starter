flowchart TD
    Start[Start]
    Start --> Landing[Landing Page]
    Landing --> SignUp[Sign Up]
    Landing --> SignIn[Sign In]
    SignUp --> Auth[Authentication]
    SignIn --> Auth
    Auth --> Dashboard[Dashboard]
    Dashboard --> CreateStreak[Create Streak]
    Dashboard --> ViewStreaks[View Streaks]
    Dashboard --> Groups[Group Management]
    Dashboard --> Subscription[Subscription]
    Dashboard --> Settings[Settings]
    CreateStreak --> Invite[Invite Partner]
    Invite --> StreakCreated[Streak Created]
    StreakCreated --> Dashboard
    ViewStreaks --> CheckIn[Daily Check In]
    CheckIn --> Validate[Validate Check In]
    Validate --> DBUpdate[Update Database]
    DBUpdate --> Notify[Notify Partner]
    Notify --> RealTime[Real Time Update]
    RealTime --> Dashboard
    Groups --> CreateGroup[Create Group]
    CreateGroup --> AddMembers[Add Members]
    AddMembers --> Dashboard
    Subscription --> SelectPlan[Select Plan]
    SelectPlan --> StripeProcess[Process Payment]
    StripeProcess --> Webhook[Stripe Webhook]
    Webhook --> Activate[Activate Subscription]
    Activate --> Dashboard
    Dashboard --> Reminders[Set Reminders]
    Reminders --> SMS[Send SMS Reminder]
    SMS --> Dashboard