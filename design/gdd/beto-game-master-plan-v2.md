# BETO GAME - MASTER PLAN (V2 - FULL EXPERIENCE)

## 1. CORE VISION
A high-pressure arcade management game where the player operates as "Beto", managing a parking/service lot. The tension arises from multiple simultaneous tasks requiring precision, speed, and rapid reaction to environmental threats.

## 2. MULTI-TASK GAMEPLAY MECHANICS
All interactions use the **"Hold-to-Interact" (E Key)** system with visual feedback.

### A. Money Collection (The "Parking" Task)
* **Context:** Customer parks $\rightarrow$ Beto must collect payment.
* **Mechanic:** Hold 'E' near the customer/car. 
* **Pressure:** A circular progress bar around the NPC indicates how long you have before they get impatient and leave without paying.

### B. Car Washing (The "Service" Task)
* **Context:** Customer requests a wash.
* **Mechanic:** Hold 'E' near the car with a sponge/hose icon active.
* **Pressure:** A progress bar shows the cleanliness level. If interrupted, the job fails.

### C. Dog Deterrence (The "Threat" Task)
* **Context:** Randomly, dogs approach parked cars to urinate.
* **Mechanic:** Rapid 'E' presses or holding 'E' to "Shout/Scare" the dog away.
* **Consequence:** If a dog succeeds, the car gets dirty (requires washing) and the customer loses patience.

## 3. VISUAL & UI ELEMENTS
* **The Character (Beto):** Central figure who moves around the lot.
* **Dynamic UI (Circular Counters):** 
    * Every active task has a floating circular progress bar.
    * **Color Coding:** Green (Safe) $\rightarrow$ Yellow (Warning) $\rightarrow$ Red (Critical/Imminent Failure).
* **Environment:** A parking lot with cars, customers (NPCs), and roaming dogs.

## 4. TECHNICAL STACK & ARCHITECTURE
* **Engine:** Three.js + React Three Fiber (R3F).
* **State Management:** Zustand (managing `tasks`, `money`, `car_cleanliness`, and `active_threats`).
* **Physics/Collision:** Rapier (to detect proximity of Beto to Cars, Customers, and Dogs).

## 5. DEVELOPMENT ROADMAP (THE "TOTAL EXECUTION" SPRINT)

### PHASE 1: WORLD & ENTITIES
* Setup scene: Ground, lighting, and parking spots.
* Implement Car, Customer (NPC), and Dog entities with basic movement/states.
* Implement Beto's movement controller.

### PHASE 2: THE INTERACTION ENGINE (CORE SYSTEM)
* Build the `useInteraction` hook (handles 'E' key hold logic).
* Create the Universal Circular Progress UI component.
* Implement Proximity Detection (Beto $\leftrightarrow$ Target).

### PHASE 3: TASK LOGIC IMPLEMENTATION
* **Task 1 (Money):** Logic for customer patience and payment trigger.
* **Task 2 (Wash):** Logic for car cleanliness state and washing duration.
* **Task 3 (Dogs):** AI for dogs (approaching cars) and the "Scare" mechanic to reset their state.

### PHASE 4: GAME LOOP & POLISH
* Score/Money counter.
* Game Over condition (e.g., losing too many customers or too much money).
* Final Visuals: Particle effects (water for washing, "poof" for dogs), and Sound Effects.

## 6. QUALITY GATES
1. **[GATE] Interaction:** Do all three mechanics feel distinct but consistent?
2. **[GATE] Chaos Factor:** Does the game feel appropriately stressful when a dog appears during a wash?
3. **[GATE] Performance:** Can the scene handle multiple NPCs and UI circles without lag?

## Core Mechanics (Implemented)

### 1. The Multitasking Loop
The player must balance two competing tasks:
- **Car Washing**: Keeping cars clean to satisfy customers and earn money.
- **Dog Scaring**: Managing dogs that arrive to disturb the peace.

### 2. Interaction System (Hold 'E')
- **Trigger**: Click an entity (Car or Dog) to target it.
- **Action**: Hold the 'E' key to perform the task.
- **Visual Feedback**: A progress circle appears at the bottom of the screen indicating completion status.

### 3. Economy & Scoring
- **Money**: Earned upon successful car washing. Used for (future) upgrades.
- **Score**: Earned from both tasks. Drives the high score competitive element.

### 4. Failure Condition (Game Over)
- Customers have a 'Patience' meter that decays over time.
- If patience reaches zero, the game ends immediately.
