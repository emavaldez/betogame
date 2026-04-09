# BETO GAME - MASTER PLAN

## 1. CORE VISION
A fast-paced, high-pressure arcade experience where the player must collect money with precision and speed. The tension comes from a "hold-to-interact" mechanic combined with a visible countdown timer.

## 2. GAMEPLAY MECHANICS (The "E" Mechanic)
*   **Interaction:** Instead of a simple tap, the player must **HOLD the 'E' key**.
*   **Pressure System:** A progress bar/circle will fill up while the key is held.
*   **Failure State:** If the player releases too early or if the timer runs out, the collection fails.
*   **Reward:** Successful collection grants money and potentially a time bonus for the next action.

## 3. VISUAL & UI ELEMENTS (The "Counter" Persona)
*   **The NPC/Character:** A character will be positioned next to the car/money pile.
*   **Visual Feedback (The Timer):** 
    *   A circular progress bar surrounding the character or floating above the money.
    *   As time runs out, the circle depletes (or fills up) and changes color (Green -> Yellow -> Red).
    *   Optional: The character shows an animation of increasing anxiety/urgency as the timer nears zero.

## 4. TECHNICAL STACK & ARCHITECTURE
*   **Engine:** Three.js + React Three Fiber (R3F).
*   **State Management:** Zustand (for high-performance game state like timers and money).
*   **Physics:** Rapier (to handle the car/money collisions and proximity detection).
*   **Assets:** 
    *   Low-poly car model.
    *   Money stack/pile assets.
    *   Character model with simple "idle" and "anxious" animations.

## 5. DEVELOPMENT ROADMAP (The "Total Execution" Sprint)

### PHASE 1: FOUNDATION & PROXIMITY
*   Setup Three.js scene with basic lighting and ground.
*   Implement Car movement (WASD/Arrows).
*   Implement Proximity Detection: The 'E' mechanic only activates when the car is near the money.

### PHASE 2: THE CORE LOOP (THE "E" MECHANIC)
*   Implement `useHoldKey` hook for the 'E' key.
*   Create the Circular Progress Bar UI component.
*   Integrate Zustand to manage the `isCollecting`, `collectionProgress`, and `timeLeft` states.

### PHASE 3: VISUAL POLISH & CHARACTER
*   Add the Character NPC with the visual timer.
*   Implement color-shifting logic for the timer (Green to Red).
*   Add basic animations/feedback when money is collected successfully.

### PHASE 4: GAME LOOP & UI
*   Score counter.
*   Game Over / Restart screens.
*   Final polish: Sound effects (SFX) and particle effects on collection.

## 6. QUALITY GATES (Gate Checks)
1.  **[GATE] Mechanic Check:** Does the 'E' hold feel responsive? Is the timer intuitive?
2.  **[GATE] Visual Check:** Is the circular bar clearly visible against the background?
3.  **[GATE] Performance Check:** Is the FPS stable during the collection animation?
