importScripts("./glossary/generated/cache-revision.js");
const CACHE_PREFIX = "warhammer-rules-fe1d435-";
const CACHE_NAME = `${CACHE_PREFIX}${self.WH40K_CACHE_REVISION || "fallback"}${self.WH40K_CACHE_BYTES?"-"+self.WH40K_CACHE_BYTES:""}`;
const APP_SHELL_BATCH_SIZE = 4;
const LIBRARY_FALLBACK = "./index.html";
const ROSTER_GUIDES_FALLBACK = "./roster-guides/index.html";
const DEATH_GUARD_FALLBACK = "./books/death-guard/index.html";
const CORE_RULES_FALLBACK = "./books/core-rules/reader/index.html";
const ADEPTUS_MECHANICUS_FALLBACK = "./books/adeptus-mechanicus/index.html";
const TYRANIDS_ENTRY_FALLBACK = "./books/tyranids/index.html";
const TYRANIDS_DESKTOP_FALLBACK = "./books/tyranids/reader.html";
const TYRANIDS_MOBILE_FALLBACK = "./books/tyranids/mobile/index.html";
const TAU_EMPIRE_ENTRY_FALLBACK = "./books/tau-empire/index.html";
const TAU_EMPIRE_DESKTOP_FALLBACK = "./books/tau-empire/reader.html";
const TAU_EMPIRE_MOBILE_FALLBACK = "./books/tau-empire/mobile/index.html";
const CHAOS_SPACE_MARINES_ENTRY_FALLBACK = "./books/chaos-space-marines/index.html";
const CHAOS_SPACE_MARINES_DESKTOP_FALLBACK = "./books/chaos-space-marines/reader.html";
const CHAOS_SPACE_MARINES_MOBILE_FALLBACK = "./books/chaos-space-marines/mobile/index.html";
const BLOOD_ANGELS_ENTRY_FALLBACK = "./books/blood-angels/index.html";
const BLOOD_ANGELS_DESKTOP_FALLBACK = "./books/blood-angels/reader.html";
const BLOOD_ANGELS_MOBILE_FALLBACK = "./books/blood-angels/mobile/index.html";
const ORKS_FALLBACK = LIBRARY_FALLBACK;
const EMPERORS_CHILDREN_FALLBACK = "./books/emperors-children/index.html";
const SPACE_MARINES_ENTRY_FALLBACK = "./books/space-marines/";
const SPACE_MARINES_DESKTOP_FALLBACK = "./books/space-marines/reader.html";
const DARK_ANGELS_ENTRY_FALLBACK = "./books/dark-angels/index.html";
const DARK_ANGELS_DESKTOP_FALLBACK = "./books/dark-angels/reader.html";
const DARK_ANGELS_MOBILE_FALLBACK = "./books/dark-angels/mobile/index.html";
const APP_SHELL = [
  "./",
  LIBRARY_FALLBACK,
  "./roster-guides/",
  ROSTER_GUIDES_FALLBACK,
  "./roster-guides/points-data.js?v=10",
  "./roster-guides/points-validator.js?v=7",
  "./roster-guides/app.js?v=23",
  "./manifest.webmanifest",
  "./assets/apple-touch-icon.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/icon-maskable-512.png",
  "./assets/warhammer-40000-logo-optimized.png",
  "./assets/games-workshop-logo.png",
  "./assets/core-rules-cover-480.webp",
  "./assets/core-rules-cover-800.webp",
  "./assets/core-rules-cover-fallback.jpg",
  "./assets/core-rules-cover-thumb.jpg",
  "./assets/death-guard-cover-480.webp",
  "./assets/death-guard-cover-800.webp",
  "./assets/death-guard-cover-fallback.jpg",
  "./assets/death-guard-cover-thumb.jpg",
  "./assets/death-guard-cover.jpg",
  "./assets/adeptus-mechanicus-cover-480.webp",
  "./assets/adeptus-mechanicus-cover-800.webp",
  "./assets/adeptus-mechanicus-cover-fallback.jpg",
  "./assets/adeptus-mechanicus-cover-thumb.jpg",
  "./assets/tyranids-cover-480.webp",
  "./assets/tyranids-cover-800.webp",
  "./assets/tyranids-cover-fallback.jpg",
  "./assets/tyranids-cover-thumb.jpg",
  "./glossary/generated/cache-revision.js",
  "./glossary-return.js?v=5",
  "./glossary/",
  "./glossary/index.html",
  "./glossary/viewer.css?v=2",
  "./glossary/viewer-profiles.css?v=2",
  "./glossary/viewer-progressive.css?v=3",
  "./glossary/viewer-popup.css?v=1",
  "./glossary/v2/generated/index.en.js?v=1",
  "./glossary/v2/runtime/glossary-v2-runtime.js?v=1",
  "./glossary/viewer.js?v=15",
  "./books/death-guard/",
  DEATH_GUARD_FALLBACK,
  "./books/death-guard/reader.html",
  "./books/shared/styles/entry.css?v=2",
  "./books/shared/controllers/view-router.js?v=4",

  "./books/death-guard/mobile/related-rules.inc?v=4",
  "./books/shared/mobile-route-redirect.js?v=2",
  "./books/shared/navigation-targets.js?v=4",
  "./books/shared/popup-rule-actions.js?v=1",
  "./books/shared/datasheet-layout.js?v=10",
  "./books/shared/target-mount.js?v=3",
  "./books/shared/datasheet-system.css?v=8",
  "./books/shared/unit-art.css?v=1",
  "./books/shared/popup-content.js?v=3",
  "./books/shared/glossary-autolink.js?v=9",
  "./books/shared/rule-facts.js?v=5",
  "./books/core-rules/assets/diagrams/BattleShockExamples1.webp",
  "./books/core-rules/assets/diagrams/BattleShockExamples2.webp",
  "./books/core-rules/assets/diagrams/BattleShockExamples3.webp",
  "./books/core-rules/assets/diagrams/BattleShockExamples4.webp",
  "./books/core-rules/assets/diagrams/BenefitOfCover.webp",
  "./books/core-rules/assets/diagrams/ControllingATerrainObjective.webp",
  "./books/core-rules/assets/diagrams/DatasheetExample.webp",
  "./books/core-rules/assets/diagrams/EngagedMonstersVehiclesShooting.webp",
  "./books/core-rules/assets/diagrams/ex10.webp",
  "./books/core-rules/assets/diagrams/ex11.webp",
  "./books/core-rules/assets/diagrams/ex12.webp",
  "./books/core-rules/assets/diagrams/ex2.webp",
  "./books/core-rules/assets/diagrams/ex4.webp",
  "./books/core-rules/assets/diagrams/ex5.webp",
  "./books/core-rules/assets/diagrams/ex6.webp",
  "./books/core-rules/assets/diagrams/ex7.webp",
  "./books/core-rules/assets/diagrams/ex8.webp",
  "./books/core-rules/assets/diagrams/ex9.webp",
  "./books/core-rules/assets/diagrams/ExampleAction.webp",
  "./books/core-rules/assets/diagrams/HiddenAndObscuring.webp",
  "./books/core-rules/assets/diagrams/MakingAChargeMove.webp",
  "./books/core-rules/assets/diagrams/MakingASurgeMove.webp",
  "./books/core-rules/assets/diagrams/ModelFullyVisible.webp",
  "./books/core-rules/assets/diagrams/ModelVisible.webp",
  "./books/core-rules/assets/diagrams/NormalFight.webp",
  "./books/core-rules/assets/diagrams/ObjectiveConsolidation.webp",
  "./books/core-rules/assets/diagrams/OngoingConsolidation.webp",
  "./books/core-rules/assets/diagrams/OverrunFight.webp",
  "./books/core-rules/assets/diagrams/PileInMoves.webp",
  "./books/core-rules/assets/diagrams/PlungingFire.webp",
  "./books/core-rules/assets/diagrams/Solid.webp",
  "./books/core-rules/assets/diagrams/StartOfFightPhase.webp",
  "./books/core-rules/assets/diagrams/TakingToTheSkies.webp",
  "./books/core-rules/assets/diagrams/TerrainAndMovement.webp",
  "./books/core-rules/assets/diagrams/TerrainAndMovement2.webp",
  "./books/core-rules/assets/diagrams/TerrainPlacedOnAMat.webp",
  "./books/core-rules/assets/diagrams/TerrainPlacedOnTheBattlefield.webp",
  "./books/core-rules/assets/diagrams/UnitFullyVisible.webp",
  "./books/core-rules/assets/diagrams/UnitVisible.webp",
  "./books/shared/related-rules-matcher.js?v=6",
  "./books/shared/compatible-rules-matrix.mjs?v=2",
  "./books/shared/stratagem-presentation.mjs?v=1",
  "./books/shared/roster-entities.js?v=1",
  "./books/shared/roster-parser.js?v=4",
  "./books/shared/roster-enhancements.js?v=4",
  "./books/death-guard/assets/icon-v4.svg",
  "./books/shared/styles/tokens.css?v=11",
  "./books/shared/styles/layout.css?v=17",
  "./books/shared/styles/navigation.css?v=15",
  "./books/shared/styles/content.css?v=49",
  "./books/shared/styles/popups.css?v=19",
"./books/shared/controllers/navigation-controller.js?v=30",
  "./books/death-guard/scripts/roster-semantics.js?v=16",
  "./books/death-guard/scripts/roster-data.js?v=14",
  "./books/death-guard/scripts/target-data.js?v=4",
  "./books/death-guard/scripts/roster-filter.js?v=31",
  "./books/shared/controllers/popup-controller.js?v=25",
  "./books/shared/controllers/full-entry-controller.js?v=9",
  "./books/shared/controllers/journey-controller.js?v=16",
  "./books/shared/controllers/ui-controllers.js?v=13",
  "./books/death-guard/scripts/app.js?v=48",
  "./books/death-guard/generated/compatible-rules.json",
  "./books/core-rules/",
  "./books/core-rules/index.html",
  CORE_RULES_FALLBACK,
  "./books/core-rules/reader/styles.css?v=15",
  "./books/core-rules/reader/app.js?v=18",
  "./books/core-rules/reader/search-index.json",
  "./books/core-rules/reader/introduction.html",
  "./books/core-rules/reader/core-concepts.html",
  "./books/core-rules/reader/datasheets.html",
  "./books/core-rules/reader/moving.html",
  "./books/core-rules/reader/making-attacks.html",
  "./books/core-rules/reader/attack-sequence.html",
  "./books/core-rules/reader/other-concepts.html",
  "./books/core-rules/reader/battle-round-overview.html",
  "./books/core-rules/reader/command-phase.html",
  "./books/core-rules/reader/movement-phase.html",
  "./books/core-rules/reader/shooting-phase.html",
  "./books/core-rules/reader/charge-phase.html",
  "./books/core-rules/reader/fight-phase.html",
  "./books/core-rules/reader/terrain.html",
  "./books/core-rules/reader/objectives.html",
  "./books/core-rules/reader/stratagems.html",
  "./books/core-rules/reader/actions.html",
  "./books/core-rules/reader/monsters-vehicles.html",
  "./books/core-rules/reader/transports.html",
  "./books/core-rules/reader/attached-units.html",
  "./books/core-rules/reader/strategic-reserves.html",
  "./books/core-rules/reader/flying-surging.html",
  "./books/core-rules/reader/other-rules-abilities.html",
  "./books/core-rules/reader/aircraft.html",
  "./books/core-rules/reader/core-abilities.html",
  "./books/core-rules/reader/muster-armies.html",
  "./books/adeptus-mechanicus/",
  ADEPTUS_MECHANICUS_FALLBACK,
  "./books/adeptus-mechanicus/reader.html",
  "./books/adeptus-mechanicus/assets/mechanicus-logo.png",
  "./books/adeptus-mechanicus/assets/mechanicus-cover-800.webp",
  "./books/death-guard/assets/unit-images/beasts-of-nurgle.png",
  "./books/death-guard/assets/unit-images/chaos-land-raider.png",
  "./books/death-guard/assets/unit-images/chaos-predator-annihilator.png",
  "./books/death-guard/assets/unit-images/chaos-rhino.png",
  "./books/death-guard/assets/unit-images/chaos-spawn.png",
  "./books/death-guard/assets/unit-images/defiler.png",
  "./books/death-guard/assets/unit-images/great-unclean-one.png",
  "./books/death-guard/assets/unit-images/helbrute.png",
  "./books/death-guard/assets/unit-images/nurglings.png",
  "./books/death-guard/assets/unit-images/plague-drones.png",
  "./books/death-guard/assets/unit-images/plaguebearers.png",
  "./books/death-guard/assets/unit-images/rotigus.png",
  "./books/death-guard/assets/unit-images/biologus-putrifier.png",
  "./books/death-guard/assets/unit-images/blightlord-terminators.png",
  "./books/death-guard/assets/unit-images/deathshroud-terminators.png",
  "./books/death-guard/assets/unit-images/foetid-bloat-drone.png",
  "./books/death-guard/assets/unit-images/foul-blightspawn.png",
  "./books/death-guard/assets/unit-images/lord-of-virulence.png",
  "./books/death-guard/assets/unit-images/malignant-plaguecaster.png",
  "./books/death-guard/assets/unit-images/miasmic-malignifier.png",
  "./books/death-guard/assets/unit-images/plague-surgeon.png",
  "./books/death-guard/assets/unit-images/noxious-blightbringer.png",
  "./books/death-guard/assets/unit-images/icon-bearer.png",
  "./books/death-guard/assets/unit-images/lord-of-contagion.png",
  "./books/death-guard/assets/unit-images/lord-of-poxes.png",
  "./books/death-guard/assets/unit-images/mortarion.png",
  "./books/death-guard/assets/unit-images/myphitic-blight-hauler.png",
  "./books/death-guard/assets/unit-images/plague-marines.png",
  "./books/death-guard/assets/unit-images/plagueburst-crawler.png",
  "./books/death-guard/assets/unit-images/poxwalkers.png",
  "./books/death-guard/assets/unit-images/tallyman.png",
  "./books/death-guard/assets/unit-images/typhus.png",
  "./books/adeptus-mechanicus/assets/unit-images/thulia-ghuld.webp",
  "./books/adeptus-mechanicus/assets/unit-images/skitarii-rangers.webp",
  "./books/adeptus-mechanicus/assets/unit-images/onager-dunecrawler.webp",
  "./books/adeptus-mechanicus/assets/unit-images/belisarius-cawl-background.webp",
  "./books/adeptus-mechanicus/assets/unit-images/archaeopter-fusilave.webp",
  "./books/adeptus-mechanicus/assets/unit-images/archaeopter-stratoraptor.webp",
  "./books/adeptus-mechanicus/assets/unit-images/archaeopter-transvector.webp",
  "./books/adeptus-mechanicus/assets/unit-images/skitarii-marshal.webp",
  "./books/adeptus-mechanicus/assets/unit-images/skorpius-dunerider.webp",
  "./books/adeptus-mechanicus/assets/unit-images/sydonian-skatros.webp",
  "./books/adeptus-mechanicus/assets/unit-images/tech-priest-manipulus.webp",
  "./books/adeptus-mechanicus/assets/unit-images/technoarcheologist.webp",
  "./books/adeptus-mechanicus/assets/unit-images/serberys-raiders.webp",
  "./books/adeptus-mechanicus/assets/unit-images/serberys-sulphurhounds.webp",
  "./books/adeptus-mechanicus/assets/unit-images/skorpius-disintegrator.webp",
  "./books/adeptus-mechanicus/assets/unit-images/pteraxii-skystalkers.webp",
  "./books/adeptus-mechanicus/assets/unit-images/pteraxii-sterylizors.webp",
  "./books/adeptus-mechanicus/assets/unit-images/servitor-battleclade.webp",
  "./books/adeptus-mechanicus/assets/unit-images/skitarii-vanguard.webp",
  "./books/adeptus-mechanicus/assets/unit-images/sicarian-infiltrators.webp",
  "./books/adeptus-mechanicus/assets/unit-images/sicarian-ruststalkers.webp",
  "./books/adeptus-mechanicus/assets/unit-images/hastarii-fusiliers.webp",
  "./books/adeptus-mechanicus/assets/unit-images/ironstrider-ballistarii.webp",
  "./books/adeptus-mechanicus/assets/unit-images/sydonian-dragoons-with-taser-lances.webp",
  "./books/adeptus-mechanicus/assets/unit-images/tech-priest-dominus.webp",
  "./books/adeptus-mechanicus/assets/unit-images/tech-priest-enginseer.webp",
  "./books/adeptus-mechanicus/assets/unit-images/corpuscarii-electro-priests.webp",
  "./books/adeptus-mechanicus/assets/unit-images/hastarii-exterminators.webp",
  "./books/adeptus-mechanicus/assets/unit-images/kastelan-robots.webp",
  './books/adeptus-mechanicus/assets/unit-images/kataphron-destroyers.webp',
  './books/adeptus-mechanicus/assets/unit-images/kataphron-breachers.webp',
  './books/adeptus-mechanicus/assets/unit-images/fulgurite-electro-priests.webp',
  './books/adeptus-mechanicus/assets/unit-images/cybernetica-datasmith.webp',
  "./books/adeptus-mechanicus/assets/unit-images/sydonian-dragoons-with-radium-jezzails.webp",
  "./books/adeptus-mechanicus/styles/tokens.css?v=15",
  "./books/adeptus-mechanicus/styles/mechanicus.css?v=23",
  "./books/adeptus-mechanicus/scripts/data.js?v=1",
  "./books/adeptus-mechanicus/scripts/faction-ui.js?v=2",
  "./books/adeptus-mechanicus/mobile/related-rules.inc?v=4",
  "./books/adeptus-mechanicus/scripts/roster-enhancements.js?v=10",
  "./books/adeptus-mechanicus/scripts/roster-data.js?v=14",
  "./books/adeptus-mechanicus/scripts/target-data.js?v=4",
  "./books/adeptus-mechanicus/scripts/roster-filter.js?v=12",
  "./books/adeptus-mechanicus/generated/compatible-rules.json",
  "./books/adeptus-mechanicus/scripts/app.js?v=42"
  ,"./books/tyranids/"
  ,TYRANIDS_ENTRY_FALLBACK
  ,TYRANIDS_DESKTOP_FALLBACK
  ,"./books/tyranids/styles/tokens.css?v=3"
  ,"./books/tyranids/styles/book.css?v=4"
  ,"./books/tyranids/scripts/data.js?v=2"
  ,"./books/tyranids/scripts/roster-data.js?v=14"
  ,"./books/tyranids/scripts/target-data.js?v=4"
  ,"./books/tyranids/scripts/roster-filter.js?v=7"
  ,"./books/tyranids/scripts/stratagem-types.mjs?v=1"
  ,"./books/tyranids/generated/compatible-rules.json"
  ,"./books/tyranids/scripts/app.js?v=11"
  ,"./books/tyranids/mobile/related-rules.inc?v=4"
  ,"./books/tau-empire/"
  ,TAU_EMPIRE_ENTRY_FALLBACK
  ,TAU_EMPIRE_DESKTOP_FALLBACK
  ,"./books/tau-empire/styles/tokens.css?v=3"
  ,"./books/tau-empire/styles/book.css?v=5"
  ,"./books/tau-empire/assets/tau-empire-cover-800.webp"
  ,"./books/tau-empire/scripts/data.js?v=2"
  ,"./books/tau-empire/scripts/app.js?v=13"
  ,"./books/tau-empire/scripts/stratagem-types.mjs?v=1"
  ,"./books/tau-empire/scripts/roster-filter.js?v=8"
  ,"./books/tau-empire/generated/compatible-rules.json"
  ,"./books/tau-empire/scripts/roster-data.js?v=14"
  ,"./books/tau-empire/scripts/target-data.js?v=4"
  ,"./books/tau-empire/mobile/related-rules.inc?v=2"
  ,"./books/shared/book-roster-enhancements.js?v=3"
  ,"./books/extensions/book-roster-enhancement-providers.js?v=7"
  ,"./books/shared/effect-contract-runtime.js?v=1"
  ,"./books/chaos-space-marines/"
  ,CHAOS_SPACE_MARINES_ENTRY_FALLBACK
  ,CHAOS_SPACE_MARINES_DESKTOP_FALLBACK
  ,"./books/chaos-space-marines/styles/tokens.css?v=2"
  ,"./books/chaos-space-marines/styles/book.css?v=4"
  ,"./books/chaos-space-marines/assets/chaos-space-marines-cover-480.webp"
  ,"./books/chaos-space-marines/assets/chaos-space-marines-cover-800.webp"
  ,"./books/chaos-space-marines/scripts/data.js?v=2"
  ,"./books/chaos-space-marines/scripts/app.js?v=6"
  ,"./books/chaos-space-marines/scripts/roster-filter.js?v=6"
  ,"./books/chaos-space-marines/generated/compatible-rules.json"
  ,"./books/chaos-space-marines/scripts/roster-data.js?v=14"
  ,"./books/chaos-space-marines/scripts/target-data.js?v=4"
  ,"./books/chaos-space-marines/mobile/related-rules.inc?v=2"
  ,"./books/blood-angels/"
  ,BLOOD_ANGELS_ENTRY_FALLBACK
  ,BLOOD_ANGELS_DESKTOP_FALLBACK
  ,"./books/blood-angels/styles/tokens.css?v=2"
  ,"./books/blood-angels/styles/book.css?v=3"
  ,"./books/blood-angels/assets/blood-angels-cover-480.webp"
  ,"./books/blood-angels/assets/blood-angels-cover-800.webp"
  ,"./books/blood-angels/scripts/data.js?v=2"
  ,"./books/blood-angels/scripts/app.js?v=5"
  ,"./books/blood-angels/scripts/roster-filter.js?v=3"
  ,"./books/blood-angels/generated/compatible-rules.json"
  ,"./books/blood-angels/scripts/roster-data.js?v=14"
  ,"./books/blood-angels/scripts/target-data.js?v=4"
  ,"./books/blood-angels/mobile/related-rules.inc?v=2"
  ,"./books/orks/"
  ,"./books/orks/mobile/index.html"
  ,"./books/orks/styles/tokens.css?v=2"
  ,"./books/orks/styles/book.css?v=2"
  ,"./books/orks/scripts/app.js?v=2"
  ,"./books/emperors-children/"
  ,EMPERORS_CHILDREN_FALLBACK
  ,"./books/emperors-children/reader.html"
  ,"./books/emperors-children/styles/tokens.css?v=2"
  ,"./books/emperors-children/styles/book.css?v=4"
  ,"./books/emperors-children/assets/emperors-children-cover-480.webp"
  ,"./books/emperors-children/assets/emperors-children-cover-800.webp"
  ,"./books/emperors-children/scripts/data.js?v=2"
  ,"./books/emperors-children/scripts/roster-data.js?v=14"
  ,"./books/emperors-children/scripts/target-data.js?v=4"
  ,"./books/emperors-children/scripts/roster-filter.js?v=6"
  ,"./books/emperors-children/scripts/stratagem-types.mjs?v=2"
  ,"./books/emperors-children/generated/compatible-rules.json"
  ,"./books/emperors-children/mobile/related-rules.inc?v=2"
  ,"./books/emperors-children/scripts/app.js?v=8"
  ,"./books/space-marines/"
  ,SPACE_MARINES_DESKTOP_FALLBACK
  ,"./books/space-marines/styles/tokens.css?v=3"
  ,"./books/space-marines/styles/book.css?v=4"
  ,"./books/space-marines/assets/space-marines-cover-480.webp"
  ,"./books/space-marines/assets/space-marines-cover-800.webp"
  ,"./books/space-marines/scripts/data.js?v=2"
  ,"./books/space-marines/scripts/roster-data.js?v=14"
  ,"./books/space-marines/scripts/target-data.js?v=4"
  ,"./books/space-marines/scripts/roster-filter.js?v=5"
  ,"./books/space-marines/scripts/app.js?v=9"
  ,"./books/space-marines/generated/compatible-rules.json"
  ,"./books/space-marines/mobile/related-rules.inc?v=4"
  ,"./books/dark-angels/"
  ,DARK_ANGELS_ENTRY_FALLBACK
  ,"./books/dark-angels/reader.html"
  ,"./books/dark-angels/mobile/related-rules.inc?v=3"
  ,"./books/dark-angels/styles/tokens.css?v=2"
  ,"./books/dark-angels/styles/book.css?v=4"
  ,"./books/dark-angels/assets/dark-angels-cover-480.webp"
  ,"./books/dark-angels/assets/dark-angels-cover-800.webp"
  ,"./books/dark-angels/scripts/data.js?v=2"
  ,"./books/dark-angels/scripts/roster-data.js?v=14"
  ,"./books/dark-angels/scripts/target-data.js?v=4"
  ,"./books/dark-angels/scripts/roster-filter.js?v=3"
  ,"./books/dark-angels/scripts/app.js?v=8"
  ,"./books/shared/modal-focus.js?v=1"
  ,"./books/shared/army-related-rules.js?v=18"
  ,"./books/shared/roster-context.js?v=20"
  ,"./books/shared/roster-game-presentation.js?v=21"
,"./books/shared/army-book-app.js?v=20"
  ,"./books/shared/offline-status.js?v=4"
  ,"./books/shared/styles/offline-status.css?v=2"
  // BEGIN GENERATED OFFLINE MOBILE ROUTES
  ,"./books/death-guard/mobile/army-rules.html"
  ,"./books/death-guard/mobile/beasts-of-nurgle.html"
  ,"./books/death-guard/mobile/biologus-putrifier.html"
  ,"./books/death-guard/mobile/blightlord-terminators.html"
  ,"./books/death-guard/mobile/champions-of-contagion.html"
  ,"./books/death-guard/mobile/chaos-land-raider.html"
  ,"./books/death-guard/mobile/chaos-predator-annihilator.html"
  ,"./books/death-guard/mobile/chaos-predator-destructor.html"
  ,"./books/death-guard/mobile/chaos-rhino.html"
  ,"./books/death-guard/mobile/chaos-spawn.html"
  ,"./books/death-guard/mobile/contagion-engines.html"
  ,"./books/death-guard/mobile/daemon-prince-of-nurgle-with-wings.html"
  ,"./books/death-guard/mobile/daemon-prince-of-nurgle.html"
  ,"./books/death-guard/mobile/death-lords-chosen.html"
  ,"./books/death-guard/mobile/deathshroud-terminators.html"
  ,"./books/death-guard/mobile/defiler.html"
  ,"./books/death-guard/mobile/flyblown-host.html"
  ,"./books/death-guard/mobile/foetid-bloat-drone-with-heavy-blight-launcher.html"
  ,"./books/death-guard/mobile/foetid-bloat-drone.html"
  ,"./books/death-guard/mobile/foul-blightspawn.html"
  ,"./books/death-guard/mobile/great-unclean-one.html"
  ,"./books/death-guard/mobile/helbrute.html"
  ,"./books/death-guard/mobile/icon-bearer.html"
  ,"./books/death-guard/mobile/index.html"
  ,"./books/death-guard/mobile/lord-of-contagion.html"
  ,"./books/death-guard/mobile/lord-of-poxes.html"
  ,"./books/death-guard/mobile/lord-of-virulence.html"
  ,"./books/death-guard/mobile/malignant-plaguecaster.html"
  ,"./books/death-guard/mobile/miasmic-malignifier.html"
  ,"./books/death-guard/mobile/mortarion.html"
  ,"./books/death-guard/mobile/mortarions-hammer.html"
  ,"./books/death-guard/mobile/myphitic-blight-hauler.html"
  ,"./books/death-guard/mobile/noxious-blightbringer.html"
  ,"./books/death-guard/mobile/nurglings.html"
  ,"./books/death-guard/mobile/paragons-of-putrescence.html"
  ,"./books/death-guard/mobile/plague-drones.html"
  ,"./books/death-guard/mobile/plague-marines.html"
  ,"./books/death-guard/mobile/plague-surgeon.html"
  ,"./books/death-guard/mobile/plaguebearers.html"
  ,"./books/death-guard/mobile/plagueburst-crawler.html"
  ,"./books/death-guard/mobile/poxwalkers.html"
  ,"./books/death-guard/mobile/rotigus.html"
  ,"./books/death-guard/mobile/shamblerot-vectorium.html"
  ,"./books/death-guard/mobile/tallyband-summoners.html"
  ,"./books/death-guard/mobile/tallyman.html"
  ,"./books/death-guard/mobile/typhus.html"
  ,"./books/death-guard/mobile/updates.html"
  ,"./books/death-guard/mobile/virulent-vectorium.html"
  ,"./books/adeptus-mechanicus/mobile/archaeopter-fusilave.html"
  ,"./books/adeptus-mechanicus/mobile/archaeopter-stratoraptor.html"
  ,"./books/adeptus-mechanicus/mobile/archaeopter-transvector.html"
  ,"./books/adeptus-mechanicus/mobile/army-rules.html"
  ,"./books/adeptus-mechanicus/mobile/belisarius-cawl.html"
  ,"./books/adeptus-mechanicus/mobile/cohort-acquisitus.html"
  ,"./books/adeptus-mechanicus/mobile/cohort-cybernetica.html"
  ,"./books/adeptus-mechanicus/mobile/corpuscarii-electro-priests.html"
  ,"./books/adeptus-mechanicus/mobile/cybernetica-datasmith.html"
  ,"./books/adeptus-mechanicus/mobile/data-psalm-conclave.html"
  ,"./books/adeptus-mechanicus/mobile/eradication-cohort.html"
  ,"./books/adeptus-mechanicus/mobile/explorator-maniple.html"
  ,"./books/adeptus-mechanicus/mobile/fulgurite-electro-priests.html"
  ,"./books/adeptus-mechanicus/mobile/haloscreed-battle-clade.html"
  ,"./books/adeptus-mechanicus/mobile/hastarii-exterminators.html"
  ,"./books/adeptus-mechanicus/mobile/hastarii-fusiliers.html"
  ,"./books/adeptus-mechanicus/mobile/index.html"
  ,"./books/adeptus-mechanicus/mobile/ironstrider-ballistarii.html"
  ,"./books/adeptus-mechanicus/mobile/kastelan-robots.html"
  ,"./books/adeptus-mechanicus/mobile/kataphron-breachers.html"
  ,"./books/adeptus-mechanicus/mobile/kataphron-destroyers.html"
  ,"./books/adeptus-mechanicus/mobile/lords-of-the-forge.html"
  ,"./books/adeptus-mechanicus/mobile/luminen-auto-choir.html"
  ,"./books/adeptus-mechanicus/mobile/onager-dunecrawler.html"
  ,"./books/adeptus-mechanicus/mobile/pteraxii-skystalkers.html"
  ,"./books/adeptus-mechanicus/mobile/pteraxii-sterylizors.html"
  ,"./books/adeptus-mechanicus/mobile/rad-zone-corps.html"
  ,"./books/adeptus-mechanicus/mobile/serberys-raiders.html"
  ,"./books/adeptus-mechanicus/mobile/serberys-sulphurhounds.html"
  ,"./books/adeptus-mechanicus/mobile/servitor-battleclade.html"
  ,"./books/adeptus-mechanicus/mobile/sicarian-infiltrators.html"
  ,"./books/adeptus-mechanicus/mobile/sicarian-ruststalkers.html"
  ,"./books/adeptus-mechanicus/mobile/skitarii-hunter-cohort.html"
  ,"./books/adeptus-mechanicus/mobile/skitarii-marshal.html"
  ,"./books/adeptus-mechanicus/mobile/skitarii-rangers.html"
  ,"./books/adeptus-mechanicus/mobile/skitarii-vanguard.html"
  ,"./books/adeptus-mechanicus/mobile/skorpius-disintegrator.html"
  ,"./books/adeptus-mechanicus/mobile/skorpius-dunerider.html"
  ,"./books/adeptus-mechanicus/mobile/sydonian-dragoons-with-radium-jezzails.html"
  ,"./books/adeptus-mechanicus/mobile/sydonian-dragoons-with-taser-lances.html"
  ,"./books/adeptus-mechanicus/mobile/sydonian-skatros.html"
  ,"./books/adeptus-mechanicus/mobile/tech-priest-dominus.html"
  ,"./books/adeptus-mechanicus/mobile/tech-priest-enginseer.html"
  ,"./books/adeptus-mechanicus/mobile/tech-priest-manipulus.html"
  ,"./books/adeptus-mechanicus/mobile/technoarcheologist.html"
  ,"./books/adeptus-mechanicus/mobile/thulia-ghuld.html"
  ,"./books/adeptus-mechanicus/mobile/updates.html"
  ,"./books/tyranids/mobile/ambush-predators.html"
  ,"./books/tyranids/mobile/army-rules.html"
  ,"./books/tyranids/mobile/assimilation-swarm.html"
  ,"./books/tyranids/mobile/barbgaunts.html"
  ,"./books/tyranids/mobile/biovores.html"
  ,"./books/tyranids/mobile/broodlord.html"
  ,"./books/tyranids/mobile/carnifexes.html"
  ,"./books/tyranids/mobile/crusher-stampede.html"
  ,"./books/tyranids/mobile/deathleaper.html"
  ,"./books/tyranids/mobile/exocrine.html"
  ,"./books/tyranids/mobile/gargoyles.html"
  ,"./books/tyranids/mobile/genestealers.html"
  ,"./books/tyranids/mobile/harpy.html"
  ,"./books/tyranids/mobile/harridan.html"
  ,"./books/tyranids/mobile/haruspex.html"
  ,"./books/tyranids/mobile/hierophant.html"
  ,"./books/tyranids/mobile/hive-crone.html"
  ,"./books/tyranids/mobile/hive-guard.html"
  ,"./books/tyranids/mobile/hive-tyrant.html"
  ,"./books/tyranids/mobile/hormagaunts.html"
  ,"./books/tyranids/mobile/hyperadapted-raveners.html"
  ,"./books/tyranids/mobile/index.html"
  ,"./books/tyranids/mobile/invasion-fleet.html"
  ,"./books/tyranids/mobile/lictor.html"
  ,"./books/tyranids/mobile/maleceptor.html"
  ,"./books/tyranids/mobile/mawloc.html"
  ,"./books/tyranids/mobile/mucolid-spores.html"
  ,"./books/tyranids/mobile/neurogaunts.html"
  ,"./books/tyranids/mobile/neurolictor.html"
  ,"./books/tyranids/mobile/neurotyrant.html"
  ,"./books/tyranids/mobile/norn-assimilator.html"
  ,"./books/tyranids/mobile/norn-emissary.html"
  ,"./books/tyranids/mobile/old-one-eye.html"
  ,"./books/tyranids/mobile/parasite-of-mortrex.html"
  ,"./books/tyranids/mobile/psychophage.html"
  ,"./books/tyranids/mobile/pyrovores.html"
  ,"./books/tyranids/mobile/raveners.html"
  ,"./books/tyranids/mobile/ripper-swarms.html"
  ,"./books/tyranids/mobile/screamer-killer.html"
  ,"./books/tyranids/mobile/spore-mines.html"
  ,"./books/tyranids/mobile/sporocyst.html"
  ,"./books/tyranids/mobile/subterranean-assault.html"
  ,"./books/tyranids/mobile/synaptic-nexus.html"
  ,"./books/tyranids/mobile/talons-of-the-norn-queen.html"
  ,"./books/tyranids/mobile/termagants.html"
  ,"./books/tyranids/mobile/tervigon.html"
  ,"./books/tyranids/mobile/the-red-terror.html"
  ,"./books/tyranids/mobile/the-swarmlord.html"
  ,"./books/tyranids/mobile/toxicrene.html"
  ,"./books/tyranids/mobile/trygon.html"
  ,"./books/tyranids/mobile/tyranid-prime-with-lash-whip.html"
  ,"./books/tyranids/mobile/tyranid-warriors-with-melee-bio-weapons.html"
  ,"./books/tyranids/mobile/tyranid-warriors-with-ranged-bio-weapons.html"
  ,"./books/tyranids/mobile/tyrannocyte.html"
  ,"./books/tyranids/mobile/tyrannofex.html"
  ,"./books/tyranids/mobile/tyrant-guard.html"
  ,"./books/tyranids/mobile/unending-swarm.html"
  ,"./books/tyranids/mobile/updates.html"
  ,"./books/tyranids/mobile/vanguard-onslaught.html"
  ,"./books/tyranids/mobile/venomthropes.html"
  ,"./books/tyranids/mobile/von-ryans-leapers.html"
  ,"./books/tyranids/mobile/warrior-bioform-onslaught.html"
  ,"./books/tyranids/mobile/winged-hive-tyrant.html"
  ,"./books/tyranids/mobile/winged-tyranid-prime.html"
  ,"./books/tyranids/mobile/zoanthropes.html"
  ,"./books/tau-empire/mobile/advanced-acquisition-cadre.html"
  ,"./books/tau-empire/mobile/army-rules.html"
  ,"./books/tau-empire/mobile/auxiliary-cadre.html"
  ,"./books/tau-empire/mobile/ax-1-0-tiger-shark.html"
  ,"./books/tau-empire/mobile/breacher-team.html"
  ,"./books/tau-empire/mobile/broadside-battlesuits.html"
  ,"./books/tau-empire/mobile/cadre-fireblade.html"
  ,"./books/tau-empire/mobile/commander-farsight.html"
  ,"./books/tau-empire/mobile/commander-in-coldstar-battlesuit.html"
  ,"./books/tau-empire/mobile/commander-in-enforcer-battlesuit.html"
  ,"./books/tau-empire/mobile/commander-shadowsun.html"
  ,"./books/tau-empire/mobile/crisis-fireknife-battlesuits.html"
  ,"./books/tau-empire/mobile/crisis-starscythe-battlesuits.html"
  ,"./books/tau-empire/mobile/crisis-sunforge-battlesuits.html"
  ,"./books/tau-empire/mobile/darkstrider.html"
  ,"./books/tau-empire/mobile/devilfish.html"
  ,"./books/tau-empire/mobile/ethereal.html"
  ,"./books/tau-empire/mobile/experimental-prototype-cadre.html"
  ,"./books/tau-empire/mobile/firesight-team.html"
  ,"./books/tau-empire/mobile/ghostkeel-battlesuit.html"
  ,"./books/tau-empire/mobile/hammerhead-gunship.html"
  ,"./books/tau-empire/mobile/index.html"
  ,"./books/tau-empire/mobile/kauyon.html"
  ,"./books/tau-empire/mobile/kroot-carnivores.html"
  ,"./books/tau-empire/mobile/kroot-farstalkers.html"
  ,"./books/tau-empire/mobile/kroot-flesh-shaper.html"
  ,"./books/tau-empire/mobile/kroot-hounds.html"
  ,"./books/tau-empire/mobile/kroot-hunting-pack.html"
  ,"./books/tau-empire/mobile/kroot-lone-spear.html"
  ,"./books/tau-empire/mobile/kroot-trail-shaper.html"
  ,"./books/tau-empire/mobile/kroot-war-shaper.html"
  ,"./books/tau-empire/mobile/krootox-rampagers.html"
  ,"./books/tau-empire/mobile/krootox-riders.html"
  ,"./books/tau-empire/mobile/manta.html"
  ,"./books/tau-empire/mobile/montka.html"
  ,"./books/tau-empire/mobile/pathfinder-team.html"
  ,"./books/tau-empire/mobile/piranhas.html"
  ,"./books/tau-empire/mobile/razorshark-strike-fighter.html"
  ,"./books/tau-empire/mobile/retaliation-cadre.html"
  ,"./books/tau-empire/mobile/riptide-battlesuit.html"
  ,"./books/tau-empire/mobile/sky-ray-gunship.html"
  ,"./books/tau-empire/mobile/stealth-battlesuits.html"
  ,"./books/tau-empire/mobile/stormsurge.html"
  ,"./books/tau-empire/mobile/strike-team.html"
  ,"./books/tau-empire/mobile/sun-shark-bomber.html"
  ,"./books/tau-empire/mobile/taunar-supremacy-armour.html"
  ,"./books/tau-empire/mobile/the-twin-lance.html"
  ,"./books/tau-empire/mobile/tidewall-droneport.html"
  ,"./books/tau-empire/mobile/tidewall-gunrig.html"
  ,"./books/tau-empire/mobile/tidewall-shieldline.html"
  ,"./books/tau-empire/mobile/tiger-shark.html"
  ,"./books/tau-empire/mobile/updates.html"
  ,"./books/tau-empire/mobile/vespid-stingwings.html"
  ,"./books/emperors-children/mobile/army-rules.html"
  ,"./books/emperors-children/mobile/carnival-of-excess.html"
  ,"./books/emperors-children/mobile/chaos-land-raider.html"
  ,"./books/emperors-children/mobile/chaos-rhino.html"
  ,"./books/emperors-children/mobile/chaos-spawn.html"
  ,"./books/emperors-children/mobile/chaos-terminators.html"
  ,"./books/emperors-children/mobile/coterie-of-the-conceited.html"
  ,"./books/emperors-children/mobile/court-of-the-phoenician.html"
  ,"./books/emperors-children/mobile/daemon-prince-of-slaanesh-with-wings.html"
  ,"./books/emperors-children/mobile/daemon-prince-of-slaanesh.html"
  ,"./books/emperors-children/mobile/daemonettes.html"
  ,"./books/emperors-children/mobile/defiler.html"
  ,"./books/emperors-children/mobile/elegant-brutes.html"
  ,"./books/emperors-children/mobile/fiends.html"
  ,"./books/emperors-children/mobile/flawless-blades.html"
  ,"./books/emperors-children/mobile/frenzied-host.html"
  ,"./books/emperors-children/mobile/fulgrim.html"
  ,"./books/emperors-children/mobile/heldrake.html"
  ,"./books/emperors-children/mobile/index.html"
  ,"./books/emperors-children/mobile/infractors.html"
  ,"./books/emperors-children/mobile/keeper-of-secrets.html"
  ,"./books/emperors-children/mobile/lord-exultant.html"
  ,"./books/emperors-children/mobile/lord-kakophonist.html"
  ,"./books/emperors-children/mobile/lucius-the-eternal.html"
  ,"./books/emperors-children/mobile/maulerfiend.html"
  ,"./books/emperors-children/mobile/mercurial-host.html"
  ,"./books/emperors-children/mobile/noise-marines.html"
  ,"./books/emperors-children/mobile/peerless-bladesmen.html"
  ,"./books/emperors-children/mobile/rapid-evisceration.html"
  ,"./books/emperors-children/mobile/seekers.html"
  ,"./books/emperors-children/mobile/shalaxi-helbane.html"
  ,"./books/emperors-children/mobile/slaaneshs-chosen.html"
  ,"./books/emperors-children/mobile/sorcerer.html"
  ,"./books/emperors-children/mobile/spectacle-of-slaughter.html"
  ,"./books/emperors-children/mobile/tormentors.html"
  ,"./books/emperors-children/mobile/updates.html"
  ,"./books/chaos-space-marines/mobile/abaddon-the-despoiler.html"
  ,"./books/chaos-space-marines/mobile/accursed-cultists.html"
  ,"./books/chaos-space-marines/mobile/army-rules.html"
  ,"./books/chaos-space-marines/mobile/cabal-of-chaos.html"
  ,"./books/chaos-space-marines/mobile/chaos-bikers.html"
  ,"./books/chaos-space-marines/mobile/chaos-cult.html"
  ,"./books/chaos-space-marines/mobile/chaos-land-raider.html"
  ,"./books/chaos-space-marines/mobile/chaos-lord-in-terminator-armour.html"
  ,"./books/chaos-space-marines/mobile/chaos-lord-with-jump-pack.html"
  ,"./books/chaos-space-marines/mobile/chaos-lord.html"
  ,"./books/chaos-space-marines/mobile/chaos-predator-annihilator.html"
  ,"./books/chaos-space-marines/mobile/chaos-predator-destructor.html"
  ,"./books/chaos-space-marines/mobile/chaos-rhino.html"
  ,"./books/chaos-space-marines/mobile/chaos-spawn.html"
  ,"./books/chaos-space-marines/mobile/chaos-terminator-squad.html"
  ,"./books/chaos-space-marines/mobile/chaos-vindicator.html"
  ,"./books/chaos-space-marines/mobile/chosen.html"
  ,"./books/chaos-space-marines/mobile/creations-of-bile.html"
  ,"./books/chaos-space-marines/mobile/cult-of-the-arkifane.html"
  ,"./books/chaos-space-marines/mobile/cultist-firebrand.html"
  ,"./books/chaos-space-marines/mobile/cultist-mob.html"
  ,"./books/chaos-space-marines/mobile/cypher.html"
  ,"./books/chaos-space-marines/mobile/dark-apostle.html"
  ,"./books/chaos-space-marines/mobile/dark-commune.html"
  ,"./books/chaos-space-marines/mobile/deceptors.html"
  ,"./books/chaos-space-marines/mobile/defiler.html"
  ,"./books/chaos-space-marines/mobile/devotees-of-destruction.html"
  ,"./books/chaos-space-marines/mobile/dread-talons.html"
  ,"./books/chaos-space-marines/mobile/fabius-bile.html"
  ,"./books/chaos-space-marines/mobile/fellgor-beastmen.html"
  ,"./books/chaos-space-marines/mobile/fellhammer-siege-host.html"
  ,"./books/chaos-space-marines/mobile/forgefiend.html"
  ,"./books/chaos-space-marines/mobile/haarken-worldclaimer.html"
  ,"./books/chaos-space-marines/mobile/havocs.html"
  ,"./books/chaos-space-marines/mobile/helbrute.html"
  ,"./books/chaos-space-marines/mobile/heldrake.html"
  ,"./books/chaos-space-marines/mobile/heretic-astartes-daemon-prince-with-wings.html"
  ,"./books/chaos-space-marines/mobile/heretic-astartes-daemon-prince.html"
  ,"./books/chaos-space-marines/mobile/huron-blackheart.html"
  ,"./books/chaos-space-marines/mobile/huron-s-marauders.html"
  ,"./books/chaos-space-marines/mobile/index.html"
  ,"./books/chaos-space-marines/mobile/khorne-lord-of-skulls.html"
  ,"./books/chaos-space-marines/mobile/kravek-morne.html"
  ,"./books/chaos-space-marines/mobile/legionaries.html"
  ,"./books/chaos-space-marines/mobile/lord-discordant-on-helstalker.html"
  ,"./books/chaos-space-marines/mobile/master-of-executions.html"
  ,"./books/chaos-space-marines/mobile/master-of-possession.html"
  ,"./books/chaos-space-marines/mobile/masters-of-the-maelstrom.html"
  ,"./books/chaos-space-marines/mobile/maulerfiend.html"
  ,"./books/chaos-space-marines/mobile/murdertalon-raiders.html"
  ,"./books/chaos-space-marines/mobile/mutilators.html"
  ,"./books/chaos-space-marines/mobile/nemesis-claw.html"
  ,"./books/chaos-space-marines/mobile/nightmare-hunt.html"
  ,"./books/chaos-space-marines/mobile/noctilith-crown.html"
  ,"./books/chaos-space-marines/mobile/obliterators.html"
  ,"./books/chaos-space-marines/mobile/pactbound-zealots.html"
  ,"./books/chaos-space-marines/mobile/possessed.html"
  ,"./books/chaos-space-marines/mobile/raptors.html"
  ,"./books/chaos-space-marines/mobile/red-corsairs-raiders.html"
  ,"./books/chaos-space-marines/mobile/red-corsairs-reave-captain.html"
  ,"./books/chaos-space-marines/mobile/renegade-raiders.html"
  ,"./books/chaos-space-marines/mobile/renegade-warband.html"
  ,"./books/chaos-space-marines/mobile/sorcerer-in-terminator-armour.html"
  ,"./books/chaos-space-marines/mobile/sorcerer.html"
  ,"./books/chaos-space-marines/mobile/soulforged-warpack.html"
  ,"./books/chaos-space-marines/mobile/traitor-enforcer.html"
  ,"./books/chaos-space-marines/mobile/traitor-guardsmen-squad.html"
  ,"./books/chaos-space-marines/mobile/updates.html"
  ,"./books/chaos-space-marines/mobile/vashtorr-the-arkifane.html"
  ,"./books/chaos-space-marines/mobile/venomcrawler.html"
  ,"./books/chaos-space-marines/mobile/veterans-of-the-long-war.html"
  ,"./books/chaos-space-marines/mobile/warp-talons.html"
  ,"./books/chaos-space-marines/mobile/warpsmith.html"
  ,"./books/chaos-space-marines/mobile/warpstrike-champions.html"
  ,"./books/space-marines/mobile/1st-company-task-force.html"
  ,"./books/space-marines/mobile/adrax-agatone.html"
  ,"./books/space-marines/mobile/aethon-shaan.html"
  ,"./books/space-marines/mobile/aggressor-squad.html"
  ,"./books/space-marines/mobile/ancient-in-terminator-armor.html"
  ,"./books/space-marines/mobile/ancient.html"
  ,"./books/space-marines/mobile/anvil-siege-force.html"
  ,"./books/space-marines/mobile/apothecary-biologis.html"
  ,"./books/space-marines/mobile/apothecary.html"
  ,"./books/space-marines/mobile/armoured-speartip.html"
  ,"./books/space-marines/mobile/army-rules.html"
  ,"./books/space-marines/mobile/assault-intercessor-squad.html"
  ,"./books/space-marines/mobile/assault-intercessors-with-jump-packs.html"
  ,"./books/space-marines/mobile/astraeus.html"
  ,"./books/space-marines/mobile/ballistus-dreadnought.html"
  ,"./books/space-marines/mobile/bastion-task-force.html"
  ,"./books/space-marines/mobile/blade-of-ultramar.html"
  ,"./books/space-marines/mobile/bladeguard-ancient.html"
  ,"./books/space-marines/mobile/bladeguard-veteran-squad.html"
  ,"./books/space-marines/mobile/brutalis-dreadnought.html"
  ,"./books/space-marines/mobile/caanok-var.html"
  ,"./books/space-marines/mobile/captain-in-gravis-armour.html"
  ,"./books/space-marines/mobile/captain-in-phobos-armour.html"
  ,"./books/space-marines/mobile/captain-in-terminator-armour.html"
  ,"./books/space-marines/mobile/captain-titus.html"
  ,"./books/space-marines/mobile/captain-with-jump-pack.html"
  ,"./books/space-marines/mobile/captain.html"
  ,"./books/space-marines/mobile/cato-sicarius.html"
  ,"./books/space-marines/mobile/centurion-assault-squad.html"
  ,"./books/space-marines/mobile/centurion-devastator-squad.html"
  ,"./books/space-marines/mobile/ceramite-sentinels.html"
  ,"./books/space-marines/mobile/chaplain-in-terminator-armour.html"
  ,"./books/space-marines/mobile/chaplain-on-bike.html"
  ,"./books/space-marines/mobile/chaplain-with-jump-pack.html"
  ,"./books/space-marines/mobile/chaplain.html"
  ,"./books/space-marines/mobile/chief-librarian-tigurius.html"
  ,"./books/space-marines/mobile/company-heroes.html"
  ,"./books/space-marines/mobile/darnath-lysander.html"
  ,"./books/space-marines/mobile/desolation-squad.html"
  ,"./books/space-marines/mobile/devastator-squad.html"
  ,"./books/space-marines/mobile/dreadnought.html"
  ,"./books/space-marines/mobile/drop-pod.html"
  ,"./books/space-marines/mobile/eliminator-squad.html"
  ,"./books/space-marines/mobile/emperor-s-shield.html"
  ,"./books/space-marines/mobile/eradicator-squad-with-heavy-bolters.html"
  ,"./books/space-marines/mobile/eradicator-squad.html"
  ,"./books/space-marines/mobile/firestorm-assault-force.html"
  ,"./books/space-marines/mobile/firestrike-servo-turrets.html"
  ,"./books/space-marines/mobile/forgefather-s-seekers.html"
  ,"./books/space-marines/mobile/fulguris-task-force.html"
  ,"./books/space-marines/mobile/gladiator-lancer.html"
  ,"./books/space-marines/mobile/gladiator-reaper.html"
  ,"./books/space-marines/mobile/gladiator-valiant.html"
  ,"./books/space-marines/mobile/gladius-task-force.html"
  ,"./books/space-marines/mobile/hammer-of-avernii.html"
  ,"./books/space-marines/mobile/hammerfall-bunker.html"
  ,"./books/space-marines/mobile/headhunter-task-force.html"
  ,"./books/space-marines/mobile/heavy-intercessor-squad.html"
  ,"./books/space-marines/mobile/hellblaster-squad.html"
  ,"./books/space-marines/mobile/impulsor.html"
  ,"./books/space-marines/mobile/inceptor-squad.html"
  ,"./books/space-marines/mobile/incursor-squad.html"
  ,"./books/space-marines/mobile/index.html"
  ,"./books/space-marines/mobile/infernus-squad.html"
  ,"./books/space-marines/mobile/infiltrator-squad.html"
  ,"./books/space-marines/mobile/intercessor-squad.html"
  ,"./books/space-marines/mobile/invader-atv.html"
  ,"./books/space-marines/mobile/invictor-tactical-warsuit.html"
  ,"./books/space-marines/mobile/iron-father-feirros.html"
  ,"./books/space-marines/mobile/ironstorm-spearhead.html"
  ,"./books/space-marines/mobile/judiciar.html"
  ,"./books/space-marines/mobile/kayvaan-shrike.html"
  ,"./books/space-marines/mobile/korsarro-khan.html"
  ,"./books/space-marines/mobile/land-raider-crusader.html"
  ,"./books/space-marines/mobile/land-raider-redeemer.html"
  ,"./books/space-marines/mobile/land-raider.html"
  ,"./books/space-marines/mobile/land-speeder.html"
  ,"./books/space-marines/mobile/librarian-in-phobos-armour.html"
  ,"./books/space-marines/mobile/librarian-in-terminator-armour.html"
  ,"./books/space-marines/mobile/librarian.html"
  ,"./books/space-marines/mobile/librarius-conclave.html"
  ,"./books/space-marines/mobile/lieutenant-in-phobos-armour.html"
  ,"./books/space-marines/mobile/lieutenant-in-reiver-armour.html"
  ,"./books/space-marines/mobile/lieutenant-with-combi-weapon.html"
  ,"./books/space-marines/mobile/lieutenant.html"
  ,"./books/space-marines/mobile/marneus-calgar-in-armour-of-antilochus.html"
  ,"./books/space-marines/mobile/orbital-assault-force.html"
  ,"./books/space-marines/mobile/outrider-squad.html"
  ,"./books/space-marines/mobile/pedro-kantor.html"
  ,"./books/space-marines/mobile/predator-annihilator.html"
  ,"./books/space-marines/mobile/predator-destructor.html"
  ,"./books/space-marines/mobile/razorback.html"
  ,"./books/space-marines/mobile/reclamation-force.html"
  ,"./books/space-marines/mobile/redemptor-dreadnought.html"
  ,"./books/space-marines/mobile/reiver-squad.html"
  ,"./books/space-marines/mobile/repulsor-executioner.html"
  ,"./books/space-marines/mobile/repulsor.html"
  ,"./books/space-marines/mobile/rhino.html"
  ,"./books/space-marines/mobile/roboute-guilliman.html"
  ,"./books/space-marines/mobile/scout-squad.html"
  ,"./books/space-marines/mobile/shadowmark-talon.html"
  ,"./books/space-marines/mobile/spearpoint-task-force.html"
  ,"./books/space-marines/mobile/sternguard-veteran-squad.html"
  ,"./books/space-marines/mobile/storm-speeder-hailstrike.html"
  ,"./books/space-marines/mobile/storm-speeder-hammerstrike.html"
  ,"./books/space-marines/mobile/storm-speeder-thunderstrike.html"
  ,"./books/space-marines/mobile/stormhawk-interceptor.html"
  ,"./books/space-marines/mobile/stormlance-task-force.html"
  ,"./books/space-marines/mobile/stormraven-gunship.html"
  ,"./books/space-marines/mobile/stormtalon-gunship.html"
  ,"./books/space-marines/mobile/suboden-khan.html"
  ,"./books/space-marines/mobile/subversion-assets.html"
  ,"./books/space-marines/mobile/suppressor-squad.html"
  ,"./books/space-marines/mobile/tactical-squad.html"
  ,"./books/space-marines/mobile/techmarine.html"
  ,"./books/space-marines/mobile/terminator-assault-squad.html"
  ,"./books/space-marines/mobile/terminator-squad.html"
  ,"./books/space-marines/mobile/thunderhawk-gunship.html"
  ,"./books/space-marines/mobile/tor-garadon.html"
  ,"./books/space-marines/mobile/updates.html"
  ,"./books/space-marines/mobile/uriel-ventris.html"
  ,"./books/space-marines/mobile/vanguard-spearhead.html"
  ,"./books/space-marines/mobile/vanguard-veteran-squad-with-jump-packs.html"
  ,"./books/space-marines/mobile/vengeful-hosts.html"
  ,"./books/space-marines/mobile/victrix-honour-guard.html"
  ,"./books/space-marines/mobile/vindicator.html"
  ,"./books/space-marines/mobile/vulkan-hestan.html"
  ,"./books/space-marines/mobile/wardens-of-ultramar.html"
  ,"./books/space-marines/mobile/whirlwind.html"
  ,"./books/dark-angels/mobile/1st-company-task-force.html"
  ,"./books/dark-angels/mobile/aggressor-squad.html"
  ,"./books/dark-angels/mobile/ancient-in-terminator-armor.html"
  ,"./books/dark-angels/mobile/ancient.html"
  ,"./books/dark-angels/mobile/anvil-siege-force.html"
  ,"./books/dark-angels/mobile/apothecary-biologis.html"
  ,"./books/dark-angels/mobile/apothecary.html"
  ,"./books/dark-angels/mobile/armoured-speartip.html"
  ,"./books/dark-angels/mobile/army-rules.html"
  ,"./books/dark-angels/mobile/asmodai.html"
  ,"./books/dark-angels/mobile/assault-intercessor-squad.html"
  ,"./books/dark-angels/mobile/assault-intercessors-with-jump-packs.html"
  ,"./books/dark-angels/mobile/astraeus.html"
  ,"./books/dark-angels/mobile/azrael.html"
  ,"./books/dark-angels/mobile/ballistus-dreadnought.html"
  ,"./books/dark-angels/mobile/bastion-task-force.html"
  ,"./books/dark-angels/mobile/belial.html"
  ,"./books/dark-angels/mobile/bladeguard-ancient.html"
  ,"./books/dark-angels/mobile/bladeguard-veteran-squad.html"
  ,"./books/dark-angels/mobile/brutalis-dreadnought.html"
  ,"./books/dark-angels/mobile/captain-in-gravis-armour.html"
  ,"./books/dark-angels/mobile/captain-in-phobos-armour.html"
  ,"./books/dark-angels/mobile/captain-in-terminator-armour.html"
  ,"./books/dark-angels/mobile/captain-with-jump-pack.html"
  ,"./books/dark-angels/mobile/captain.html"
  ,"./books/dark-angels/mobile/centurion-assault-squad.html"
  ,"./books/dark-angels/mobile/centurion-devastator-squad.html"
  ,"./books/dark-angels/mobile/ceramite-sentinels.html"
  ,"./books/dark-angels/mobile/chaplain-in-terminator-armour.html"
  ,"./books/dark-angels/mobile/chaplain-on-bike.html"
  ,"./books/dark-angels/mobile/chaplain-with-jump-pack.html"
  ,"./books/dark-angels/mobile/chaplain.html"
  ,"./books/dark-angels/mobile/company-heroes.html"
  ,"./books/dark-angels/mobile/company-of-hunters.html"
  ,"./books/dark-angels/mobile/dark-age-arsenal.html"
  ,"./books/dark-angels/mobile/darkflight-pursuit.html"
  ,"./books/dark-angels/mobile/deathwing-knights.html"
  ,"./books/dark-angels/mobile/deathwing-terminator-squad.html"
  ,"./books/dark-angels/mobile/desolation-squad.html"
  ,"./books/dark-angels/mobile/devastator-squad.html"
  ,"./books/dark-angels/mobile/dreadnought.html"
  ,"./books/dark-angels/mobile/drop-pod.html"
  ,"./books/dark-angels/mobile/eliminator-squad.html"
  ,"./books/dark-angels/mobile/eradicator-squad-with-heavy-bolters.html"
  ,"./books/dark-angels/mobile/eradicator-squad.html"
  ,"./books/dark-angels/mobile/ezekiel.html"
  ,"./books/dark-angels/mobile/firestorm-assault-force.html"
  ,"./books/dark-angels/mobile/firestrike-servo-turrets.html"
  ,"./books/dark-angels/mobile/fulguris-task-force.html"
  ,"./books/dark-angels/mobile/gladiator-lancer.html"
  ,"./books/dark-angels/mobile/gladiator-reaper.html"
  ,"./books/dark-angels/mobile/gladiator-valiant.html"
  ,"./books/dark-angels/mobile/gladius-task-force.html"
  ,"./books/dark-angels/mobile/hammerfall-bunker.html"
  ,"./books/dark-angels/mobile/headhunter-task-force.html"
  ,"./books/dark-angels/mobile/heavy-intercessor-squad.html"
  ,"./books/dark-angels/mobile/hellblaster-squad.html"
  ,"./books/dark-angels/mobile/impulsor.html"
  ,"./books/dark-angels/mobile/inceptor-squad.html"
  ,"./books/dark-angels/mobile/incursor-squad.html"
  ,"./books/dark-angels/mobile/index.html"
  ,"./books/dark-angels/mobile/infernus-squad.html"
  ,"./books/dark-angels/mobile/infiltrator-squad.html"
  ,"./books/dark-angels/mobile/inner-circle-companions.html"
  ,"./books/dark-angels/mobile/inner-circle-task-force.html"
  ,"./books/dark-angels/mobile/intercessor-squad.html"
  ,"./books/dark-angels/mobile/interrogation-conclave.html"
  ,"./books/dark-angels/mobile/invader-atv.html"
  ,"./books/dark-angels/mobile/invictor-tactical-warsuit.html"
  ,"./books/dark-angels/mobile/ironstorm-spearhead.html"
  ,"./books/dark-angels/mobile/judiciar.html"
  ,"./books/dark-angels/mobile/land-raider-crusader.html"
  ,"./books/dark-angels/mobile/land-raider-redeemer.html"
  ,"./books/dark-angels/mobile/land-raider.html"
  ,"./books/dark-angels/mobile/land-speeder-vengeance.html"
  ,"./books/dark-angels/mobile/land-speeder.html"
  ,"./books/dark-angels/mobile/lazarus.html"
  ,"./books/dark-angels/mobile/librarian-in-phobos-armour.html"
  ,"./books/dark-angels/mobile/librarian-in-terminator-armour.html"
  ,"./books/dark-angels/mobile/librarian.html"
  ,"./books/dark-angels/mobile/librarius-conclave.html"
  ,"./books/dark-angels/mobile/lieutenant-in-phobos-armour.html"
  ,"./books/dark-angels/mobile/lieutenant-in-reiver-armour.html"
  ,"./books/dark-angels/mobile/lieutenant-with-combi-weapon.html"
  ,"./books/dark-angels/mobile/lieutenant.html"
  ,"./books/dark-angels/mobile/lion-eljonson.html"
  ,"./books/dark-angels/mobile/lion-s-blade-task-force.html"
  ,"./books/dark-angels/mobile/nephilim-jetfighter.html"
  ,"./books/dark-angels/mobile/orbital-assault-force.html"
  ,"./books/dark-angels/mobile/outrider-squad.html"
  ,"./books/dark-angels/mobile/predator-annihilator.html"
  ,"./books/dark-angels/mobile/predator-destructor.html"
  ,"./books/dark-angels/mobile/ravenwing-black-knights.html"
  ,"./books/dark-angels/mobile/ravenwing-command-squad.html"
  ,"./books/dark-angels/mobile/ravenwing-dark-talon.html"
  ,"./books/dark-angels/mobile/ravenwing-darkshroud.html"
  ,"./books/dark-angels/mobile/razorback.html"
  ,"./books/dark-angels/mobile/redemptor-dreadnought.html"
  ,"./books/dark-angels/mobile/reiver-squad.html"
  ,"./books/dark-angels/mobile/repulsor-executioner.html"
  ,"./books/dark-angels/mobile/repulsor.html"
  ,"./books/dark-angels/mobile/rhino.html"
  ,"./books/dark-angels/mobile/sammael.html"
  ,"./books/dark-angels/mobile/scout-squad.html"
  ,"./books/dark-angels/mobile/sternguard-veteran-squad.html"
  ,"./books/dark-angels/mobile/storm-speeder-hailstrike.html"
  ,"./books/dark-angels/mobile/storm-speeder-hammerstrike.html"
  ,"./books/dark-angels/mobile/storm-speeder-thunderstrike.html"
  ,"./books/dark-angels/mobile/stormhawk-interceptor.html"
  ,"./books/dark-angels/mobile/stormlance-task-force.html"
  ,"./books/dark-angels/mobile/stormraven-gunship.html"
  ,"./books/dark-angels/mobile/stormtalon-gunship.html"
  ,"./books/dark-angels/mobile/subversion-assets.html"
  ,"./books/dark-angels/mobile/suppressor-squad.html"
  ,"./books/dark-angels/mobile/tactical-squad.html"
  ,"./books/dark-angels/mobile/techmarine.html"
  ,"./books/dark-angels/mobile/terminator-assault-squad.html"
  ,"./books/dark-angels/mobile/terminator-squad.html"
  ,"./books/dark-angels/mobile/thunderhawk-gunship.html"
  ,"./books/dark-angels/mobile/unforgiven-task-force.html"
  ,"./books/dark-angels/mobile/updates.html"
  ,"./books/dark-angels/mobile/vanguard-spearhead.html"
  ,"./books/dark-angels/mobile/vanguard-veteran-squad-with-jump-packs.html"
  ,"./books/dark-angels/mobile/vengeful-hosts.html"
  ,"./books/dark-angels/mobile/vindicator.html"
  ,"./books/dark-angels/mobile/whirlwind.html"
  ,"./books/dark-angels/mobile/wrath-of-the-rock.html"
  ,"./books/blood-angels/mobile/1st-company-task-force.html"
  ,"./books/blood-angels/mobile/aggressor-squad.html"
  ,"./books/blood-angels/mobile/ancient-in-terminator-armor.html"
  ,"./books/blood-angels/mobile/ancient.html"
  ,"./books/blood-angels/mobile/angelic-inheritors.html"
  ,"./books/blood-angels/mobile/anvil-siege-force.html"
  ,"./books/blood-angels/mobile/apothecary-biologis.html"
  ,"./books/blood-angels/mobile/apothecary.html"
  ,"./books/blood-angels/mobile/armoured-speartip.html"
  ,"./books/blood-angels/mobile/army-rules.html"
  ,"./books/blood-angels/mobile/assault-intercessor-squad.html"
  ,"./books/blood-angels/mobile/assault-intercessors-with-jump-packs.html"
  ,"./books/blood-angels/mobile/astorath.html"
  ,"./books/blood-angels/mobile/astraeus.html"
  ,"./books/blood-angels/mobile/baal-predator.html"
  ,"./books/blood-angels/mobile/ballistus-dreadnought.html"
  ,"./books/blood-angels/mobile/bastion-task-force.html"
  ,"./books/blood-angels/mobile/bladeguard-ancient.html"
  ,"./books/blood-angels/mobile/bladeguard-veteran-squad.html"
  ,"./books/blood-angels/mobile/blood-angels-captain.html"
  ,"./books/blood-angels/mobile/brutalis-dreadnought.html"
  ,"./books/blood-angels/mobile/captain-in-gravis-armour.html"
  ,"./books/blood-angels/mobile/captain-in-phobos-armour.html"
  ,"./books/blood-angels/mobile/captain-in-terminator-armour.html"
  ,"./books/blood-angels/mobile/captain-with-jump-pack.html"
  ,"./books/blood-angels/mobile/captain.html"
  ,"./books/blood-angels/mobile/centurion-assault-squad.html"
  ,"./books/blood-angels/mobile/centurion-devastator-squad.html"
  ,"./books/blood-angels/mobile/ceramite-sentinels.html"
  ,"./books/blood-angels/mobile/chaplain-in-terminator-armour.html"
  ,"./books/blood-angels/mobile/chaplain-on-bike.html"
  ,"./books/blood-angels/mobile/chaplain-with-jump-pack.html"
  ,"./books/blood-angels/mobile/chaplain.html"
  ,"./books/blood-angels/mobile/chief-librarian-mephiston.html"
  ,"./books/blood-angels/mobile/commander-dante.html"
  ,"./books/blood-angels/mobile/company-heroes.html"
  ,"./books/blood-angels/mobile/death-company-captain-with-jump-pack.html"
  ,"./books/blood-angels/mobile/death-company-captain.html"
  ,"./books/blood-angels/mobile/death-company-dreadnought.html"
  ,"./books/blood-angels/mobile/death-company-marines-with-bolt-rifles.html"
  ,"./books/blood-angels/mobile/death-company-marines-with-jump-packs.html"
  ,"./books/blood-angels/mobile/death-company-marines.html"
  ,"./books/blood-angels/mobile/desolation-squad.html"
  ,"./books/blood-angels/mobile/devastator-squad.html"
  ,"./books/blood-angels/mobile/dreadnought.html"
  ,"./books/blood-angels/mobile/drop-pod.html"
  ,"./books/blood-angels/mobile/eliminator-squad.html"
  ,"./books/blood-angels/mobile/encarmine-speartip.html"
  ,"./books/blood-angels/mobile/eradicator-squad-with-heavy-bolters.html"
  ,"./books/blood-angels/mobile/eradicator-squad.html"
  ,"./books/blood-angels/mobile/firestorm-assault-force.html"
  ,"./books/blood-angels/mobile/firestrike-servo-turrets.html"
  ,"./books/blood-angels/mobile/fulguris-task-force.html"
  ,"./books/blood-angels/mobile/gladiator-lancer.html"
  ,"./books/blood-angels/mobile/gladiator-reaper.html"
  ,"./books/blood-angels/mobile/gladiator-valiant.html"
  ,"./books/blood-angels/mobile/gladius-task-force.html"
  ,"./books/blood-angels/mobile/hammerfall-bunker.html"
  ,"./books/blood-angels/mobile/headhunter-task-force.html"
  ,"./books/blood-angels/mobile/heavy-intercessor-squad.html"
  ,"./books/blood-angels/mobile/hellblaster-squad.html"
  ,"./books/blood-angels/mobile/impulsor.html"
  ,"./books/blood-angels/mobile/inceptor-squad.html"
  ,"./books/blood-angels/mobile/incursor-squad.html"
  ,"./books/blood-angels/mobile/index.html"
  ,"./books/blood-angels/mobile/infernus-squad.html"
  ,"./books/blood-angels/mobile/infiltrator-squad.html"
  ,"./books/blood-angels/mobile/intercessor-squad.html"
  ,"./books/blood-angels/mobile/invader-atv.html"
  ,"./books/blood-angels/mobile/invictor-tactical-warsuit.html"
  ,"./books/blood-angels/mobile/ironstorm-spearhead.html"
  ,"./books/blood-angels/mobile/judiciar.html"
  ,"./books/blood-angels/mobile/land-raider-crusader.html"
  ,"./books/blood-angels/mobile/land-raider-redeemer.html"
  ,"./books/blood-angels/mobile/land-raider.html"
  ,"./books/blood-angels/mobile/land-speeder.html"
  ,"./books/blood-angels/mobile/legacy-of-grace.html"
  ,"./books/blood-angels/mobile/lemartes.html"
  ,"./books/blood-angels/mobile/liberator-assault-group.html"
  ,"./books/blood-angels/mobile/librarian-in-phobos-armour.html"
  ,"./books/blood-angels/mobile/librarian-in-terminator-armour.html"
  ,"./books/blood-angels/mobile/librarian.html"
  ,"./books/blood-angels/mobile/librarius-conclave.html"
  ,"./books/blood-angels/mobile/lieutenant-in-phobos-armour.html"
  ,"./books/blood-angels/mobile/lieutenant-in-reiver-armour.html"
  ,"./books/blood-angels/mobile/lieutenant-with-combi-weapon.html"
  ,"./books/blood-angels/mobile/lieutenant.html"
  ,"./books/blood-angels/mobile/orbital-assault-force.html"
  ,"./books/blood-angels/mobile/outrider-squad.html"
  ,"./books/blood-angels/mobile/predator-annihilator.html"
  ,"./books/blood-angels/mobile/predator-destructor.html"
  ,"./books/blood-angels/mobile/rage-cursed-onslaught.html"
  ,"./books/blood-angels/mobile/razorback.html"
  ,"./books/blood-angels/mobile/redemptor-dreadnought.html"
  ,"./books/blood-angels/mobile/reiver-squad.html"
  ,"./books/blood-angels/mobile/repulsor-executioner.html"
  ,"./books/blood-angels/mobile/repulsor.html"
  ,"./books/blood-angels/mobile/rhino.html"
  ,"./books/blood-angels/mobile/sanguinary-guard.html"
  ,"./books/blood-angels/mobile/sanguinary-priest.html"
  ,"./books/blood-angels/mobile/scout-squad.html"
  ,"./books/blood-angels/mobile/sternguard-veteran-squad.html"
  ,"./books/blood-angels/mobile/storm-speeder-hailstrike.html"
  ,"./books/blood-angels/mobile/storm-speeder-hammerstrike.html"
  ,"./books/blood-angels/mobile/storm-speeder-thunderstrike.html"
  ,"./books/blood-angels/mobile/stormhawk-interceptor.html"
  ,"./books/blood-angels/mobile/stormlance-task-force.html"
  ,"./books/blood-angels/mobile/stormraven-gunship.html"
  ,"./books/blood-angels/mobile/stormtalon-gunship.html"
  ,"./books/blood-angels/mobile/subversion-assets.html"
  ,"./books/blood-angels/mobile/suppressor-squad.html"
  ,"./books/blood-angels/mobile/tactical-squad.html"
  ,"./books/blood-angels/mobile/techmarine.html"
  ,"./books/blood-angels/mobile/terminator-assault-squad.html"
  ,"./books/blood-angels/mobile/terminator-squad.html"
  ,"./books/blood-angels/mobile/the-angelic-host.html"
  ,"./books/blood-angels/mobile/the-lost-brethren.html"
  ,"./books/blood-angels/mobile/the-sanguinor.html"
  ,"./books/blood-angels/mobile/thunderhawk-gunship.html"
  ,"./books/blood-angels/mobile/updates.html"
  ,"./books/blood-angels/mobile/vanguard-spearhead.html"
  ,"./books/blood-angels/mobile/vanguard-veteran-squad-with-jump-packs.html"
  ,"./books/blood-angels/mobile/vengeful-hosts.html"
  ,"./books/blood-angels/mobile/vindicator.html"
  ,"./books/blood-angels/mobile/whirlwind.html"
  ,"./books/blood-angels/mobile/wrath-of-the-doomed.html"
  // END GENERATED OFFLINE MOBILE ROUTES
];

function navigationFallback(url) {
  const path = url.pathname;
  if (path.includes("/roster-guides/")) return ROSTER_GUIDES_FALLBACK;
  if (path.includes("/books/death-guard/")) return DEATH_GUARD_FALLBACK;
  if (path.includes("/books/core-rules/")) return CORE_RULES_FALLBACK;
  if (path.includes("/books/adeptus-mechanicus/")) return ADEPTUS_MECHANICUS_FALLBACK;
  if (path.includes("/books/tyranids/mobile/")) return TYRANIDS_MOBILE_FALLBACK;
  if (path.endsWith("/books/tyranids/reader.html")) return TYRANIDS_DESKTOP_FALLBACK;
  if (path.endsWith("/books/tyranids/") || path.endsWith("/books/tyranids/index.html")) return TYRANIDS_ENTRY_FALLBACK;
  if (path.includes("/books/tau-empire/mobile/")) return TAU_EMPIRE_MOBILE_FALLBACK;
  if (path.endsWith("/books/tau-empire/reader.html")) return TAU_EMPIRE_DESKTOP_FALLBACK;
  if (path.endsWith("/books/tau-empire/") || path.endsWith("/books/tau-empire/index.html")) return TAU_EMPIRE_ENTRY_FALLBACK;
  if (path.includes("/books/chaos-space-marines/mobile/")) return CHAOS_SPACE_MARINES_MOBILE_FALLBACK;
  if (path.endsWith("/books/chaos-space-marines/reader.html")) return CHAOS_SPACE_MARINES_DESKTOP_FALLBACK;
  if (path.endsWith("/books/chaos-space-marines/") || path.endsWith("/books/chaos-space-marines/index.html")) return CHAOS_SPACE_MARINES_ENTRY_FALLBACK;
  if (path.includes("/books/blood-angels/mobile/")) return BLOOD_ANGELS_MOBILE_FALLBACK;
  if (path.endsWith("/books/blood-angels/reader.html")) return BLOOD_ANGELS_DESKTOP_FALLBACK;
  if (path.endsWith("/books/blood-angels/") || path.endsWith("/books/blood-angels/index.html")) return BLOOD_ANGELS_ENTRY_FALLBACK;
  if (path.includes("/books/orks/")) return ORKS_FALLBACK;
  if (path.includes("/books/emperors-children/")) return EMPERORS_CHILDREN_FALLBACK;
  if (path.endsWith("/books/space-marines/reader.html")) return SPACE_MARINES_DESKTOP_FALLBACK;
  if (path.includes("/books/space-marines/")) return SPACE_MARINES_ENTRY_FALLBACK;
  if (path.includes("/books/dark-angels/mobile/")) return DARK_ANGELS_MOBILE_FALLBACK;
  if (path.endsWith("/books/dark-angels/reader.html")) return DARK_ANGELS_DESKTOP_FALLBACK;
  if (path.includes("/books/dark-angels/")) return DARK_ANGELS_ENTRY_FALLBACK;
  return LIBRARY_FALLBACK;
}

const INSTALL_SHELL = self.WH40K_PRECACHE || [];
const RUNTIME_ASSETS = self.WH40K_RUNTIME_ASSETS || {};
async function cacheAppShell() {
  if(!INSTALL_SHELL.length)throw new Error('Mandatory offline code inventory is missing');
  const mode=self.registration.active?'updating':'preparing';let completed=0;
  await setOfflinePackageStatus(mode,completed);
  const cache=await caches.open(CACHE_NAME);
  try{
    for(let index=0;index<INSTALL_SHELL.length;index+=APP_SHELL_BATCH_SIZE){
      const batch=INSTALL_SHELL.slice(index,index+APP_SHELL_BATCH_SIZE);
      await Promise.all(batch.map(async url=>{
        const response=await fetch(new URL(url,self.location.href),{cache:'no-store'});
        if(!await matchesPublishedAsset(new URL(url,self.location.href),response))throw new Error('Offline code changed during installation: '+url);
        await cache.put(new URL(url,self.location.href).href,response);
      }));
      completed+=batch.length;await setOfflinePackageStatus(mode,completed);
    }
  }catch(error){await setOfflinePackageStatus('error',completed,error);throw error;}
  await setOfflinePackageStatus('ready',INSTALL_SHELL.length);
}

async function assertCacheRevisionFresh() {
  const response = await fetch(new URL("./glossary/generated/cache-revision.js", self.location.href), {cache: "no-store"});
  if (!response.ok) throw new Error(`Cache revision check failed with ${response.status}`);
  const source = await response.text();
  const revision = source.match(/WH40K_CACHE_REVISION\s*=\s*["']([^"']+)["']/)?.[1];
  if (!revision || revision !== self.WH40K_CACHE_REVISION) throw new Error("Imported cache revision is stale");
}

const OFFLINE_PACKAGE_STATUS = "WH_OFFLINE_PACKAGE_STATUS";
const OFFLINE_PACKAGE_QUERY = "WH_OFFLINE_PACKAGE_STATUS_QUERY";
const VERSION_QUERY = "GET_VERSION";
const VERSION_RESPONSE = "VERSION";
const ACTIVATE_UPDATE = "SKIP_WAITING";
let offlinePackageSequence = 0;
let offlinePackageStatus = {status: "idle", completed: 0, total: INSTALL_SHELL.length, error: null};
function offlinePackagePayload() {return {type: OFFLINE_PACKAGE_STATUS, revision: self.WH40K_CACHE_REVISION, sequence: offlinePackageSequence, ...offlinePackageStatus};}
function versionPayload(extra={}) {return {type: VERSION_RESPONSE, revision: self.WH40K_CACHE_REVISION, cacheName: CACHE_NAME, ...extra};}
async function broadcastOfflinePackageStatus() {const clients=await self.clients.matchAll({type:"window",includeUncontrolled:true}),payload=offlinePackagePayload();for(const client of clients)client.postMessage(payload);}
async function setOfflinePackageStatus(status,completed,error=null){offlinePackageSequence+=1;offlinePackageStatus={status,completed,total:INSTALL_SHELL.length,error:error?String(error.message||error):null};await broadcastOfflinePackageStatus();return offlinePackagePayload();}
async function currentOfflinePackageStatus(){
  if(offlinePackageStatus.status!=="idle")return offlinePackagePayload();
  const cache=await caches.open(CACHE_NAME),cached=new Set((await cache.keys()).map(request=>request.url));
  const completed=INSTALL_SHELL.reduce((count,url)=>count+cached.has(new URL(url,self.location.href).href),0);
  offlinePackageSequence+=1;offlinePackageStatus={status:completed===INSTALL_SHELL.length?"ready":"error",completed,total:INSTALL_SHELL.length,error:null};
  return offlinePackagePayload();
}
self.addEventListener("message",event=>{
  const reply=payload=>{if(event.ports[0])event.ports[0].postMessage(payload);else if(event.source)event.source.postMessage(payload);};
  if(event.data?.type===OFFLINE_PACKAGE_QUERY){event.waitUntil(currentOfflinePackageStatus().then(reply));return;}
  if(event.data?.type===VERSION_QUERY){reply(versionPayload());return;}
  if(event.data?.type!==ACTIVATE_UPDATE)return;
  const accepted=event.data.revision===self.WH40K_CACHE_REVISION&&offlinePackageStatus.status==="ready"&&offlinePackageStatus.completed===INSTALL_SHELL.length;
  reply(versionPayload({accepted}));
  if(accepted)event.waitUntil(Promise.resolve(self.skipWaiting()));
});

self.addEventListener("install", (event) => {
  event.waitUntil(assertCacheRevisionFresh().then(cacheAppShell));
});

self.addEventListener("activate",event=>{
  // Installation is not permission to delete previously downloaded V1 or V2.
  // There is no shared client/version record or per-tab cache state.
  event.waitUntil(self.clients.claim());
});

function publicationPath(url){
  const scope=new URL('./',self.location.href);
  if(url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return null;
  const item=decodeURIComponent(url.pathname.slice(scope.pathname.length));
  return !item||item.endsWith('/')?item+'index.html':item;
}
async function matchesPublishedAsset(url,response){
  const asset=RUNTIME_ASSETS[publicationPath(url)];if(!asset||!response?.ok)return false;
  const bytes=await response.clone().arrayBuffer();
  const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(value=>value.toString(16).padStart(2,'0')).join('');
  return hash===asset.sha256;
}
function mutableV2(url){
  return /\.(?:mjs|css|json)$/.test(url.pathname)||url.pathname.includes('/v2/')||url.pathname.includes('/books/core-rules/reader/')||url.pathname.endsWith('/books/shared/offline-status.js');
}
const DATA_CACHE_NAME=CACHE_NAME+'-data';
async function fetchAndCache(request,cacheKey=request,event=null){
  const response=await fetch(request);
  if(response.ok){
    const url=new URL(request.url||request,self.location.href),mutable=mutableV2(url);
    // Never overwrite a prepared offline body with another publication's bytes.
    // Online responses remain network-first; the application checks its version
    // before using loaded payloads/factories. No JavaScript is intercepted/re-written.
    const compatible=!mutable||await matchesPublishedAsset(url,response);
    if(mutable&&url.pathname.endsWith('.json')&&!compatible){
      const client=event?.clientId&&await self.clients.get(event.clientId);
      client?.postMessage({type:'WH_PWA_DATA_CHANGED'});
      return new Response('Published data changed. Confirm an update before using it.',{status:409,headers:{'content-type':'text/plain'}});
    }
    if(compatible){
      try{await (await caches.open(url.pathname.endsWith('.json')?DATA_CACHE_NAME:CACHE_NAME)).put(cacheKey,response.clone());}
      catch(error){console.warn('Service Worker cache write failed',error);}
    }
  }
  return response;
}
async function compatibleOffline(request){
  const url=new URL(request.url),item=publicationPath(url),keys=await caches.keys();
  const names=[CACHE_NAME,DATA_CACHE_NAME,...keys.filter(name=>name.startsWith(CACHE_PREFIX)&&name!==CACHE_NAME&&name!==DATA_CACHE_NAME)];
  for(const name of names){
    if(!keys.includes(name))continue;
    const cache=await caches.open(name);
    const response=await cache.match(request)||await cache.match(new URL('./'+item,self.location.href).href);
    if(await matchesPublishedAsset(url,response))return response;
  }
  return new Response('A compatible offline copy is not available. Reconnect to update this content.',{status:503,headers:{'content-type':'text/plain'}});
}
async function legacyCached(request,options){
  // Retention must not make an older response outrank the current prepared copy.
  return (await (await caches.open(CACHE_NAME)).match(request,options))||caches.match(request,options);
}
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin)return;
  // Never serve a cached version oracle. Unique query values also bypass the
  // exact-request cache-first behavior of the previously published worker.
  if(url.pathname.endsWith('/glossary/generated/cache-revision.js')){
    event.respondWith(fetch(new Request(request,{cache:'no-store'})));return;
  }
  if(mutableV2(url)){
    event.respondWith(fetchAndCache(new Request(request,{cache:'no-store'}),request,event).catch(()=>compatibleOffline(request)));return;
  }
  if(request.mode==='navigate'){
    event.respondWith(fetchAndCache(request).catch(async()=>
      (await legacyCached(request))||(await legacyCached(request,{ignoreSearch:true}))||legacyCached(navigationFallback(url))));return;
  }
  event.respondWith(legacyCached(request).then(cached=>cached||fetchAndCache(request)));
});
