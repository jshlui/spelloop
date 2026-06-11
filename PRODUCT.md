## Design Context

### Users
**Primary**: Children aged 6–8, playing spelling games on tablets and desktop browsers during the day (light mode). They need large tap targets, clear feedback, and satisfying rewards — not "educational" boredom.

**Secondary**: Parents, accessing a PIN-gated dashboard to monitor progress, manage profiles, and adjust settings. They want professional, calm data at a glance — not the kid UI's energy.

### Brand Personality
**Bold, toylike, a bit cheeky.** Like a children's sticker book crossed with a toy store shelf crossed with a coding game that thinks it's a cartoon. Not babyish. Not corporate. Not "educational software." The app should feel like it has personality — slightly smug when you get it right, slightly teasing when you don't.

Reference: codemonkey.com — gamification energy, bright color, personality in every interaction.
Anti-reference: Generic school software (flat, muted, earnest, no delight).

### Aesthetic Direction
- **Light mode** — daylight use, kids' context, pastel backgrounds.
- **Typography**: Grandstander (chunky display font, Google Fonts, weights 700/900) for word displays, chapter titles, and game mode names. Nunito (400–900) for all UI text, labels, and copy.
- **Colors**: 6-color pastel system (blue, yellow, pink, mint, coral, lilac) used **boldly**, not timidly. Less neutral filler. Accent colors should feel celebratory, not decorative.
- **Shadows**: 3D, physical — toys have depth. `--shadow-toy` for interactive surfaces. Buttons press down.
- **Motion**: Spring-like but not bouncy. Ease-out-expo for entrances. Satisfying scale-up on correct answers.
- **Parent dashboard**: Completely different vibe — professional, calm, minimal color, more whitespace, refined type hierarchy.

### Design Principles
1. **Personality before prettiness.** Every interaction should feel like the app has a character — cheeky success sounds, dramatic wrong-answer shakes, tiles that bounce into place.
2. **Depth over flatness.** Buttons press down. Tiles lift on hover. The UI should feel like physical objects, not a flat screen.
3. **Every state matters.** Hover, focus, active, disabled, empty — all must be designed. Dead surfaces break the toy feeling.
4. **Bold use of color.** The pastel palette is the brand. Use it for large surfaces, not just accents.
5. **Parent area earns trust.** Calm, readable, professional. Real data without the playful energy — parents are evaluating progress, not playing a game.
