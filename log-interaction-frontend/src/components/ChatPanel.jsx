import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { agentLog } from "../features/interactionsSlice";

export default function ChatPanel() {
  const dispatch = useDispatch();
  const [text, setText] = useState("");
  const { agentResult, status } = useSelector((state) => state.interactions);

  const handleLog = async () => {
    if (!text.trim()) return;
    await dispatch(agentLog(text));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="text-sm font-semibold mb-1">AI Assistant</div>
      <div className="text-xs text-gray-500 mb-3">
        Log interaction via chat
      </div>

      <div className="flex-1 bg-white border border-borderLight rounded-lg p-3 overflow-auto text-xs">
        {status === "loading" && (
          <p className="text-gray-400">Thinking with AI...</p>
        )}

        {!agentResult && status !== "loading" && (
          <p className="text-gray-400">
            Log interaction details here (e.g., &quot;Met Dr. Smith, discussed
            Product X efficacy, positive sentiment, shared brochure&quot;) or
            ask for help.
          </p>
        )}

        {agentResult && (
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold mb-1 text-sm">Extracted Data</h4>
              <pre className="bg-gray-50 rounded p-2 overflow-auto text-[11px]">
                {JSON.stringify(agentResult.interaction, null, 2)}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold mb-1 text-sm">
                AI Suggested Follow-ups
              </h4>
              {Array.isArray(agentResult.followups) ? (
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  {agentResult.followups.map((f, idx) => (
                    <li key={idx}>{f}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-xs">
                  {String(agentResult.followups || "")}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3">
        <textarea
          className="w-full border border-borderLight rounded-lg px-3 py-2 text-sm"
          rows={3}
          placeholder='Describe interaction… e.g. "Met Dr. Sharma..."'
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-gray-400">
            Include HCP name, topics, sentiment, and materials.
          </span>
          <button
            onClick={handleLog}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg"

          >
            Log
          </button>
        </div>
      </div>
    </div>
  );
}
