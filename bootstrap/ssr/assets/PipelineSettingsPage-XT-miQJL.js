import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { useForm, Head } from "@inertiajs/react";
import { P as PlatformLayout } from "./PlatformLayout-BejqQ2vO.js";
import { ShieldCheck, AlertTriangle, RefreshCcw, Zap, Database, Info } from "lucide-react";
function PipelineSettingsPage({ auth, settings }) {
  const { data, setData, post, processing, errors } = useForm({
    ingestion_mode: settings.ingestion_mode || "direct",
    kafka_brokers: settings.kafka_brokers || "localhost:9092",
    kafka_topic: settings.kafka_topic || "tracking-events",
    kafka_client_id: settings.kafka_client_id || "sgtm-sidecar-producer"
  });
  const [status, setStatus] = useState(null);
  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("platform.settings.update"), {
      onSuccess: () => setStatus({ type: "success", message: "Pipeline configuration updated successfully." }),
      onError: () => setStatus({ type: "error", message: "Failed to update pipeline configuration." })
    });
  };
  const testKafka = () => {
    post(route("platform.settings.test"), {
      data: { type: "kafka", brokers: data.kafka_brokers },
      onSuccess: (resp) => setStatus({ type: "success", message: "Kafka configuration saved and marked for validation." })
    });
  };
  return /* @__PURE__ */ jsxs(PlatformLayout, { user: auth.user, children: [
    /* @__PURE__ */ jsx(Head, { title: "Event Pipeline Settings" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto py-8 px-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-white mb-2", children: "Event Ingestion Pipeline" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-400", children: "Configure how tracking events are ingested from the edge to your analytical storage." })
      ] }),
      status && /* @__PURE__ */ jsxs("div", { className: `mb-6 p-4 rounded-xl border ${status.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"} flex items-center gap-3`, children: [
        status.type === "success" ? /* @__PURE__ */ jsx(ShieldCheck, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5" }),
        status.message
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-[#1a1a1a] border border-white/5 rounded-2xl overflow-hidden", children: [
          /* @__PURE__ */ jsx("div", { className: "p-6 border-b border-white/5 bg-white/[0.02]", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "p-2 bg-indigo-500/10 rounded-lg", children: /* @__PURE__ */ jsx(RefreshCcw, { className: "h-6 w-6 text-indigo-400" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-white", children: "Ingestion Strategy" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-400 mt-1", children: "Choose between low-latency direct insertion or high-availability buffered streams." })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "p-6 grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => setData("ingestion_mode", "direct"),
                className: `relative p-5 rounded-xl border-2 text-left transition-all ${data.ingestion_mode === "direct" ? "border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500/20" : "border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.03]"}`,
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                    /* @__PURE__ */ jsx("div", { className: "p-2 bg-emerald-500/10 rounded-lg", children: /* @__PURE__ */ jsx(Zap, { className: "h-5 w-5 text-emerald-400" }) }),
                    data.ingestion_mode === "direct" && /* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" })
                  ] }),
                  /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-white", children: "Direct Mode (Lite)" }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-400 mt-1", children: "Sidecar pushes events directly to ClickHouse. Optimal for simple setups and low-to-medium scale." })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => setData("ingestion_mode", "kafka"),
                className: `relative p-5 rounded-xl border-2 text-left transition-all ${data.ingestion_mode === "kafka" ? "border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500/20" : "border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.03]"}`,
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                    /* @__PURE__ */ jsx("div", { className: "p-2 bg-amber-500/10 rounded-lg", children: /* @__PURE__ */ jsx(Database, { className: "h-5 w-5 text-amber-400" }) }),
                    data.ingestion_mode === "kafka" && /* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" })
                  ] }),
                  /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-white", children: "Kafka Stream (Enterprise)" }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-400 mt-1", children: "Buffered ingestion via Apache Kafka. Fault-tolerant, highly scalable, and prevents data loss during DB downtime." })
                ]
              }
            )
          ] })
        ] }),
        data.ingestion_mode === "kafka" && /* @__PURE__ */ jsxs("div", { className: "bg-[#1a1a1a] border border-white/5 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300", children: [
          /* @__PURE__ */ jsxs("div", { className: "p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "p-2 bg-amber-500/10 rounded-lg", children: /* @__PURE__ */ jsx(Database, { className: "h-6 w-6 text-amber-400" }) }),
              /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-white", children: "Kafka Broker Config" })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: testKafka,
                className: "px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all text-sm font-medium border border-white/10",
                children: "Verify Connectivity"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-400 mb-2", children: "Bootstrap Brokers" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: data.kafka_brokers,
                    onChange: (e) => setData("kafka_brokers", e.target.value),
                    placeholder: "localhost:9092,host2:9092",
                    className: "w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono text-sm"
                  }
                ),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 mt-2 flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Info, { className: "h-3 w-3" }),
                  "Comma-separated list of broker endpoints."
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-400 mb-2", children: "Destination Topic" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: data.kafka_topic,
                    onChange: (e) => setData("kafka_topic", e.target.value),
                    placeholder: "tracking-events",
                    className: "w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono text-sm"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex gap-3 items-start", children: [
              /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" }),
              /* @__PURE__ */ jsxs("div", { className: "text-sm text-amber-200/80", children: [
                /* @__PURE__ */ jsx("p", { className: "font-semibold text-amber-400 mb-1", children: "Architecture requirements:" }),
                /* @__PURE__ */ jsxs("ul", { className: "list-disc list-inside space-y-1 opacity-80", children: [
                  /* @__PURE__ */ jsx("li", { children: "Ensure the Kafka theme is reachable from your Tracking Nodes." }),
                  /* @__PURE__ */ jsxs("li", { children: [
                    "You must run the ",
                    /* @__PURE__ */ jsx("code", { className: "bg-black/40 px-1 rounded", children: "php artisan tracking:kafka-consume" }),
                    " worker to drain the topic into ClickHouse."
                  ] }),
                  /* @__PURE__ */ jsxs("li", { children: [
                    'Enable "Auto-create topics" in Kafka or manually create ',
                    /* @__PURE__ */ jsx("code", { className: "bg-black/40 px-1 rounded", children: data.kafka_topic }),
                    "."
                  ] })
                ] })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-end gap-4", children: /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: processing,
            className: "px-8 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl transition-all font-semibold shadow-[0_0_20px_rgba(99,102,241,0.3)]",
            children: processing ? "Saving Changes..." : "Persist Configuration"
          }
        ) })
      ] })
    ] })
  ] });
}
export {
  PipelineSettingsPage as default
};
