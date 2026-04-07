# 📻 Podator

Outil de vérification quotidienne des flux podcast. Détecte automatiquement:
- Les fichiers MP3 trop petits (< 100KB)
- Les flux RSS invalides
- Les épisodes manquants ou inaccessibles

## Fonctionnalités

✅ **Calendrier minimaliste** - Vue par mois avec alertes visuelles
✅ **Vérification quotidienne** - Lance une vérification pour tous les flux
✅ **Historique** - Conserve les résultats des 30+ derniers jours
✅ **Détails au clic** - Voir exactement quels podcasts ont des problèmes
✅ **Détection rapide** - Identifie les fichiers de 1ko au lieu de 50MB

## Utilisation

1. Cliquer sur "Vérifier maintenant" pour lancer une vérification
2. Cliquer sur un jour du calendrier pour voir les détails
3. Les erreurs s'affichent avec un badge rouge
4. L'historique se conserve localement (localStorage)

## Architecture

- `index.html` - Interface calendrier
- `style.css` - Design minimaliste
- `app.js` - Logique de vérification et gestion du calendrier
- `podcasts.json` - Liste des 113 flux RSS à vérifier

## Détection d'erreurs

Les fichiers sont considérés comme problématiques si:
- **< 100KB** - Trop petit pour être un MP3 valide
- **Pas d'enclosure** - L'URL du fichier est manquante
- **XML invalide** - Le flux RSS n'est pas valide
- **Timeout (>10s)** - Le serveur ne répond pas

## Données

Les vérifications sont stockées dans le localStorage du navigateur:
```json
{
  "2025-04-07": {
    "ok": 110,
    "errors": [
      { "name": "Flux 15", "error": "Fichier trop petit: 1.2 KB" },
      { "name": "Flux 82", "error": "Timeout" }
    ]
  }
}
```

## Live

https://jamega-76.github.io/podator/
