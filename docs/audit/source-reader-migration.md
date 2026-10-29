# Source reader migration inventory

Base: `75d322e4e3274f14d7e2a81abace3ba63c784ec5`. Every entry is computed from the current diff against this base; file paths and old/new line text are verified. No test suite or producer is run by this tool.

## Summary

`{"changedExistingCodeFiles":151,"byRole":{"BUILDER":67,"ORACLE_OR_SOURCE_GUARD":4,"RUNTIME_CONSUMER":40,"TEST_ORACLE_OR_SCENARIO":40},"oldSourceSites":196,"oldJSONBoundaries":167,"addedCommonAPISites":808,"withoutCommonAPIIdentifier":[]}`

## Existing code sites

| File | Purpose | Original source or JSON boundary | Common API and current line |
| --- | --- | --- | --- |
| books/adeptus-mechanicus/v2/app-build.mjs | BUILDER | BASE:16, BASE:105 | finalizeSourceOutput:1, parseProducerJSON:1, prepareSourceProducer:1, serializeSourceJSON:1, parseProducerJSON:17, prepareSourceProducer:52, prepareSourceProducer:69, prepareSourceProducer:74, prepareSourceProducer:92, finalizeSourceOutput:102, serializeSourceJSON:108 |
| books/adeptus-mechanicus/v2/app-fact-oracle.mjs | ORACLE_OR_SOURCE_GUARD | BASE:38, BASE:48 | sourceSnapshot:5, sourceSnapshot:39 |
| books/adeptus-mechanicus/v2/app-qa.mjs | TEST_ORACLE_OR_SCENARIO | BASE:179, BASE:182, BASE:184 | parseSourceFixtureJSON:1, compileBookSourceRefs:2, sourceDeclarationView:2, compileBookSourceRefs:160, sourceDeclarationView:163, compileBookSourceRefs:165, parseSourceFixtureJSON:189, parseSourceFixtureJSON:192, parseSourceFixtureJSON:194 |
| books/adeptus-mechanicus/v2/build.py | BUILDER | BASE:367 | serialized_source_outputs:16, serialized_source_outputs:370 |
| books/adeptus-mechanicus/v2/native-fnp-qa.mjs | TEST_ORACLE_OR_SCENARIO | BASE:33, BASE:34, BASE:35, BASE:36, BASE:86, BASE:15 | parseSourceFixtureJSON:1, sourceSnapshot:2, parseSourceFixtureJSON:17, sourceSnapshot:35, sourceSnapshot:36, parseSourceFixtureJSON:37, sourceSnapshot:37, sourceSnapshot:38, sourceSnapshot:88 |
| books/adeptus-mechanicus/v2/presentation-reference-build.mjs | BUILDER | No source-field/JSON-boundary expression removed | prepareSourceProducer:1, prepareSourceProducer:48 |
| books/adeptus-mechanicus/v2/roster-attachment-build.mjs | BUILDER | No source-field/JSON-boundary expression removed | prepareSourceProducer:1, prepareSourceProducer:14 |
| books/adeptus-mechanicus/v2/roster-build.mjs | BUILDER | BASE:40 | prepareSourceProducer:1, serializeSourceJSON:1, prepareSourceProducer:16, serializeSourceJSON:42 |
| books/adeptus-mechanicus/v2/roster-import-qa.mjs | TEST_ORACLE_OR_SCENARIO | BASE:22, BASE:23, BASE:24, BASE:27, BASE:6 | parseSourceFixtureJSON:1, sourceSnapshot:2, parseSourceFixtureJSON:8, sourceSnapshot:24, sourceSnapshot:25, sourceSnapshot:26, sourceSnapshot:29 |
| books/adeptus-mechanicus/v2/roster-import.mjs | RUNTIME_CONSUMER | BASE:18, BASE:20 | getRecordedSourceIdentity:2, getRecordedSourceIdentity:19, getRecordedSourceIdentity:21 |
| books/adeptus-mechanicus/v2/rule-contract-build.mjs | BUILDER | BASE:16, BASE:137 | parseProducerJSON:1, prepareSourceProducer:1, serializeSourceJSON:1, parseProducerJSON:17, prepareSourceProducer:73, serializeSourceJSON:139 |
| books/adeptus-mechanicus/v2/rule-contract-context.mjs | RUNTIME_CONSUMER | BASE:36 | getRecordedSourceIdentity:5, getRecordedSourceIdentity:37 |
| books/blood-angels/v2/app-build.mjs | BUILDER | BASE:9, BASE:46 | finalizeSourceOutput:1, parseProducerJSON:1, prepareSourceProducer:1, serializeSourceJSON:1, parseProducerJSON:10, prepareSourceProducer:18, finalizeSourceOutput:44, serializeSourceJSON:47 |
| books/blood-angels/v2/app-qa.mjs | TEST_ORACLE_OR_SCENARIO | BASE:26, BASE:9 | parseSourceFixtureJSON:1, sourceSnapshot:2, parseSourceFixtureJSON:11, sourceSnapshot:28 |
| books/blood-angels/v2/book-build.mjs | BUILDER | BASE:16, BASE:167 | parseProducerJSON:1, prepareSourceProducer:1, serializeSourceJSON:1, parseProducerJSON:17, prepareSourceProducer:23, prepareSourceProducer:24, prepareSourceProducer:25, prepareSourceProducer:105, serializeSourceJSON:171 |
| books/blood-angels/v2/build.py | BUILDER | BASE:457 | serialized_source_outputs:22, serialized_source_outputs:457 |
| books/blood-angels/v2/datasheet-build.mjs | BUILDER | BASE:11, BASE:112 | parseProducerJSON:1, prepareSourceProducer:1, serializeSourceJSON:1, parseProducerJSON:12, prepareSourceProducer:19, prepareSourceProducer:20, prepareSourceProducer:52, serializeSourceJSON:115 |
| books/blood-angels/v2/detachment-reference-build.mjs | BUILDER | No source-field/JSON-boundary expression removed | prepareSourceProducer:1, prepareSourceProducer:13 |
| books/blood-angels/v2/gameplay-presentation-build.mjs | BUILDER | BASE:54 | prepareSourceProducer:1, serializeSourceJSON:1, prepareSourceProducer:14, prepareSourceProducer:17, prepareSourceProducer:29, serializeSourceJSON:56 |
| books/blood-angels/v2/mfm-build.mjs | BUILDER | BASE:8, BASE:37 | parseProducerJSON:1, serializeSourceJSON:1, parseProducerJSON:9, serializeSourceJSON:38 |
| books/blood-angels/v2/roster-build.mjs | BUILDER | BASE:57, BASE:110 | parseProducerJSON:1, prepareSourceProducer:1, serializeSourceJSON:1, prepareSourceProducer:17, parseProducerJSON:59, serializeSourceJSON:112 |
| books/blood-angels/v2/roster-import.mjs | RUNTIME_CONSUMER | BASE:88, BASE:153 | copySourceEvidence:11, mergeSourceEvidence:11, sameSourceEvidence:11, sameSourceEvidence:45, copySourceEvidence:48, copySourceEvidence:49, mergeSourceEvidence:49, copySourceEvidence:162 |
| books/blood-angels/v2/roster-paid-option-bindings-build.mjs | BUILDER | BASE:6 | parseProducerJSON:1, prepareSourceProducer:1, parseProducerJSON:7, prepareSourceProducer:8 |
| books/blood-angels/v2/roster-paid-options.mjs | RUNTIME_CONSUMER | BASE:50, BASE:61 | copySourceEvidence:1, mergeSourceEvidence:1, sourceSnapshot:1, copySourceEvidence:51, sourceSnapshot:51, copySourceEvidence:62, mergeSourceEvidence:62 |
| books/blood-angels/v2/roster-qa.mjs | TEST_ORACLE_OR_SCENARIO | BASE:86, BASE:150, BASE:256, BASE:21 | parseSourceFixtureJSON:1, sourceSnapshot:2, parseSourceFixtureJSON:23, sourceSnapshot:88, sourceSnapshot:152, sourceSnapshot:258 |
| books/blood-angels/v2/roster-relations-build.mjs | BUILDER | BASE:9 | parseProducerJSON:1, prepareSourceProducer:1, parseProducerJSON:10, prepareSourceProducer:15 |
| books/blood-angels/v2/rule-contract-build.mjs | BUILDER | BASE:19, BASE:187 | parseProducerJSON:1, serializeSourceJSON:1, parseProducerJSON:20, serializeSourceJSON:188 |
| books/chaos-space-marines/v2/app-build.mjs | BUILDER | BASE:17, BASE:227 | finalizeSourceOutput:1, parseProducerJSON:1, prepareSourceProducer:1, serializeSourceJSON:1, parseProducerJSON:18, prepareSourceProducer:35, prepareSourceProducer:46, finalizeSourceOutput:224, serializeSourceJSON:229 |
| books/chaos-space-marines/v2/app-qa.mjs | TEST_ORACLE_OR_SCENARIO | BASE:8 | parseSourceFixtureJSON:1, parseSourceFixtureJSON:9 |
| books/chaos-space-marines/v2/build.py | BUILDER | BASE:434, BASE:438 | serialized_source_outputs:27, serialized_source_outputs:434 |
| books/chaos-space-marines/v2/critical-hit-threshold-qa.mjs | TEST_ORACLE_OR_SCENARIO | BASE:17, BASE:25, BASE:26 | parseSourceFixtureJSON:1, parseSourceFixtureJSON:18, parseSourceFixtureJSON:26, parseSourceFixtureJSON:27 |
| books/chaos-space-marines/v2/presentation-reference-build.mjs | BUILDER | BASE:7 | parseProducerJSON:1, prepareSourceProducer:1, parseProducerJSON:8, prepareSourceProducer:30 |
| books/chaos-space-marines/v2/roster-attachment-build.mjs | BUILDER | BASE:10 | cloneSourceBook:1, getRecordedSourceIdentity:1, sourceSnapshot:1, cloneSourceBook:7, getRecordedSourceIdentity:11, sourceSnapshot:11 |
| books/chaos-space-marines/v2/roster-effect-build.mjs | BUILDER | No source-field/JSON-boundary expression removed | prepareSourceProducer:1, prepareSourceProducer:26 |
| books/chaos-space-marines/v2/roster-import-build.mjs | BUILDER | BASE:6, BASE:25 | parseProducerJSON:1, prepareSourceProducer:1, serializeSourceJSON:1, parseProducerJSON:7, prepareSourceProducer:13, serializeSourceJSON:27 |
| books/chaos-space-marines/v2/roster-import-qa.mjs | TEST_ORACLE_OR_SCENARIO | BASE:29, BASE:140 | parseSourceFixtureJSON:1, parseSourceFixtureJSON:30, parseSourceFixtureJSON:141 |
| books/chaos-space-marines/v2/roster-imported-effect-fixtures.mjs | RUNTIME_CONSUMER | BASE:99 | sourceSnapshot:6, sourceSnapshot:100 |
| books/chaos-space-marines/v2/roster-presentation.mjs | RUNTIME_CONSUMER | BASE:21 | cloneSourceBook:1, copySourceEvidence:1, copySourceEvidence:22, cloneSourceBook:33 |
| books/chaos-space-marines/v2/roster-runtime-build.mjs | BUILDER | BASE:12, BASE:20 | parseProducerJSON:1, serializeSourceJSON:1, parseProducerJSON:13, serializeSourceJSON:21 |
| books/chaos-space-marines/v2/roster-runtime.mjs | RUNTIME_CONSUMER | No source-field/JSON-boundary expression removed | cloneSourceBook:9, cloneSourceBook:14 |
| books/chaos-space-marines/v2/rule-contract-build.mjs | BUILDER | BASE:16, BASE:140 | parseProducerJSON:1, prepareSourceProducer:1, serializeSourceJSON:1, parseProducerJSON:17, prepareSourceProducer:52, serializeSourceJSON:142 |
| books/dark-angels/v2/app-build.mjs | BUILDER | BASE:9, BASE:44 | finalizeSourceOutput:1, parseProducerJSON:1, prepareSourceProducer:1, serializeSourceJSON:1, parseProducerJSON:10, prepareSourceProducer:18, finalizeSourceOutput:42, serializeSourceJSON:45 |
| books/dark-angels/v2/app-qa.mjs | TEST_ORACLE_OR_SCENARIO | BASE:25, BASE:8 | parseSourceFixtureJSON:1, sourceSnapshot:2, parseSourceFixtureJSON:10, sourceSnapshot:27 |
| books/dark-angels/v2/book-build.mjs | BUILDER | BASE:16, BASE:166 | parseProducerJSON:1, prepareSourceProducer:1, serializeSourceJSON:1, parseProducerJSON:17, prepareSourceProducer:23, prepareSourceProducer:24, prepareSourceProducer:25, prepareSourceProducer:104, serializeSourceJSON:170 |
| books/dark-angels/v2/build.py | BUILDER | BASE:432 | serialized_source_outputs:22, serialized_source_outputs:432 |
| books/dark-angels/v2/chapter-bindings-build.mjs | BUILDER | BASE:5 | parseProducerJSON:1, prepareSourceProducer:1, parseProducerJSON:6 |
| books/dark-angels/v2/datasheet-build.mjs | BUILDER | BASE:11, BASE:112 | parseProducerJSON:1, prepareSourceProducer:1, serializeSourceJSON:1, parseProducerJSON:12, prepareSourceProducer:19, prepareSourceProducer:20, prepareSourceProducer:52, serializeSourceJSON:115 |
| books/dark-angels/v2/detachment-reference-build.mjs | BUILDER | No source-field/JSON-boundary expression removed | prepareSourceProducer:1, prepareSourceProducer:13 |
| books/dark-angels/v2/gameplay-presentation-build.mjs | BUILDER | BASE:54 | prepareSourceProducer:1, serializeSourceJSON:1, prepareSourceProducer:14, prepareSourceProducer:17, prepareSourceProducer:29, serializeSourceJSON:56 |
| books/dark-angels/v2/mfm-build.mjs | BUILDER | BASE:8, BASE:37 | parseProducerJSON:1, serializeSourceJSON:1, parseProducerJSON:9, serializeSourceJSON:38 |
| books/dark-angels/v2/physical-chapter.mjs | RUNTIME_CONSUMER | BASE:19, BASE:31, BASE:40, BASE:42 | copySourceEvidence:4, sameSourceEvidence:4, sameSourceEvidence:20, copySourceEvidence:32, copySourceEvidence:41, copySourceEvidence:43 |
| books/dark-angels/v2/roster-import-build.mjs | BUILDER | BASE:98 | prepareSourceProducer:1, serializeSourceJSON:1, prepareSourceProducer:17, serializeSourceJSON:100 |
| books/dark-angels/v2/roster-import-qa.mjs | TEST_ORACLE_OR_SCENARIO | BASE:62, BASE:14 | parseSourceFixtureJSON:1, sourceSnapshot:2, parseSourceFixtureJSON:16, sourceSnapshot:64 |
| books/dark-angels/v2/roster-import.mjs | RUNTIME_CONSUMER | BASE:88 | copySourceEvidence:11, mergeSourceEvidence:11, sameSourceEvidence:11, sameSourceEvidence:45, copySourceEvidence:48, copySourceEvidence:49, mergeSourceEvidence:49 |
| books/dark-angels/v2/roster-paid-option-bindings-build.mjs | BUILDER | BASE:10 | parseProducerJSON:1, prepareSourceProducer:1, parseProducerJSON:11, prepareSourceProducer:21 |
| books/dark-angels/v2/roster-paid-options.mjs | RUNTIME_CONSUMER | BASE:43, BASE:54 | copySourceEvidence:1, mergeSourceEvidence:1, sourceSnapshot:1, copySourceEvidence:44, sourceSnapshot:44, copySourceEvidence:55, mergeSourceEvidence:55 |
| books/dark-angels/v2/roster-relations-build.mjs | BUILDER | BASE:9 | parseProducerJSON:1, prepareSourceProducer:1, parseProducerJSON:10, prepareSourceProducer:16 |
| books/dark-angels/v2/rule-contract-build.mjs | BUILDER | BASE:18, BASE:169 | parseProducerJSON:1, serializeSourceJSON:1, parseProducerJSON:19, serializeSourceJSON:170 |
| books/death-guard/v2/app-build.mjs | BUILDER | BASE:16, BASE:25, BASE:26, BASE:36, BASE:46 | finalizeSourceOutput:1, parseProducerJSON:1, prepareSourceProducer:1, serializeSourceJSON:1, parseProducerJSON:17, parseProducerJSON:26, parseProducerJSON:27, prepareSourceProducer:31, prepareSourceProducer:32, parseProducerJSON:38, prepareSourceProducer:41, finalizeSourceOutput:43, serializeSourceJSON:48 |
| books/death-guard/v2/app-fact-oracle.mjs | ORACLE_OR_SOURCE_GUARD | No source-field/JSON-boundary expression removed | sourceDeclarationView:7, sourceDeclarationView:130, sourceDeclarationView:131 |
| books/death-guard/v2/app-qa.mjs | TEST_ORACLE_OR_SCENARIO | BASE:131 | parseSourceFixtureJSON:1, compileBookSourceRefs:2, sourceDeclarationView:2, compileBookSourceRefs:108, sourceDeclarationView:110, compileBookSourceRefs:114, parseSourceFixtureJSON:141 |
| books/death-guard/v2/build.mjs | BUILDER | BASE:15, BASE:73 | parseProducerJSON:1, serializeSourceJSON:1, parseProducerJSON:16, serializeSourceJSON:74 |
| books/death-guard/v2/critical-hit-qa.mjs | TEST_ORACLE_OR_SCENARIO | BASE:13 | parseSourceFixtureJSON:1, parseSourceFixtureJSON:14 |
| books/death-guard/v2/feasibility-build.mjs | BUILDER | BASE:10 | parseProducerJSON:1, prepareSourceProducer:1, prepareSourceProducer:11, parseProducerJSON:12 |
| books/death-guard/v2/glossary-build.mjs | BUILDER | BASE:7, BASE:18 | parseProducerJSON:1, prepareSourceProducer:1, serializeSourceJSON:1, parseProducerJSON:8, prepareSourceProducer:13, prepareSourceProducer:14, prepareSourceProducer:18, serializeSourceJSON:20 |
| books/death-guard/v2/related-rules-build.mjs | BUILDER | BASE:50, BASE:51 | parseProducerJSON:1, prepareSourceProducer:1, serializeSourceJSON:1, prepareSourceProducer:26, parseProducerJSON:52, serializeSourceJSON:53 |
| books/death-guard/v2/roster-contract-build.mjs | BUILDER | BASE:158, BASE:159 | parseProducerJSON:1, serializeSourceJSON:1, parseProducerJSON:159, serializeSourceJSON:160 |
| books/death-guard/v2/roster-import-bindings.mjs | RUNTIME_CONSUMER | BASE:18 | getRecordedSourceIdentity:1, getRecordedSourceIdentity:19 |
| books/death-guard/v2/roster-import-qa.mjs | TEST_ORACLE_OR_SCENARIO | BASE:10 | parseSourceFixtureJSON:1, parseSourceFixtureJSON:11 |
| books/death-guard/v2/rule-contract-build.mjs | BUILDER | BASE:74, BASE:19, BASE:96, BASE:110, BASE:156 | parseProducerJSON:1, serializeSourceJSON:1, getRecordedSourceIdentity:3, parseProducerJSON:21, getRecordedSourceIdentity:76, parseProducerJSON:98, parseProducerJSON:112, serializeSourceJSON:158 |
| books/emperors-children/v2/app-build.mjs | BUILDER | BASE:16, BASE:148 | finalizeSourceOutput:1, parseProducerJSON:1, prepareSourceProducer:1, serializeSourceJSON:1, parseProducerJSON:17, prepareSourceProducer:46, prepareSourceProducer:60, prepareSourceProducer:110, prepareSourceProducer:121, finalizeSourceOutput:146, serializeSourceJSON:150 |
| books/emperors-children/v2/app-qa.mjs | TEST_ORACLE_OR_SCENARIO | BASE:9 | parseSourceFixtureJSON:1, parseSourceFixtureJSON:10 |
| books/emperors-children/v2/build.py | BUILDER | BASE:359 | serialized_source_outputs:23, serialized_source_outputs:362 |
| books/emperors-children/v2/roster-attachment-bindings.mjs | RUNTIME_CONSUMER | BASE:13, BASE:32, BASE:33 | getRecordedSourceIdentity:4, sourceSnapshot:4, getRecordedSourceIdentity:14, sourceSnapshot:14, sourceSnapshot:33, sourceSnapshot:34 |
| books/emperors-children/v2/roster-attachment-build.mjs | BUILDER | BASE:20 | serializeSourceJSON:1, serializeSourceJSON:21 |
| books/emperors-children/v2/roster-import-build.mjs | BUILDER | BASE:7, BASE:16, BASE:24 | parseProducerJSON:1, prepareSourceProducer:1, serializeSourceJSON:1, parseProducerJSON:8, prepareSourceProducer:10, parseProducerJSON:18, serializeSourceJSON:26 |
| books/emperors-children/v2/roster-import-qa.mjs | TEST_ORACLE_OR_SCENARIO | BASE:49, BASE:192, BASE:252, BASE:253, BASE:256, BASE:14, BASE:15 | parseSourceFixtureJSON:1, sourceDeclarationView:2, sourceSnapshot:2, parseSourceFixtureJSON:16, parseSourceFixtureJSON:17, sourceSnapshot:51, sourceSnapshot:194, sourceDeclarationView:254, sourceSnapshot:254, sourceDeclarationView:255, sourceSnapshot:255, sourceSnapshot:258 |
| books/emperors-children/v2/roster-import.mjs | RUNTIME_CONSUMER | BASE:15 | getRecordedSourceIdentity:5, getRecordedSourceIdentity:16 |
| books/emperors-children/v2/rule-contract-build.mjs | BUILDER | BASE:24, BASE:224 | parseProducerJSON:1, prepareSourceProducer:1, serializeSourceJSON:1, parseProducerJSON:25, prepareSourceProducer:33, serializeSourceJSON:226 |
| books/shared/application-v2/browser-test-dependencies.mjs | TEST_ORACLE_OR_SCENARIO | No source-field/JSON-boundary expression removed | No common API identifier; inspect exact diff |
| books/shared/army-book-app-v2/book-v1-projection.mjs | RUNTIME_CONSUMER | BASE:36, BASE:37, BASE:69 | sourceSnapshot:5, sourceSnapshot:37, sourceSnapshot:38, sourceSnapshot:70 |
| books/shared/army-book-app-v2/book-v1.mjs | RUNTIME_CONSUMER | BASE:28 | sourceSnapshot:1, sourceSnapshot:29 |
| books/shared/army-book-app-v2/datasheet-v1.mjs | RUNTIME_CONSUMER | BASE:528, BASE:530, BASE:562, BASE:586 | sourceSnapshot:1, sourceSnapshot:529, sourceSnapshot:531, sourceSnapshot:563, sourceSnapshot:587 |
| books/shared/army-book-app-v2/glossary.mjs | RUNTIME_CONSUMER | BASE:47 | copySourceEvidence:1, copySourceEvidence:48 |
| books/shared/army-book-app-v2/navigation-v1.mjs | RUNTIME_CONSUMER | BASE:9 | getSourceContext:4, getSourceContext:10 |
| books/shared/army-book-app-v2/normal-datasheet-bindings.mjs | RUNTIME_CONSUMER | BASE:29, BASE:33 | copySourceEvidence:1, sourceSnapshot:1, copySourceEvidence:30, sourceSnapshot:34 |
| books/shared/army-book-app-v2/personal.mjs | RUNTIME_CONSUMER | BASE:25, BASE:39, BASE:119, BASE:200, BASE:236, BASE:511, BASE:513 | getRecordedSourceIdentity:2, sameSourceEvidence:2, sourceSnapshot:2, getRecordedSourceIdentity:26, sameSourceEvidence:40, sameSourceEvidence:120, sourceSnapshot:201, sourceSnapshot:234, sourceSnapshot:237, sameSourceEvidence:512, getRecordedSourceIdentity:514 |
| books/shared/army-book-app-v2/project.mjs | RUNTIME_CONSUMER | BASE:6 | No common API identifier; inspect exact diff |
| books/shared/army-book-app-v2/roster.mjs | RUNTIME_CONSUMER | BASE:473 | sourceSnapshot:2, sourceSnapshot:474 |
| books/shared/army-book-app-v2/runtime.mjs | RUNTIME_CONSUMER | No source-field/JSON-boundary expression removed | registerBookSources:2, registerBookSources:22 |
| books/shared/roster-v2/ability-effects-qa.mjs | TEST_ORACLE_OR_SCENARIO | BASE:65 | sourceSnapshot:1, sourceSnapshot:66 |
| books/shared/roster-v2/conditional-policy.mjs | RUNTIME_CONSUMER | BASE:32, BASE:47, BASE:69, BASE:82, BASE:135, BASE:153, BASE:159, BASE:242, BASE:256, BASE:263, BASE:268, BASE:291, BASE:311 | copySourceEvidence:6, getRecordedSourceIdentity:6, sameSourceEvidence:6, sourceDeclarationView:6, getRecordedSourceIdentity:33, getRecordedSourceIdentity:48, sourceDeclarationView:52, getRecordedSourceIdentity:70, getRecordedSourceIdentity:83, copySourceEvidence:154, copySourceEvidence:243, copySourceEvidence:257, copySourceEvidence:264, sameSourceEvidence:269, sameSourceEvidence:292, copySourceEvidence:312 |
| books/shared/roster-v2/context.mjs | RUNTIME_CONSUMER | BASE:124 | getRecordedSourceIdentity:2, registerBookSources:2, registerBookSources:44, getRecordedSourceIdentity:126 |
| books/shared/roster-v2/effective-instance.mjs | RUNTIME_CONSUMER | BASE:19, BASE:21, BASE:24, BASE:40, BASE:42, BASE:47, BASE:60, BASE:126 | copySourceEvidence:1, getSourceContext:1, mergeSourceEvidence:1, getSourceContext:20, getSourceContext:22, copySourceEvidence:25, mergeSourceEvidence:25, getSourceContext:41, getSourceContext:43, copySourceEvidence:48, mergeSourceEvidence:48, copySourceEvidence:61, copySourceEvidence:127 |
| books/shared/roster-v2/effects.mjs | RUNTIME_CONSUMER | BASE:231, BASE:248 | copySourceEvidence:6, getRecordedSourceIdentity:6, getRecordedSourceIdentity:232, copySourceEvidence:249 |
| books/shared/roster-v2/import-service.mjs | RUNTIME_CONSUMER | BASE:17 | cloneSourceBook:4, getRecordedSourceIdentity:4, registerBookSources:4, cloneSourceBook:13, registerBookSources:14, getRecordedSourceIdentity:19, registerBookSources:75 |
| books/shared/roster-v2/keyword-effects-qa.mjs | TEST_ORACLE_OR_SCENARIO | BASE:61, BASE:95, BASE:96 | sourceSnapshot:1, sourceSnapshot:62, sourceSnapshot:96, sourceSnapshot:97 |
| books/shared/roster-v2/numeric-effects-qa.mjs | TEST_ORACLE_OR_SCENARIO | BASE:57, BASE:73 | sourceSnapshot:1, sourceSnapshot:58, sourceSnapshot:74 |
| books/shared/roster-v2/runtime.mjs | RUNTIME_CONSUMER | No source-field/JSON-boundary expression removed | cloneSourceBook:7, registerBookSources:7, cloneSourceBook:35, registerBookSources:36 |
| books/shared/roster-v2/source-completeness.mjs | ORACLE_OR_SOURCE_GUARD | No source-field/JSON-boundary expression removed | sourceDeclarationView:9, sourceDeclarationView:22, sourceDeclarationView:37, sourceDeclarationView:114 |
| books/shared/roster-v2/source-effect-expectations-qa.mjs | TEST_ORACLE_OR_SCENARIO | BASE:13 | sourceSnapshot:1, sourceSnapshot:14 |
| books/shared/roster-v2/weapon-contribution-effects-qa.mjs | TEST_ORACLE_OR_SCENARIO | BASE:41 | sourceSnapshot:1, sourceSnapshot:42 |
| books/shared/rule-contract-v2/bindings.mjs | RUNTIME_CONSUMER | BASE:138, BASE:139, BASE:150 | getRecordedSourceIdentity:3, getRecordedSourceIdentity:139, getRecordedSourceIdentity:140, getRecordedSourceIdentity:151 |
| books/shared/rule-contract-v2/finalize-recipients.mjs | RUNTIME_CONSUMER | No source-field/JSON-boundary expression removed | compileBookSourceRefs:4, registerBookSources:4, sourceDeclarationView:4, compileBookSourceRefs:10, sourceDeclarationView:10, registerBookSources:26 |
| books/shared/rule-contract-v2/recipients-qa.mjs | TEST_ORACLE_OR_SCENARIO | No source-field/JSON-boundary expression removed | sourceDeclarationView:9, sourceDeclarationView:22, sourceDeclarationView:57 |
| books/shared/rule-contract-v2/recipients.mjs | RUNTIME_CONSUMER | No source-field/JSON-boundary expression removed | sourceDeclarationView:5, sourceDeclarationView:315 |
| books/shared/rule-contract-v2/schema.mjs | RUNTIME_CONSUMER | BASE:97 | getRecordedSourceIdentity:5, getRecordedSourceIdentity:98 |
| books/space-marines/v2/app-build.mjs | BUILDER | BASE:11, BASE:49 | finalizeSourceOutput:1, parseProducerJSON:1, prepareSourceProducer:1, serializeSourceJSON:1, parseProducerJSON:12, prepareSourceProducer:22, finalizeSourceOutput:46, serializeSourceJSON:50 |
| books/space-marines/v2/app-qa.mjs | TEST_ORACLE_OR_SCENARIO | BASE:32, BASE:48, BASE:77, BASE:9 | parseSourceFixtureJSON:1, sourceFixture:1, sourceDeclarationView:2, sourceSnapshot:2, parseSourceFixtureJSON:11, sourceDeclarationView:14, sourceDeclarationView:25, sourceSnapshot:38, sourceSnapshot:54, sourceFixture:71, sourceSnapshot:88 |
| books/space-marines/v2/book-build.mjs | BUILDER | BASE:12, BASE:134 | parseProducerJSON:1, prepareSourceProducer:1, serializeSourceJSON:1, parseProducerJSON:13, prepareSourceProducer:54, prepareSourceProducer:91, prepareSourceProducer:92, prepareSourceProducer:93, serializeSourceJSON:138 |
| books/space-marines/v2/build.py | BUILDER | BASE:445 | serialized_source_outputs:22, serialized_source_outputs:445 |
| books/space-marines/v2/datasheet-build.mjs | BUILDER | BASE:12, BASE:121 | parseProducerJSON:1, prepareSourceProducer:1, serializeSourceJSON:1, parseProducerJSON:13, prepareSourceProducer:28, prepareSourceProducer:29, prepareSourceProducer:61, serializeSourceJSON:124 |
| books/space-marines/v2/detachment-reference-build.mjs | BUILDER | No source-field/JSON-boundary expression removed | prepareSourceProducer:1, prepareSourceProducer:13 |
| books/space-marines/v2/gameplay-presentation-build.mjs | BUILDER | BASE:59 | prepareSourceProducer:1, serializeSourceJSON:1, prepareSourceProducer:24, prepareSourceProducer:26, serializeSourceJSON:61 |
| books/space-marines/v2/mfm-build.mjs | BUILDER | BASE:71 | prepareSourceProducer:1, serializeSourceJSON:1, prepareSourceProducer:33, prepareSourceProducer:42, serializeSourceJSON:72 |
| books/space-marines/v2/roster-import-build.mjs | BUILDER | BASE:147 | prepareSourceProducer:1, serializeSourceJSON:1, prepareSourceProducer:21, serializeSourceJSON:149 |
| books/space-marines/v2/roster-import-qa.mjs | TEST_ORACLE_OR_SCENARIO | BASE:14 | parseSourceFixtureJSON:1, parseSourceFixtureJSON:15 |
| books/space-marines/v2/roster-import.mjs | RUNTIME_CONSUMER | BASE:85 | copySourceEvidence:11, mergeSourceEvidence:11, sameSourceEvidence:11, sameSourceEvidence:45, copySourceEvidence:48, copySourceEvidence:49, mergeSourceEvidence:49 |
| books/space-marines/v2/roster-paid-option-bindings-build.mjs | BUILDER | BASE:11, BASE:55 | parseProducerJSON:1, prepareSourceProducer:1, parseProducerJSON:12, prepareSourceProducer:50, parseProducerJSON:57 |
| books/space-marines/v2/roster-paid-options.mjs | RUNTIME_CONSUMER | BASE:43, BASE:54 | copySourceEvidence:1, mergeSourceEvidence:1, sourceSnapshot:1, copySourceEvidence:44, sourceSnapshot:44, copySourceEvidence:55, mergeSourceEvidence:55 |
| books/space-marines/v2/roster-source-review.mjs | ORACLE_OR_SOURCE_GUARD | BASE:36, BASE:79, BASE:92, BASE:107 | sourceSnapshot:1, sourceSnapshot:37, sourceSnapshot:80, sourceSnapshot:93, sourceSnapshot:108 |
| books/space-marines/v2/roster-static-model-bindings.mjs | RUNTIME_CONSUMER | BASE:34, BASE:69, BASE:70 | copySourceEvidence:8, sameSourceEvidence:8, sourceSnapshot:8, sameSourceEvidence:35, copySourceEvidence:70, sourceSnapshot:71 |
| books/space-marines/v2/rule-contract-build.mjs | BUILDER | BASE:19, BASE:173 | parseProducerJSON:1, prepareSourceProducer:1, serializeSourceJSON:1, parseProducerJSON:20, prepareSourceProducer:29, prepareSourceProducer:30, prepareSourceProducer:31, serializeSourceJSON:177 |
| books/tau-empire/v2/app-build.mjs | BUILDER | BASE:13, BASE:92, BASE:97 | finalizeSourceOutput:1, parseProducerJSON:1, prepareSourceProducer:1, serializeSourceJSON:1, parseProducerJSON:14, prepareSourceProducer:51, prepareSourceProducer:64, prepareSourceProducer:78, prepareSourceProducer:87, finalizeSourceOutput:94, serializeSourceJSON:99 |
| books/tau-empire/v2/app-qa.mjs | TEST_ORACLE_OR_SCENARIO | BASE:26, BASE:27, BASE:10 | parseSourceFixtureJSON:1, sourceSnapshot:2, parseSourceFixtureJSON:12, sourceSnapshot:28, sourceSnapshot:29 |
| books/tau-empire/v2/build.py | BUILDER | BASE:343, BASE:347 | serialized_source_outputs:25, serialized_source_outputs:342 |
| books/tau-empire/v2/roster-import-build.mjs | BUILDER | BASE:15, BASE:26, BASE:150 | parseProducerJSON:1, serializeSourceJSON:1, parseProducerJSON:16, parseProducerJSON:27, serializeSourceJSON:151 |
| books/tau-empire/v2/roster-import-qa.mjs | TEST_ORACLE_OR_SCENARIO | BASE:83, BASE:87, BASE:197, BASE:198, BASE:199, BASE:207, BASE:280, BASE:283, BASE:285, BASE:287, BASE:355, BASE:367, BASE:401, BASE:432, BASE:664, BASE:708, BASE:710, BASE:711, BASE:907, BASE:984, BASE:991, BASE:20 | parseSourceFixtureJSON:1, sourceFixture:1, sourceSnapshot:2, parseSourceFixtureJSON:22, sourceSnapshot:85, sourceSnapshot:89, sourceSnapshot:199, sourceSnapshot:200, sourceSnapshot:201, sourceSnapshot:209, sourceSnapshot:282, sourceSnapshot:285, sourceSnapshot:287, sourceSnapshot:289, sourceSnapshot:357, sourceFixture:369, sourceSnapshot:403, sourceSnapshot:434, sourceSnapshot:666, sourceSnapshot:710, sourceSnapshot:712, sourceSnapshot:713, sourceFixture:909, sourceSnapshot:986, sourceFixture:993 |
| books/tau-empire/v2/roster-import.mjs | RUNTIME_CONSUMER | BASE:87 | copySourceEvidence:9, mergeSourceEvidence:9, sameSourceEvidence:9, sameSourceEvidence:41, copySourceEvidence:44, copySourceEvidence:45, mergeSourceEvidence:45 |
| books/tau-empire/v2/roster-source-choices.mjs | RUNTIME_CONSUMER | BASE:28, BASE:31, BASE:35, BASE:66, BASE:90, BASE:121, BASE:152, BASE:172, BASE:173, BASE:174, BASE:209, BASE:210 | copySourceEvidence:9, getRecordedSourceIdentity:9, sameSourceEvidence:9, sourceSnapshot:9, getRecordedSourceIdentity:29, getRecordedSourceIdentity:32, copySourceEvidence:36, sameSourceEvidence:67, sameSourceEvidence:91, copySourceEvidence:122, sameSourceEvidence:153, copySourceEvidence:173, sourceSnapshot:174, sourceSnapshot:175, copySourceEvidence:210, sourceSnapshot:211 |
| books/tau-empire/v2/roster-weapon-choices.mjs | RUNTIME_CONSUMER | BASE:22, BASE:26, BASE:59, BASE:63, BASE:102, BASE:126 | copySourceEvidence:8, getRecordedSourceIdentity:8, sameSourceEvidence:8, sourceSnapshot:8, getRecordedSourceIdentity:23, copySourceEvidence:27, sameSourceEvidence:60, sameSourceEvidence:64, copySourceEvidence:103, copySourceEvidence:127, sourceSnapshot:127 |
| books/tau-empire/v2/rule-contract-build.mjs | BUILDER | BASE:15, BASE:212 | parseProducerJSON:1, prepareSourceProducer:1, serializeSourceJSON:1, parseProducerJSON:16, prepareSourceProducer:22, serializeSourceJSON:214 |
| books/tyranids/v2/app-build.mjs | BUILDER | BASE:15, BASE:165 | finalizeSourceOutput:1, parseProducerJSON:1, prepareSourceProducer:1, serializeSourceJSON:1, parseProducerJSON:16, prepareSourceProducer:47, prepareSourceProducer:64, prepareSourceProducer:136, prepareSourceProducer:147, finalizeSourceOutput:160, serializeSourceJSON:167 |
| books/tyranids/v2/app-qa.mjs | TEST_ORACLE_OR_SCENARIO | BASE:24, BASE:9 | parseSourceFixtureJSON:1, sourceSnapshot:2, parseSourceFixtureJSON:11, sourceSnapshot:26 |
| books/tyranids/v2/build.py | BUILDER | BASE:426, BASE:429 | serialized_source_outputs:23, serialized_source_outputs:427 |
| books/tyranids/v2/roster-import-build.mjs | BUILDER | BASE:8, BASE:20, BASE:127 | parseProducerJSON:1, prepareSourceProducer:1, serializeSourceJSON:1, parseProducerJSON:9, prepareSourceProducer:16, parseProducerJSON:22, serializeSourceJSON:129 |
| books/tyranids/v2/roster-import-qa.mjs | TEST_ORACLE_OR_SCENARIO | BASE:254, BASE:10 | parseSourceFixtureJSON:1, parseSourceFixtureJSON:11, sourceSnapshot:255 |
| books/tyranids/v2/roster-source-choices.mjs | RUNTIME_CONSUMER | BASE:17, BASE:22, BASE:32, BASE:50, BASE:72 | copySourceEvidence:4, getRecordedSourceIdentity:4, sameSourceEvidence:4, getRecordedSourceIdentity:18, copySourceEvidence:23, sameSourceEvidence:33, sameSourceEvidence:51, copySourceEvidence:73 |
| books/tyranids/v2/roster-ui-qa.mjs | TEST_ORACLE_OR_SCENARIO | BASE:94, BASE:112, BASE:146, BASE:59, BASE:76 | parseSourceFixtureJSON:1, sourceFixture:1, sourceSnapshot:2, parseSourceFixtureJSON:61, parseSourceFixtureJSON:78, sourceSnapshot:96, sourceSnapshot:114, sourceFixture:148 |
| books/tyranids/v2/rule-contract-build.mjs | BUILDER | BASE:17, BASE:173, BASE:181 | parseProducerJSON:1, prepareSourceProducer:1, serializeSourceJSON:1, parseProducerJSON:18, prepareSourceProducer:22, prepareSourceProducer:175, serializeSourceJSON:183 |
| books/tyranids/v2/seven-effects-qa.mjs | TEST_ORACLE_OR_SCENARIO | BASE:34, BASE:35, BASE:36, BASE:37, BASE:48, BASE:49, BASE:17 | parseSourceFixtureJSON:1, sourceSnapshot:2, parseSourceFixtureJSON:19, sourceSnapshot:36, sourceSnapshot:37, sourceSnapshot:38, sourceSnapshot:39, sourceSnapshot:50, sourceSnapshot:51 |
| v2/aggregate-physical-inventory-qa.mjs | TEST_ORACLE_OR_SCENARIO | BASE:18 | parseSourceFixtureJSON:1, parseSourceFixtureJSON:19 |
| v2/card-recipient-browser-qa.mjs | TEST_ORACLE_OR_SCENARIO | BASE:137, BASE:18, BASE:194, BASE:326 | parseSourceFixtureJSON:1, sourceSnapshot:2, parseSourceFixtureJSON:25, parseSourceFixtureJSON:31, sourceSnapshot:151, parseSourceFixtureJSON:208, parseSourceFixtureJSON:340 |
| v2/card-recipient-qa.mjs | TEST_ORACLE_OR_SCENARIO | BASE:15 | parseSourceFixtureJSON:1, parseSourceFixtureJSON:16 |
| v2/charge-effects-qa.mjs | TEST_ORACLE_OR_SCENARIO | BASE:45, BASE:17 | parseSourceFixtureJSON:1, sourceDeclarationView:2, sourceSnapshot:2, parseSourceFixtureJSON:19, sourceDeclarationView:35, sourceSnapshot:47 |
| v2/detachment-recipient-qa.mjs | TEST_ORACLE_OR_SCENARIO | BASE:67, BASE:141, BASE:187, BASE:263, BASE:270, BASE:281, BASE:25 | parseSourceFixtureJSON:1, sourceFixture:1, sourceSnapshot:2, parseSourceFixtureJSON:27, sourceSnapshot:69, sourceSnapshot:143, sourceFixture:189, sourceFixture:265, sourceFixture:272, sourceSnapshot:283 |
| v2/detachment-source-binding-qa.mjs | TEST_ORACLE_OR_SCENARIO | BASE:94, BASE:96, BASE:131, BASE:139, BASE:155, BASE:156, BASE:157, BASE:159, BASE:183, BASE:31 | parseSourceFixtureJSON:1, sourceFixture:1, sourceSnapshot:2, parseSourceFixtureJSON:33, sourceSnapshot:96, sourceSnapshot:98, sourceSnapshot:133, sourceFixture:141, sourceFixture:157, sourceSnapshot:157, sourceFixture:158, sourceFixture:159, sourceFixture:161, sourceFixture:185 |
| v2/detachment-synthetic-table-browser-qa.mjs | TEST_ORACLE_OR_SCENARIO | BASE:36, BASE:45 | parseSourceFixtureJSON:1, parseSourceFixtureJSON:37, parseSourceFixtureJSON:46 |
| v2/native-reference-presentation-qa.mjs | TEST_ORACLE_OR_SCENARIO | BASE:55, BASE:56, BASE:59, BASE:61, BASE:196, BASE:13 | parseSourceFixtureJSON:1, sourceFixture:1, sourceSnapshot:2, parseSourceFixtureJSON:15, sourceSnapshot:57, sourceSnapshot:58, sourceSnapshot:61, sourceSnapshot:63, sourceFixture:198 |
| v2/shell-browser-qa.mjs | TEST_ORACLE_OR_SCENARIO | No source-field/JSON-boundary expression removed | No common API identifier; inspect exact diff |
| v2/source-effect-regression-qa.mjs | TEST_ORACLE_OR_SCENARIO | BASE:17 | parseSourceFixtureJSON:1, parseSourceFixtureJSON:18 |

The companion JSON contains each old expression, exact new common API expression, verified base/current line numbers, whole-file hashes, full-diff SHA-256 and added assertions. These are static code observations, not execution results.

## Reading the adaptations

- Old source sites include reads, source declarations and assertions; the exact removed code is shown rather than assigning gameplay semantics from identifier names.
- Builder input boundaries use prepareSourceProducer/parseProducerJSON to obtain an explicit inverse scratch view. Final output boundaries use finalizeSourceOutput/serializeSourceJSON or the shared Python bridge. This does not make generated files factual owners.
- Test fixture readers register normalized data; sourceFixture/sourceSnapshot/sourceDeclarationView provide explicit original declarations for established independent oracle assertions and mutation fixtures. Oracle envelopes and expected rejection messages remain reviewable in the exact diffs.
- Runtime sites use the common source identity/evidence reader or copy normalized bindings. Stratagem compatibility reading remains supported by the common adapter; stratagem source records are not migrated.
- Static API presence is not proof of reachability, unchanged behavior, or successful QA. Actual oracle negative controls and browser text parity are separate execution attestations.

## Oracle execution evidence

`{"schema":"source-oracle-negative-proof/v1","status":"PASS","oracles":[{"path":"books/adeptus-mechanicus/v2/app-fact-oracle.mjs","positive":"PASS","facts":3148},{"path":"books/death-guard/v2/app-fact-oracle.mjs","positive":"PASS","facts":3658},{"path":"books/space-marines/v2/roster-source-review.mjs","positive":"PASS"},{"path":"books/shared/roster-v2/source-completeness.mjs","positive":"PROVEN","semanticStatus":"PARTIAL"}],"controls":[{"oracle":"AM application oracle","mutation":"missing sourceId","status":"REJECTED"},{"oracle":"AM application oracle","mutation":"missing sourcePath","status":"REJECTED"},{"oracle":"DG application oracle","mutation":"missing qualification source proof","status":"REJECTED"},{"oracle":"SM physical source review","mutation":"changed sha256","status":"REJECTED"},{"oracle":"SM physical source review","mutation":"changed pointer","status":"REJECTED"},{"oracle":"Independent source completeness","mutation":"changed sourceId","status":"REJECTED"},{"oracle":"Independent source completeness","mutation":"changed sha256","status":"REJECTED"}]}`

Execution evidence is attached only after the native QA/oracle negative controls complete. A saved attestation is reused by `--check`; this tool does not rerun its command.

## Limits

- Role labels follow explicit file purpose (oracle/guard, QA/scenario, builder, remaining runtime consumer); they do not certify a whole file is limited to one execution path.
- The changed-source detector uses service field identifiers and JSON boundary syntax only. Exact diff hashes and line text permit independent review; it does not infer rules from English text.
- Files added by this migration are intentionally outside the existing-reader count. Regeneration after any further existing-code edit updates the inventory deterministically.

Regenerate with `node tools/audit/source-reader-migration.mjs --write`; verify exact bytes with `--check`. Optional `--oracle-proof FILE` attaches stable execution evidence.
