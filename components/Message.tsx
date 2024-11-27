import { APIMessage } from "~/utils/chat.ts";

export function Message({ data }: { data: APIMessage }) {
	return (
		<div class="bg-slate-100 p-3">
			<p>{data.content}</p>
		</div>
	);
}
