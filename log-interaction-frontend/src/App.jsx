import React from "react";
import InteractionForm from "./components/InteractionForm";
import ChatPanel from "./components/ChatPanel";
import InteractionList from "./components/InteractionList";

export default function App() {
  return (
    <div className="min-h-screen p-6">
      <header className="max-w-6xl mx-auto mb-6">
        <h1 className="text-2xl font-semibold mb-1">Log HCP Interaction</h1>
        <p className="text-sm text-gray-500">
          Capture structured interaction details or log via AI chat.
        </p>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-12 gap-5">
        {/* Left: form */}
        <section className="col-span-8">
          <div className="bg-panel rounded-xl shadow-sm border border-borderLight p-5">
            <InteractionForm />
          </div>
        </section>

        {/* Right: AI assistant chat */}
        <aside className="col-span-4">
          <div className="bg-aiPanel rounded-xl shadow-sm border border-borderLight p-5 h-[600px] flex flex-col">
            <ChatPanel />
          </div>
        </aside>

        {/* Full-width interaction list */}
        <section className="col-span-12 mt-4">
          <div className="bg-panel rounded-xl shadow-sm border border-borderLight p-4">
            <InteractionList />
          </div>
        </section>
      </main>
    </div>
  );
}

