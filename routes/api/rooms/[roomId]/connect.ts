import { define } from "~/utils/core.ts";
import { Room } from "~/utils/chat.ts";

export const handler = define.handlers({
	GET(ctx) {
		const { roomId } = ctx.params;

		const channel = new Room(roomId);

		const stream = new ReadableStream({
			start(controller) {
				channel.onMessage((message) => {
					controller.enqueue(`data: ${JSON.stringify(message)}\n\n`);
				});
			},
			cancel() {
				channel.close();
			},
		});

		return new Response(stream.pipeThrough(new TextEncoderStream()), {
			headers: {
				"content-type": "text/event-stream",
			},
		});
	},
});
