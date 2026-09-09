# Company Football Team Builder

## Goal

Build a lightweight internal web application for creating balanced
5v5 and 7v7 football teams.

## Main navigation

### Formation
Layout:
- Left: football formation
- Right: selected player detail

Functions:
- 5v5 / 7v7
- Team A / Team B
- Unassigned players
- Drag and drop
- Random
- Balanced Random
- Reset
- Save

When there are not enough real players, automatically create:

Ngoại binh 1
Ngoại binh 2
...

Guest players:
- Tier 0
- Default configurable stats
- Not persisted into Players

### Players
Layout:
- Left: player list
- Right: selected player detail

Functions:
- Search
- Tier filter
- Add
- Edit
- Delete
- Avatar upload

## Player

Fields:
- id
- name
- avatar
- tier

Stats:
- stamina
- speed
- strength
- passing
- finishing
- defense

Tier/stat values:

S
A
B
C
D

Tier is independent from player stats.

## Storage

Frontend:
GitHub Pages

Backend:
Google Apps Script

Data:
Google Sheets

Avatar:
Google Drive

## Editing

Everyone can view simultaneously.

Only one user can enter edit mode at a time.

Use:
- editor lease
- heartbeat
- expiration
- Apps Script LockService
- version checking

If editor disappears, edit lock must automatically expire.