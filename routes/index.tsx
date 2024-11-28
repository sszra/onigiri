import { define } from "~/utils/core.ts";
import { Chat } from "~/islands/Chat.tsx";
import { retrieveMessages } from "~/utils/chat.ts";
import { page } from "fresh";

export const handler = define.handlers({
	async GET(_ctx) {
		const roomId = "0";
		const messages = await retrieveMessages(roomId);

		return page({ messages, roomId });
	},
});

export default define.page<typeof handler>(({ data }) => {
	return (
		<div class="flex h-dvh px-4">
			<Chat initialMessages={data.messages} roomId={data.roomId} />
		</div>
	);
});
