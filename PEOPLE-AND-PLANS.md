# People and plans prototype

The Final interface adds participant avatars, an Add people flow, per-person inbox previews, and My plans with Involved in / Hosting filters. The creator is the plan host. Only that host can add participants through the plan UI. Existing plan expenses retain their participant list during migration.

Try Add people → enter a name → My plans → create a plan → add that person. In Add people or Inbox, change Preview as to see their notifications and plans. New demo messages, plan invitations, details changes and task assignments produce local inbox items. Inbox items become read when opened. Plans, people and notifications persist on this browser. Restart demo clears them.

This is a single-browser interaction prototype. Names are not verified accounts. Preview as is not authentication or access control. Invitations, chat delivery and notifications are simulated: no email, SMS, push delivery, live sharing or server synchronization occurs. Production collaboration needs authenticated identities, server-side membership/host enforcement, durable shared storage, and a notification delivery service.
