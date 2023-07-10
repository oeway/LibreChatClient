from imjoy_rpc.hypha import login, connect_to_server
import asyncio

from langchain.chat_models import ChatOpenAI
from langchain import LLMChain, PromptTemplate
from langchain.memory import ConversationBufferWindowMemory
from langchain.callbacks.base import BaseCallbackHandler
from langchain.callbacks.streaming_stdout_final_only import (
    FinalStreamingStdOutCallbackHandler,
)

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

class MyCustomHandler(BaseCallbackHandler):
    def __init__(self, append_message) -> None:
        super().__init__()
        self.append_message = append_message

    def on_llm_new_token(self, token, **kwargs):
        self.append_message(token)


async def start_bot():

    async def chat(question, append_message=None, chat_history=None, debug=False, context=None):
        # if context['user']['id'] != 'github|478667':
        #     raise Exception("You are not allowed to chat with this bot.")
        if debug:
            for token in test_story:
                await append_message(token)
            return test_story

        if chat_history is None:
            chat_history = []
            memory = ConversationBufferWindowMemory( k=2)
            for chat in chat_history:
                memory.save_context({"input": chat["input"]}, {"output": chat["output"]})
        if append_message is not None:
            callbacks = [MyCustomHandler(append_message)]
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

    # try:
    #     print(await chat("Hello", append_message=print))
    # except Exception as e:
    #     print(e)
    # finally:
    #     loop = asyncio.get_event_loop()
    #     loop.stop()
    #     return

    token = await login({"server_url": SERVER_URL})
    server = await connect_to_server(
        {"name": "hypha-bot", "server_url": SERVER_URL,"token": token}
    )
    print(server.config)

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
    print("Hypha chatbot is ready to chat!", server.config)
    
    

server_url = "https://ai.imjoy.io"
loop = asyncio.get_event_loop()
task = loop.create_task(start_bot())
loop.run_forever()