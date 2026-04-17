# La Vida de Beto - El Juego

## Descripción

Juego web estilo "Restaurant Tycoon" donde controlás a **Beto** (un chico de 15 años con camiseta de Boca) que organiza el estacionamiento en distintos niveles.

## Mecánicas

### Objetivo
- Guíale a los autos donde estacionar
- Cobráles cuando se bajen (antes de que se vayan)
- Espanta a los perros antes de que meanen los autos

### Controles
- **WASD** o **Flechas**: Moverse por la zona de estacionamiento
- **Click**: Marcar lugares para estacionar

### Reglas
1. Los autos llegan y esperan a que Beto los guíe
2. Si no los guías a tiempo, se van (perdés plata)
3. Cuando el auto se estaciona, la gente baja y te pide cobro
4. Los perros aparecen aleatoriamente y pueden "meanar" los autos
5. Perdés si te quedás sin plata o si se llena la plaza

## Niveles

| Nivel | Nombre | Descripción |
|-------|--------|-------------|
| 1 | La Calle | Pocos autos, pocos perros (fácil) |
| 2 | La Plaza | Más autos, más perros (medio) |
| 3 | 4 Manzanas | Mucho tráfico, muchos perros (difícil) |

## Cómo jugar

1. Abrí `index.html` en un navegador moderno
2. Seleccioná el nivel
3. ¡Jugá!

## Archivos

```
beto-game/
├── index.html        # Página principal
├── index.js          # Código del juego (todo en uno)
├── style.css         # Estilos
└── README.md         # Este archivo
```

## Requisitos

- Navegador moderno con soporte para HTML5 Canvas y WebGL
- No requiere instalación de nada, funciona directamente en el navegador

---

*Juego creado con Three.js*
