import { define } from "~/utils/core.ts";
import { APICreateMessage, createMessage, Room } from "~/utils/chat.ts";

export const handler = define.handlers({
	async POST(ctx) {
		const { roomId } = ctx.params;

		const data: APICreateMessage = await ctx.req.json();
		const newMessage = await createMessage(roomId, data);

		const channel = new Room(roomId);

		channel.sendMessage(newMessage);
		channel.close();

		return Response.json(newMessage);
	},
});
