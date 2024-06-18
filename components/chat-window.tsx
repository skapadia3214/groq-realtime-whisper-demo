import Markdown from "react-markdown";
import Message from "./messages";

export default function ChatWindow({ messages, handleSubmit, input, handleInputChange, className}) {
    return (
        <div className={`flex flex-col w-full max-w-md py-24 mx-auto stretch ${className}`}>
            {messages.length > 0
                ? messages.map(m => (
                    <Message key={m.id} role={m.role}>
                        <Markdown>{m.content}</Markdown>
                    </Message>
                ))
                : null}

            <form onSubmit={handleSubmit}>
                <input
                    className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 shadow-l"
                    value={input}
                    placeholder="Say something..."
                    onChange={handleInputChange}
                />
            </form>
        </div>
    )
}
