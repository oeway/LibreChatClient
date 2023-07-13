from imjoy_rpc.hypha import login, register_rtc_service, connect_to_server
import asyncio
import json
import time
import shortuuid

from langchain.chat_models import ChatOpenAI
from langchain import LLMChain, PromptTemplate
from langchain.memory import ConversationBufferWindowMemory
from langchain.callbacks.base import AsyncCallbackHandler


# load dotenv
from dotenv import load_dotenv
load_dotenv()

SERVER_URL = "https://ai.imjoy.io"

test_story = """
Once upon a time in the charming town of Storyville, there lived a highly curious cat named Whiskers. Whiskers was no ordinary cat; he had a peculiar knack for finding lost items. From misplaced keys to the forgotten old relics of the town, Whiskers found them all. His reputation as the finder of lost things brought him much affection from the townsfolk, but also an unending chain of requests.

One day, Whiskers was approached by a worried little girl named Sophie. With tears in her eyes, she told Whiskers that she had lost her grandmother's locket while playing in the park. This locket was no ordinary piece of jewelry; it contained a picture of her late grandmother, making it invaluable to Sophie.

Moved by her distress, Whiskers set off on the search for the locket. He combed through every inch of the park, scampered up the trees, and investigated every bush. Hours turned into days, but the locket was nowhere to be found. Whiskers felt despair creeping in, something he had never experienced before.

Instead of giving up, Whiskers decided to change his approach. He started asking the other animals in the town for help. The birds offered to provide an aerial view, the squirrels scoured the treetops, and even the usually aloof town dog offered to sniff around.

Together, they launched a search operation, each contributing in their own way. After a long day of exhaustive search, it was the tiny town mouse who found the locket tucked away inside a small hole at the base of an old tree. 

Whiskers returned the precious locket to Sophie, who was overjoyed. The whole town celebrated their success, demonstrating the power of unity and perseverance. From that day on, Whiskers was not just known as the finder of lost things but also as a beloved community hero who knew the power of asking for help and working together. This adventure was a heartwarming testament to the fact that sometimes, even the smallest creatures could make the biggest difference.
"""

template = """Assistant is a large language model trained by OpenAI.

Assistant is designed to be able to assist with a wide range of tasks, from answering simple questions to providing in-depth explanations and discussions on a wide range of topics. As a language model, Assistant is able to generate human-like text based on the input it receives, allowing it to engage in natural-sounding conversations and provide responses that are coherent and relevant to the topic at hand.

Assistant is constantly learning and improving, and its capabilities are constantly evolving. It is able to process and understand large amounts of text, and can use this knowledge to provide accurate and informative responses to a wide range of questions. Additionally, Assistant is able to generate its own text based on the input it receives, allowing it to engage in discussions and provide explanations and descriptions on a wide range of topics.

Overall, Assistant is a powerful tool that can help with a wide range of tasks and provide valuable insights and information on a wide range of topics. Whether you need help with a specific question or just want to have a conversation about a particular topic, Assistant is here to assist.

{history}
Human: {human_input}
Assistant:"""

prompt = PromptTemplate(input_variables=["history", "human_input"], template=template)

class MyCustomHandler(AsyncCallbackHandler):
    def __init__(self, append_message, debounce_time=0.2) -> None:
        super().__init__()
        self.append_message = append_message
        self._accumulated_output = ""
        self._debounce_time = debounce_time
        self._debounce_task = None

    async def on_llm_start(self, *args, **kwargs):
        self._accumulated_output = ""
    
    async def on_llm_end(self, *args, **kwargs):
        if self._debounce_task:
            self._debounce_task.cancel()

    async def on_llm_new_token(self, token, **kwargs):
        self._accumulated_output += token
        await self.debounce_flush()

    async def debounce_flush(self):
        if self._debounce_task:
            self._debounce_task.cancel()

        async def delayed_func():
            await asyncio.sleep(self._debounce_time)
            await self.append_message(self._accumulated_output)
            self._accumulated_output = ""

        self._debounce_task = asyncio.create_task(delayed_func())

plugin = {
    "inputs": [
        {
            "plugin": "Web Browser",
            "input": "how to develop plugins for ChatGPT",
            "thought": "The user is asking for guidance on how to develop plugins for ChatGPT.",
            "inputStr": "{\n\tplugin: Web Browser\n\tinput: how to develop plugins for ChatGPT\n\tthought: The user is asking for guidance on how to develop plugins for ChatGPT.\n}"
        },
        {
            "plugin": "Web Browser",
            "input": "developing plugins for ChatGPT",
            "thought": "The web-browser tool requires a valid URL as input. Let me try again with a different input.",
            "inputStr": "{\n\tplugin: Web Browser\n\tinput: developing plugins for ChatGPT\n\tthought: The web-browser tool requires a valid URL as input. Let me try again with a different input.\n}"
        },
    ],
    "latest": "Self Reflection",
    "outputs": "Input: how to develop plugins for ChatGPT\nOutput: TypeError [ERR_INVALID_URL]: Invalid URL\n---\nInput: developing plugins for ChatGPT\nOutput: TypeError [ERR_INVALID_URL]: Invalid URL\n---\n"
}

async def start_bot():

    async def chat(question, init=None, stream_output=None, chat_history=None, debug=False, context=None):
        # if context['user']['id'] != 'github|478667':
        #     raise Exception("You are not allowed to chat with this bot.")
        if debug:
            conversation_id = "bd448ecf-bbf6-4eaa-9575-8f1629af7069"
            await init(conversation_id)
            for idx in range(0, len(test_story), 100):
                await stream_output(test_story[idx:idx+100], plugin)
            return {'text': test_story, 'plugin': plugin, 'conversation_id': conversation_id}

        conversation_id = shortuuid.uuid()
        await init(conversation_id)
        if chat_history is None:
            chat_history = []
            memory = ConversationBufferWindowMemory( k=2)
            for chat in chat_history:
                memory.save_context({"input": chat["input"]}, {"output": chat["output"]})
        if stream_output is not None:
            callbacks = [MyCustomHandler(stream_output)]
        else:
            callbacks = None
            
        chatgpt_chain = LLMChain(
            llm=ChatOpenAI(streaming=True, temperature=0, callbacks=callbacks),
            prompt=prompt,
            verbose=True,
            memory=memory,
        )
        output = await chatgpt_chain.apredict(
            human_input=question
        )
        return output

    try:
        print("Connecting to server...", flush=True)
        # try to load token from .hypha-token file
        try:
            with open(".hypha-token", "r") as f:
                token_info = json.loads(f.read())
                token = token_info["token"]
            # check if the token is expired
            if time.time() - token_info["time"] > 3600 * 12:
                raise Exception("Token expired")
            try:
                server = await connect_to_server(
                    {"name": "hypha-bot", "server_url": SERVER_URL,"token": token, "webrtc": True}
                )
            except PermissionError:
                raise Exception("Failed to login expired")
        except Exception:
            token = await login({"server_url": SERVER_URL})
            server = await connect_to_server(
                {"name": "hypha-bot", "server_url": SERVER_URL,"token": token, "webrtc": True}
            )
            # write token into .hypha-token file and save the current time as json file
            with open(".hypha-token", "w") as f:
                f.write(json.dumps({"token": token, "time": time.time()}))

        print("Connected to server.", flush=True)

        await server.register_service({
            "name": "ChatBot",
            "id": "hypha-chatbot",
            "config": {
                "visibility": "protected",
                "require_context": True,
                "run_in_executor": True,
            },
            "chat": chat,
        })
        print("Hypha chatbot is ready to chat!", server.config, flush=True)
    
    except Exception as e:
        print(e)
        loop.stop()
        return
    

server_url = "https://ai.imjoy.io"
loop = asyncio.get_event_loop()
task = loop.create_task(start_bot())
loop.run_forever()