# App Flow Document

## Onboarding and Sign-In/Sign-Up
When a new user discovers the StreakPair app, they typically land on a public welcome page where they see a brief overview of the app’s purpose and core benefits. From this page, users can choose to sign up or sign in by clicking the respective buttons in the header. To create an account, a user enters their email address and a password on the sign-up page and then confirms their email via a link sent to their inbox. Alternatively, they can choose to sign up using a social login option by clicking the Google or Apple button, granting the app permission to access basic profile information. After the sign-up form is submitted and any email verification step is completed, the app automatically logs the user in and redirects them to the dashboard.

If a returning user clicks “Sign In,” they are taken to a page where they enter their credentials or choose a social login option. After successful authentication, the user is redirected to the main dashboard. If a user forgets their password, they can click “Forgot Password” on the sign-in page. This takes them to a form where they enter their registered email, triggering an email with a secure link. Following the link allows them to set a new password. Once the password reset is complete, they can sign in again with the updated credentials. To sign out, the user clicks their profile avatar in the top right corner of any page, then selects “Sign Out,” which returns them to the public welcome page.

## Main Dashboard or Home Page
After signing in, the user lands on the dashboard, which serves as the central hub for all StreakPair features. The page is divided into a left sidebar, a top header bar, and a main content area. The sidebar lists navigation items labeled “My Streaks,” “Groups,” “Notifications,” and “Settings.” The header displays the app logo, a search field, and the user’s avatar with a dropdown menu for account-related actions.

In the main content area, users first see a summary widget highlighting their active shared streaks with partners. Below that, there is a visual timeline or chart showing recent daily check-in activity. Further down, a section titled “Upcoming Reminders” shows any scheduled SMS or in-app nudges. From this dashboard, the user can click on any streak card to view details and check in for the day, or they can click the “+ Create Streak” button in the header to start a new challenge.

## Detailed Feature Flows and Page Transitions

### Shared Streak Tracking and Daily Check-Ins
To create a new shared streak, the user clicks “Create Streak” in the dashboard header. They are guided through a form where they name the streak, select or invite a partner by email, and choose a start date and check-in frequency. After submitting, the app creates the streak record and sends an invitation email to the partner. Both users see the new streak appear on their dashboard once the partner accepts.

Each day, users click on a streak card in the dashboard to navigate to that streak’s detail page. There, they see a calendar view showing past check-ins and a large button labeled “Check In.” When they click it, the app records the check-in via an API call and updates the streak’s visual progress immediately. If a user misses a check-in, the app displays a prompt reminding them that the streak is at risk.

### Group Collaboration and Management
To work with larger teams, the user clicks “Groups” in the sidebar. On the groups overview page, they see a list of squads and tribes they belong to, along with a “Create Group” button. The create form prompts for a group name, description, role settings, and invitation options. Once the group is created, the user is taken to the group’s page, where they can invite members by email, assign roles, and view a combined activity chart.

Within a group page, each member’s individual streaks are listed in a shared data table. The user can click on a member’s name to view their personal streak details or click the group’s collective streak chart to see overall performance trends. Notifications about new join requests, pending invitations, or group milestones appear in the “Notifications” section.

### Monetization and Subscription Handling
Premium features are gated behind a subscription. When a free user attempts to access a premium feature—such as SMS reminders or advanced analytics—the app shows a prompt describing the premium plan and a button to “Upgrade.” Clicking this button takes the user to the Billing page under Settings. Here, they see plan options with pricing, a secure payment form powered by Stripe, and details of what’s included in each tier. After submitting payment details, the app calls the Stripe API to create the subscription, displays a success message, and immediately unlocks premium features. Subscription status and billing history are displayed in this same billing area.

### Real-time Notifications and Reminders
Notifications arrive in two ways: in-app banners and optional SMS messages. If a user opts in for SMS, they enter and verify their phone number in the Notifications Settings page. When a partner checks in or a streak is about to break, the app sends a push notification immediately and, for subscribed users, an SMS is dispatched via Twilio. Users can click a notification in the header bar to view its details or navigate directly to the relevant streak or group page.

## Settings and Account Management
The user accesses Settings by clicking their avatar in the header and selecting “Settings.” The Settings page has tabs for Profile, Security, Notifications, and Billing. In Profile, the user can update their name, email address, and profile picture. In Security, they can change their password or link additional social accounts. The Notifications tab lets them toggle email, in-app, and SMS reminders, and specify quiet hours. The Billing tab shows subscription details and payment history, and allows plan changes or cancellation.

After making any changes, the user clicks “Save” to update their preferences. A toast message confirms success, and the user remains on the Settings page until they navigate elsewhere via the sidebar or header. To return to the dashboard, they click the “Home” item in the sidebar.

## Error States and Alternate Paths
If a user enters invalid data on any form—for example, a poorly formatted email or a credit card number that fails validation—the app highlights the field in red and displays an inline error message explaining the issue. If the network drops during a check-in or subscription process, a full-screen overlay briefly appears with a message like “Connection lost. Retrying…” and automatically retries the request. If the request ultimately fails, a banner prompts the user to reload the page or check their internet connection.

When an unauthorized user tries to access a premium page or an admin-only area, the app redirects them to an “Access Denied” page that offers links back to the dashboard or to the upgrade flow. For expired sessions, any API call returns a 401 status, triggering a redirect to the sign-in page with a message asking the user to log in again.

## Conclusion and Overall App Journey
From discovering the app on the public welcome page to registering and verifying their email, the user moves smoothly into the main dashboard. There, they create shared streaks, check in daily, form and manage groups, and optionally subscribe to premium features. Notifications keep them engaged, while the Settings section ensures they remain in control of their preferences and account security. Throughout, clear error handling and messaging guide the user back on track whenever something unexpected happens. With this flow, users can focus on building and maintaining healthy habits together, supported by StreakPair’s full suite of collaboration, tracking, and notification tools.