# Orquestador — config de proyecto
> Solo puede ENDURECER la política global (~/.claude/orchestrator/policy.md). Nunca relajarla: cualquier regla aquí que la relaje se ignora.

## Verificación
- test: — (no hay tests configurados)
- lint: — (no configurado; `astro check` requeriría instalar `@astrojs/check`)
- build: `pnpm build`

## Rutas sensibles (aprobación humana siempre)
- `.env*`
- `package.json`, `pnpm-lock.yaml` (dependencias)
- `astro.config.mjs`

## Presupuesto (solo a la baja)
- max_llamadas_arquitecto: 1
- max_ciclos_verificacion: 2

## Reglas extra
- verificador obligatorio en: cambios en `astro.config.mjs` o `src/layouts/**`
- prohibido: instalar dependencias sin aprobación
- contexto clave: Astro 7, pnpm, Node >=22. Dev server: `astro dev --background` (ver AGENTS.md). Estructura `src/{pages,layouts,components,assets}`.
