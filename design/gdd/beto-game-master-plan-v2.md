# BETO GAME - MASTER PLAN V2 (Multitasking Simulator)

## 1. VISIÓN GENERAL
Un simulador de multitarea caótico donde el jugador gestiona múltiples responsabilidades simultáneamente en un entorno 3D dinámico. El objetivo es maximizar ganancias y puntuación sin colapsar bajo la presión de las tareas que aparecen y desaparecen.

## 2. MECÁNICAS CORE

### A. Movimiento del Jugador (Exploración)
- El jugador se mueve por una zona urbana/residencial utilizando controles de teclado (WASD / Flechas).
- Cámara en tercera persona siguiendo al avatar.
- Interacción mediante el sistema "Hold-to-Interact" (Mantener tecla 'E').

### B. Sistema de Tareas Dinámicas (Entidades)
Las tareas aparecen en el mundo y requieren presencia física del jugador.

1. **Lavado de Autos (Car Washing):**
   - Los autos entran en la escena desde la calle, se estacionan en zonas designadas y esperan ser lavados.
   - El jugador debe acercarse y mantener 'E' para limpiar el auto.
   - Una vez limpio, el auto sale de la zona y genera ingresos.

2. **Espantar Perros (Dog Scaring):**
   - Los perros aparecen aleatoriamente en áreas prohibidas o cerca de los autos/zonas de trabajo.
   - El jugador debe acercarse y usar una acción para espantarlos antes de que causen caos.

3. **Gestión de Tráfico:**
   - Autos circulan por la calle (fuera de las zonas de lavado).
   - Los autos deben estacionar correctamente para activar la tarea de lavado.

### C. Ciclo de Juego (Game Loop)
- **Ingresos:** Cada tarea completada suma dinero al `useGameStore`.
- **Puntuación:** Completar tareas rápidamente aumenta el multiplicador de score.
- **Condición de Derrota:** El caos acumulado o el tiempo agotado disparan el `isGameOver`.

## 3. ARQUITECTURA TÉCNICA (Stack)
- **Engine:** React Three Fiber (R3F) + Three.js.
- **Estado:** Zustand (Gestión centralizada de dinero, score, y posiciones de entidades).
- **Física/Movimiento:** Hooks personalizados para control de cámara y movimiento WASD.
- **Despliegue:** Vite + Vercel.

## 4. ROADMAP DE DESARROLLO
- [x] Setup del entorno (Vite + React + TS + R3F).
- [x] Reconstrucción de base limpia.
- [ ] Implementación de Movimiento WASD y Cámara.
- [ ] Sistema de Spawning Dinámico (Autos estacionando/yendo).
- [ ] Lógica de Interacción 'Hold-to-Interact'.
- [ ] Integración de mecánicas específicas (Lavado / Perros).
- [ ] UI de HUD y Game Over.
