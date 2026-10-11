# Keeps design comparison

The default Final interface preserves app.js and style.css from commit ba0523c775c7c1498709ecdcf068beb057bedc2b. Earlier concept is a reconstruction created on 11 October 2026 to illustrate UX limitations for a simulated evaluation, not a recovered historical build.

## Deliberate differences

- Light mode only in Earlier; Final restores the preferred theme and its toggle.
- Earlier requires group selection and, for manual capture, destination selection on each new save. Continue opens a second confirmation dialog. Even OK on a suggestion opens the editor. Final retains its original defaults, direct suggestion confirmation and single-form save.
- Earlier labels the six categories Numbers, General, Items, Misc, Other and Notes with identical tag styling. Final uses the original descriptive names and colours. The underlying category values stay unchanged so switching does not corrupt saved records.
- Earlier omits source links. Final has View original message.
- Earlier uses Done with no resolved-items view. Final offers contextual completion, Resolved and Reopen.

Five fictional responses and their relationship to these differences are in [SIMULATED_USER_FEEDBACK.md](SIMULATED_USER_FEEDBACK.md). These are examples for a theoretical evaluation, not new findings from recruited users. The supplied report's comparison was ordinary chat versus Keeps; it must not be relabelled as this Earlier-versus-Final study.

Switching preserves session data but returns to All and active items. Restart demo resets both views. Refresh retains the selected version via the URL but restarts the session. Direct link: `?version=earlier`. Theme preference is independent of version and is not overwritten by the light-only reconstruction.

The implementation is isolated in comparison.js and comparison.css plus the comparison toolbar/dialogs in index.html. app.js and style.css remain unchanged. Plans versus Dates overlap, live AI accuracy, real sharing, reminders and automatic stale-record detection are not claimed as fixed.

The app’s **What changed?** dialog also has an expandable section containing the same five hypothetical feedback examples and their linked final-design fixes, so the iteration narrative can be demonstrated within the web app itself. The notes remain clearly identified as illustrative rather than empirical user-test results.
