# Inference API fixtures

## Provenance — read this before trusting these files

**These fixtures are hand-constructed from the response schema in
`pkg/inferencecost/apitypes.go` on the `feat/gpu-inference-efficiency` branch of the `opencost` repo. They were
NOT captured from a live cluster.**

That is a real limitation and it matters for one specific purpose. The house convention in `kubecost-frontend`
is to pin verbatim captured payloads (see `apps/cost-analyzer/.../LiveShape.spec.ts`, whose fixtures carry
comments like "Verbatim from GET /model/kubernetes/nodes/resources?window=3h"). The reason is that a captured
payload detects backend schema drift, while a hand-written one only reflects what the author believed the
schema to be. A hand-written fixture cannot catch a field the backend renamed.

So these are adequate for driving UI development and for pinning UI behaviour, and inadequate as a
schema-drift detector. **Replace each one with a real capture as soon as a cluster with vLLM workloads is
available**, keeping the same filenames so no test changes, and record the exact request here.

Capture command shape, for whoever does it:

```
BASE=http://localhost:9003
curl -s "$BASE/inferenceCost/total?window=7d&aggregate=model_name" \
  | jq . > inferenceCost-total-model.json
```

## The fixtures

| File | Request it represents | What it is for |
| --- | --- | --- |
| `inferenceCost-total-model.json` | `GET /inferenceCost/total?window=7d&aggregate=model_name&costBasis=allocation` | The default page load. Three models spanning the capacity bands, with all derived fields present. |
| `inferenceCost-total-engine.json` | `GET /inferenceCost/total?window=7d&granularity=engine&filter=model_name:"meta-llama/Llama-3-8B"` | Replica drill-down. Two replicas of one model, one saturated and one idle, plus a data-parallel replica with two engines where only the lowest engine index carries cost. |
| `inferenceCost-timeseries-day.json` | `GET /inferenceCost/timeseries?window=7d&accumulate=day&aggregate=model_name` | The consumed/idle cost chart. Includes one step with zero entries, which must render as a gap and not as zero. |
| `inferenceCost-degraded.json` | `GET /inferenceCost/total?window=7d&aggregate=model_name` on a cluster with mixed telemetry | **The most important fixture in the set.** One row of every `measurementAvailability` value, plus an aggregate row with a non-zero `excludedMemberCount`. This is what stops a regression where a healthy embedding deployment renders as 100% waste. |
| `inferenceCost-400.json` | `GET /inferenceCost/total?window=7d&aggregate=bogus_dimension` | The 400 body, for the message-passthrough path. |

## Invariants these fixtures deliberately encode

Any replacement capture must preserve these, or the tests that depend on them lose their point:

- At least one row where `capacityConsumption` is absent while `totalCost` is present. Absent must not be
  representable as zero.
- At least one row where `hostGpuDutyCycle.average` is above 0.9 while `capacityConsumption` is below 0.2,
  carrying `divergenceIndicator`. This is the field-measured pathology the whole feature is built around.
- At least one `bindingConstraint: "batch_slots"` row whose `kvCacheUtilization` is low, so a reader can see
  that low KV utilization does not mean idle.
- At least one row with `batchCeilingConfidence: "unknown"` and no `batchOccupancy`.
- At least one row with `measurementAvailability: "no_decode_loop"` and non-zero `totalCost`.
