import { Button } from "@jahitin/ui";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
	console.log("env", import.meta.env.VITE_TEST);

	return (
		<div>
			<div>ini untuk halaman platform</div>
			<Button label={"Button from UI"} />
		</div>
	);
}
