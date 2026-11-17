# FORENSIC AND VERIFICATION POLICY

Existing code, tests, historical behavior, and green CI are not ground truth. Derive expected behavior independently from authoritative API/protocol/platform contracts and observed evidence.

## Investigation
Preserve exact reproduction conditions and raw logs/artifacts. Identify input, environment, version, timestamp, and failing operation. Trace the executed path through parsing, validation, branching, async callbacks, permissions, external calls, persistence, and result. Separate observations from hypotheses; test hypotheses; fix root cause; preserve an independently expected regression case.

## Test-oracle review
Classify tests as Valid, Insufficient, Invalid oracle, Duplicate, or Environment-dependent. A test is not sufficient merely because it copies implementation logic, checks invocation/non-null, omits failure/boundary paths, or mocks away the contract.

## Evidence levels
Report separately: source inspection; unit tests; integration/contract tests; build/package; CI; artifact upload and independently verified download/integrity; emulator; physical device/real OS behavior; real network/external-service/production runtime. Lower-level success never proves higher-level behavior. Never present mocks as device or production proof.

For security, auth, privacy, file I/O, persistence, lifecycle, and external integrations, inspect success and failure paths where possible and label unavailable real-world checks.
