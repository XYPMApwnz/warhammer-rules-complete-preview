/** Shared ESM facade; CommonJS QA uses the same ownership/cleanup engine. */
export {QA_TEMP_MARKER,QA_TEMP_SCHEMA,QA_TEMP_PROJECT,getQaTmpRoot,configureQaTempEnvironment,
  qaTempEnvironment,createQaTempDir,createQaEvidenceDir,cleanupQaTempDir,assertQaTempPath,cleanupQaRunTemps,
  sweepQaTempDirs,registerQaCleanup,armQaExitCleanup} from './qa-temp.cjs';
