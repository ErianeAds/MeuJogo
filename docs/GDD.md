# Projeto Battle-Path (Documentação Técnica)

## 1. Core Loop e Visão Geral
- **Gênero:** Estratégia/Auto-shooter 2D Top-Down.
- **Plataforma:** Web (GitHub Pages).
- **Input:** Clique/Touch para mover o grupo de tropas (Squad).
- **Objetivo:** Levar as tropas do ponto A ao B, desviando de obstáculos e eliminando inimigos automaticamente.

## 2. Regras de Movimentação (Anti-Ambiguidade)
- **O Grupo (Squad):** As tropas se movem como uma unidade em formação.
- **Pathfinding:** Algoritmo A* ou Steering Behaviors simples para contorno de obstáculos.
- **Obstáculos:** Paredes e pedras são sólidos. Tropas devem "contornar" em vez de parar.
- **Velocidade:** Constante. Sem aceleração ou inércia.

## 3. Sistema de Combate

| Entidade | Comportamento de Ataque | Prioridade de Alvo |
| :--- | :--- | :--- |
| **Tropas do Jogador** | Atiram automaticamente | 1. Monstros, 2. Torres, 3. Construções. |
| **Inimigos/Monstros** | Avançam/atiram na tropa mais próxima | Tropa com menor HP (ou mais próxima). |

## 4. Arquitetura de Arquivos
- `/index.html`: Renderiza o canvas do jogo.
- `/src/main.js`: Setup do jogo e loop principal.
- `/src/entities.js`: Classes para Player (Squad), Enemy e Projectile.
- `/src/map.js`: Lógica de geração de obstáculos e grid.

## 5. Especificações de Performance
- **Engine:** Vanilla Javascript + HTML5 Canvas API.
- **Estética:** Visual premium neon/cyberpunk, micro-animações nas tropas e projéteis.
