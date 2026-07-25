import assert from "node:assert/strict";
import test from "node:test";
import promptLeverage from "../extensions/prompt-leverage.ts";

type Handler = (event: any, context: any) => Promise<any> | any;

function loadHandlers(): Map<string, Handler> {
  const handlers = new Map<string, Handler>();
  promptLeverage({
    on(event: string, handler: Handler) {
      handlers.set(event, handler);
    },
  } as any);
  return handlers;
}

test("augments model context without rewriting raw user input", async () => {
  const handlers = loadHandlers();
  assert.equal(handlers.has("input"), false);

  const handler = handlers.get("context");
  assert.ok(handler);

  const messages = [
    { role: "user", content: "Earlier substantive request", timestamp: 1 },
    { role: "assistant", content: [], timestamp: 2 },
    { role: "user", content: "Fix the broken prompt leverage behavior", timestamp: 3 },
  ];
  const result = await handler({ type: "context", messages }, {});

  assert.equal(messages[2].content, "Fix the broken prompt leverage behavior");
  assert.equal(result.messages[0].content, "Earlier substantive request");
  assert.match(result.messages[2].content, /^Objective:\n/);
  assert.match(result.messages[2].content, /Fix the broken prompt leverage behavior/);
});

test("preserves images while augmenting text content", async () => {
  const handler = loadHandlers().get("context");
  assert.ok(handler);

  const image = { type: "image", data: "abc", mimeType: "image/png" };
  const messages = [{
    role: "user",
    content: [{ type: "text", text: "Review this production interface carefully" }, image],
    timestamp: 1,
  }];
  const result = await handler({ type: "context", messages }, {});

  assert.match(result.messages[0].content[0].text, /^Objective:\n/);
  assert.deepEqual(result.messages[0].content[1], image);
  assert.equal(messages[0].content[0].text, "Review this production interface carefully");
});

test("leaves short and already structured prompts unchanged", async () => {
  const handler = loadHandlers().get("context");
  assert.ok(handler);

  const short = await handler({
    type: "context",
    messages: [{ role: "user", content: "looks good", timestamp: 1 }],
  }, {});
  assert.equal(short, undefined);

  const structuredText = "Objective:\n- Keep this\n\nContext:\n- As written";
  const structured = await handler({
    type: "context",
    messages: [{ role: "user", content: structuredText, timestamp: 1 }],
  }, {});
  assert.equal(structured, undefined);
});
