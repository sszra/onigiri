import { useEffect, useReducer, useRef, useState } from "preact/hooks";
import { APIMessage } from "~/utils/chat.ts";
import { Message } from "~/components/Message.tsx";
import { server } from "~/helpers/server.ts";

export function Chat(
	{ initialMessages, roomId }: {
		initialMessages: APIMessage[];
		roomId: string;
	},
) {
	const messagesContainer = useRef<HTMLDivElement>(null);
	const [messages, addMessage] = useReducer<APIMessage[], APIMessage>(
		(messages, message) => [...messages, message],
		initialMessages,
	);
	const [input, setInput] = useState<string>("");

	useEffect(() => {
		const container = messagesContainer.current;

		if (container) {
			container.scrollTop = container.scrollHeight;
		}
	}, [messages.length]);

	useEffect(() => {
		const subscription = server.subscribe(roomId, addMessage);
		return () => subscription.unsubscribe();
	}, []);

	function send() {
		if (input !== "") {
			server.sendMessage(roomId, input);
			setInput("");
		}
	}

	return (
		<div class="flex flex-col w-full">
			<div
				class="flex flex-col overflow-y-auto grow"
				ref={messagesContainer}
			>
				{messages.map((message) => <Message data={message} />)}
			</div>
			<div class="flex items-center bg-slate-200 p-3 gap-2 mb-4 rounded-full">
				<textarea
					class="bg-slate-200 grow py-2 placeholder:text-slate-500 outline-none resize-none"
					placeholder="Write a message.."
					rows={1}
					onInput={(input) => setInput(input.currentTarget.value)}
					value={input}
					onKeyDown={(ctx) => {
						if (ctx.key === "Enter") {
							ctx.preventDefault();
							send();
						}
					}}
				/>
				<button
					class="flex justify-center items-center bg-black rounded-full pl-0.5 size-10 disabled:opacity-50"
					onMouseDown={(event) => event.preventDefault()}
					onClick={send}
					disabled={input === ""}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
					>
						<path
							fill="white"
							d="M18.844 13.483c1.208-.6 1.208-2.367 0-2.966L6.552 4.416c-1.228-.61-2.458.493-2.285 1.72l.54 3.829a1.64 1.64 0 0 0 1.128 1.342c.16.05.55.133 1.012.227c.636.13 4.39.466 4.39.466s-3.754.337-4.39.466c-.461.094-.851.177-1.012.227a1.64 1.64 0 0 0-1.128 1.342l-.54 3.83c-.173 1.226 1.057 2.329 2.285 1.72z"
						/>
					</svg>
				</button>
			</div>
		</div>
	);
}
