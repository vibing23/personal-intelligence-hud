
# 📱 Personal Intelligence HUD

A collection of premium, data-driven home screen widgets for iOS, built with JavaScript (Scriptable).

These widgets are designed to visualize **time scarcity**, **productivity density**, and **device telemetry** in real-time. No external API keys required. Zero configuration.

##  The Collection

### 1. Orbital HUD (`orbital-hud.js`)
A heads-up display inspired by the Apple Watch Ultra.
* **Visualizes:** Year, Month, and Day progress as concentric rings.
* **Features:** Adaptive Theme (Light/Dark mode), 4K Retina rendering, dynamic battery monitor.
* **Use Case:** Keeping track of macro and micro time goals at a glance.

### 2.  Executive Agenda (`executive-agenda.js`)
A "Traffic Control" command deck for high-performance schedules.
* **Visualizes:** Current status (Busy/Available) and the exact time gap until your next engagement.
* **Features:** Smart "Traffic Light" logic (Red = Meeting in progress, Green = Free), calculated "Time to Next Event," and a high-contrast agenda list.
* **Use Case:** Instantly answering "Where do I need to be *right now*?" without opening a calendar app.

### 3. Day Burndown (`day-burndown.js`)
A velocity tracker that treats your workday like a project deadline.
* **Visualizes:** Percentage of the day elapsed vs. percentage of scheduled events completed.
* **Features:** Dual progress bars ("Day Complete" vs "Schedule Cleared") and a massive "Hours Remaining" countdown.
* **Configuration:** The default work window is customizable. Open the script and edit `START_HOUR` and `END_HOUR` at the top of the file to match your shift (e.g., 9 to 5).
* **Use Case:** Gamifying the daily grind and creating healthy urgency to clear tasks before the day ends.

### 4. IsoCity Skyline (`iso-city.js`)
An isometric projection engine that renders your daily calendar as a 3D city.
* **Visualizes:** Your schedule density. Tall buildings = Busy hours. Flat ground = Free time.
* **Features:** Procedural generation, 3D coordinate mapping.
* **Use Case:** instantly spotting "deep work" blocks vs. "meeting heavy" blocks.

### 5. Energy Optimizer (energy-optimizer.js)
A peak performance tracker that tells you exactly when to do your hardest work.

Visualizes: Your energy levels throughout the day (6AM-10PM) as a live gradient curve with golden peak window highlighting.
Features: Real-time energy score calculation based on circadian rhythms, smart scheduling suggestions, color-coded performance zones (Peak/High/Moderate/Low), pulsing current-time indicator.
Use Case: Stop wasting your best hours on email. Block your peak performance window (typically 10AM-12PM) for deep work and maximize productivity by working with your biology, not against it.

---

##  Installation Guide (30 Seconds)

1.  **Get Scriptable:** Download the free [Scriptable App](https://apps.apple.com/us/app/scriptable/id1405459188) from the App Store.
2.  **Copy Code:** Open the file in the `widgets/` folder above and copy the code.
3.  **Create Script:**
    * Open Scriptable > Tap `+`.
    * Paste the code.
    * Rename the script (e.g., "Orbital HUD").
4.  **Add Widget:**
    * Go to your iPhone Home Screen > Long Press > Tap `+`.
    * Select **Scriptable** > **Medium** Widget.
    * Tap the widget > Choose the script you just created.

## 🛠️ Requirements
* iOS 16 or later
* Scriptable App (Free)
* No external dependencies
