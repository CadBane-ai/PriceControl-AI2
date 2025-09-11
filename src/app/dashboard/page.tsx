"use client";

import { signOut, useSession } from "next-auth/react";
import { useChat } from "ai/react";
import { useState } from "react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [model, setModel] = useState("instruct");
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    body: { model },
  });

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-6">
        <h1 className="text-lg font-semibold">PriceControl AI</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span>Instruct</span>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={model === "thinking"}
                onChange={() =>
                  setModel(model === "instruct" ? "thinking" : "instruct")
                }
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300"></div>
            </label>
            <span>Thinking</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m.id} className="flex gap-4">
              <div
                className={`rounded-lg p-4 ${
                  m.role === "user" ? "bg-blue-500 text-white" : "bg-gray-300"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
        </div>
      </main>
      <footer className="border-t bg-white p-6">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Ask a question..."
            className="w-full resize-none rounded-md border border-gray-300 p-2 pr-16"
          />
          <button
            type="submit"
            className="absolute bottom-2 right-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}