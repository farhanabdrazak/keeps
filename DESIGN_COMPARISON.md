# Keeps design comparison

The default **Final interface** uses the repository's existing interface and app.js logic. **Earlier concept** is a reconstruction created on 11 October 2026 for an interactive design comparison, not a recovered historical build or evidence of an earlier participant test.

Switch using the toolbar. The same messages, saved items and suggestion state are retained between views. Entering the earlier concept clears the category filter and returns to active items. Resolving an item there preserves it in data; switch to Final and check Resolved to reopen it. Restart demo resets both views together. Refresh retains the selected version through the URL but restarts the underlying demo, as before.

| Deliberate limitation in earlier concept | Existing final behaviour | Demonstration |
| --- | --- | --- |
| No category filters | Named category filters | Compare scanning all saved items with filtering Plans or Money. |
| No source-message link | View original message returns to context | Open the coffee card and compare how to verify the arrangement. |
| Generic OK, Change and × suggestion actions | Confirm, Edit and Dismiss | Compare how clearly the actions communicate their effect. |
| Generic Done and no resolved-items view | Contextual completion label, Resolved view and Reopen | Complete a card in Earlier, then recover it in Final. |

These differences illustrate design tradeoffs related to the supplied report's feedback themes. They are not claims that these exact limitations were observed in a real prior study. The report describes its evaluation sessions as created for the proof-of-concept exercise. Plans versus Dates wording, multi-category items, reminders and suggestion undo are not claimed as final fixes because the baseline repository does not implement them.

Files: `comparison.js` adds the mode behaviour; `comparison.css` styles the toolbar and earlier-only visibility. `index.html` includes the toolbar, explanation dialog and the two assets. `app.js` and `style.css` are unchanged.

Direct links: `?version=earlier` opens the reconstructed concept; the normal URL opens Final. Theme selection remains independent of the version.
