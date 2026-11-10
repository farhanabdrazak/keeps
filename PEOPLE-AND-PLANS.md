# People and plans prototype

The Final interface adds participant avatars, an Add people flow, per-person inbox previews, and My plans with Involved in / Hosting filters. The creator is the plan host. Only that host can add participants through the plan UI. Existing plan expenses retain their participant list during migration.

Try Add people → enter a name → My plans → create a plan → add that person. In Add people or Inbox, change Preview as to see their notifications and plans. New demo messages, plan invitations, details changes and task assignments produce local inbox items. Inbox items become read when opened. Plans, people and notifications persist on this browser. Restart demo clears them.

This is a single-browser interaction prototype. Names are not verified accounts. Preview as is not authentication or access control. Invitations, chat delivery and notifications are simulated: no email, SMS, push delivery, live sharing or server synchronization occurs. Production collaboration needs authenticated identities, server-side membership/host enforcement, durable shared storage, and a notification delivery service.

## Day organiser

Plans now have Overview, Itinerary, Bookings & tickets, and Transactions sections. Itinerary items are sorted by local date/time and overlapping durations are flagged. Meal, event, transport and other booking records include status, location, confirmation reference, ticket count, owner and an external link. Add to itinerary reuses an already-linked activity rather than duplicating it. Transactions have date, category, payer, optional booking association and receipt link. Only recorded paid transactions count toward spending, budget and equal-split balances; booking confirmations do not imply payment. All dates/times are entered as local wall-clock values.

Keeps in the Plans category appear in My plans under Saved from chat, and their memory cards have an Open in My plans action. Opening one reuses an accessible linked plan or starts a plan with the memory's title, notes and source link. Shared keeps start with the current chat participants; private keeps are offered only in the original You preview. This remains prototype UI behaviour, not server-enforced authorization.

Existing local plans keep their expenses and participants when upgraded. New records are persisted locally. Booking deletion clears links without deleting the itinerary or paid transactions. HTTP(S) links only; the app does not purchase tickets, reserve tables, import banking activity, store ticket uploads or move money.
