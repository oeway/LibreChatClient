import { useEffect, useState } from 'react';
import { useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import store from '~/store';
import { useAuthContext } from '~/hooks/AuthContext';
import { v4 } from 'uuid';

export default function MessageHandler() {
  const submission = useRecoilValue(store.submission);
  const setIsSubmitting = useSetRecoilState(store.isSubmitting);
  const setMessages = useSetRecoilState(store.messages);
  const setConversation = useSetRecoilState(store.conversation);
  const resetLatestMessage = useResetRecoilState(store.latestMessage);
  const { token, hypha } = useAuthContext();
  const { refreshConversations } = store.useConversations();
  const [ chatService, setChatService] = useState(null);

  const messageHandler = (data, submission) => {
    const { messages, message, plugin, initialResponse, isRegenerate = false } = submission;

    if (isRegenerate) {
      setMessages([
        ...messages,
        {
          ...initialResponse,
          text: data,
          parentMessageId: message?.overrideParentMessageId,
          messageId: message?.overrideParentMessageId + '_',
          plugin: plugin ? plugin : null,
          submitting: true
          // unfinished: true
        }
      ]);
    } else {
      setMessages([
        ...messages,
        message,
        {
          ...initialResponse,
          text: data,
          parentMessageId: message?.messageId,
          messageId: message?.messageId + '_',
          plugin: plugin ? plugin : null,
          submitting: true
          // unfinished: true
        }
      ]);
    }
  };

  const cancelHandler = (data, submission) => {
    const { messages, isRegenerate = false } = submission;

    const { requestMessage, responseMessage, conversation } = data;

    // update the messages
    if (isRegenerate) {
      setMessages([...messages, responseMessage]);
    } else {
      setMessages([...messages, requestMessage, responseMessage]);
    }
    setIsSubmitting(false);

    // refresh title
    if (requestMessage.parentMessageId == '00000000-0000-0000-0000-000000000000') {
      setTimeout(() => {
        refreshConversations();
      }, 2000);

      // in case it takes too long.
      setTimeout(() => {
        refreshConversations();
      }, 5000);
    }

    setConversation((prevState) => ({
      ...prevState,
      ...conversation
    }));
  };

  const createdHandler = (data, submission) => {
    const { messages, message, initialResponse, isRegenerate = false } = submission;

    if (isRegenerate)
      setMessages([
        ...messages,
        {
          ...initialResponse,
          parentMessageId: message?.overrideParentMessageId,
          messageId: message?.overrideParentMessageId + '_',
          submitting: true
        }
      ]);
    else
      setMessages([
        ...messages,
        message,
        {
          ...initialResponse,
          parentMessageId: message?.messageId,
          messageId: message?.messageId + '_',
          submitting: true
        }
      ]);

    const { conversationId } = message;
    setConversation((prevState) => ({
      ...prevState,
      conversationId
    }));
    resetLatestMessage();
  };

  const finalHandler = (data, submission) => {
    const { messages, isRegenerate = false } = submission;

    const { requestMessage, responseMessage, conversation } = data;

    // update the messages
    if (isRegenerate) {
      setMessages([...messages, responseMessage]);
    } else {
      setMessages([...messages, requestMessage, responseMessage]);
    }
    setIsSubmitting(false);

    // refresh title
    if (requestMessage.parentMessageId == '00000000-0000-0000-0000-000000000000') {
      setTimeout(() => {
        refreshConversations();
      }, 2000);

      // in case it takes too long.
      setTimeout(() => {
        refreshConversations();
      }, 5000);
    }

    setConversation((prevState) => ({
      ...prevState,
      ...conversation
    }));
  };

  const errorHandler = (data, submission) => {
    const { messages, message } = submission;

    console.log('Error:', data);
    const errorResponse = {
      ...data,
      error: true,
      parentMessageId: message?.messageId
    };
    setIsSubmitting(false);
    setMessages([...messages, message, errorResponse]);
    return;
  };
  useEffect(() => {
    if(hypha){
      if(!chatService){
        hypha.getService('hypha-chatbot', true).then(async (svc) => {
          console.log('chat service obtained: ', svc)
          setChatService(svc);
        });
      }
    }
  }, [hypha]);

  useEffect(() => {
    if (submission === null) return;
    if (Object.keys(submission).length === 0) return;

    let { message } = submission;
    if(!chatService) {
      console.error('chat service not ready');
      return;
    }
  
    (async () => {
      try {
        setIsSubmitting(true);
        let accumulatedText = '';
        const responseMessageId = v4();
        console.log('submission===>', submission);
        const response = await chatService.chat(message.text, (conversationId) => {
          const msg =  {
            conversationId,
            isCreatedByUser: true,
            messageId: message.messageId,
            parentMessageId: message.parentMessageId,
            sender: message.sender,
            text: message.text,
          };
          message = {
            ...msg,
            overrideParentMessageId: message?.overrideParentMessageId
          };
          createdHandler(null, { ...submission, message });
          console.log('created', message);
        }, (token, plugin) => {
          accumulatedText = accumulatedText + token;
          console.log('token', token);
          messageHandler(accumulatedText, { ...submission, plugin, message });
        }, null, true)
        const finalResponse = {
          title: 'Improving Code for Flake8',
          final: true,
          conversation: {
          },
          requestMessage: {
            conversationId: response.conversationId,
            isCreatedByUser: true,
            messageId: message.messageId,
            parentMessageId: message.parentMessageId,
            sender: message.sender,
            text: message.text,
          },
          responseMessage: {
            cancelled: false,
            conversationId: response.conversation_id,
            error: false,
            messageId: responseMessageId,
            newMessageId: responseMessageId,
            parentMessageId: message.messageId,
            sender: "ChatGPT",
            text: response.text,
            unfinished: false,
            plugin: response.plugin
          }
        };
        finalHandler(finalResponse, { ...submission, message });
      }
      catch (e) {
        console.log('error in opening conn.');
        errorHandler(e, { ...submission, message });
      }
      finally {
        setIsSubmitting(false);
      }
    })();

    // const events = new SSE(server, {
    //   payload: JSON.stringify(payload),
    //   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    // });

    // events.onmessage = (e) => {
    //   const data = JSON.parse(e.data);

    //   // if (data.final) {
    //   //   finalHandler(data, { ...submission, message });
    //   //   console.log('final', data);
    //   // }
    //   if (data.created) {
    //     message = {
    //       ...data.message,
    //       overrideParentMessageId: message?.overrideParentMessageId
    //     };
    //     createdHandler(data, { ...submission, message });
    //     console.log('created', message);
    //   } else {
    //     let text = data.text || data.response;
    //     let { initial, plugin } = data;
    //     if (initial) console.log(data);

    //     if (data.message) {
    //       messageHandler(text, { ...submission, plugin, message });
    //     }
    //   }
    // };

    // events.onopen = () => console.log('connection is opened');

    // events.oncancel = () => abortConversation(message?.conversationId || submission?.conversationId);

    // events.onerror = function (e) {
    //   console.log('error in opening conn.');
    //   events.close();

    //   const data = JSON.parse(e.data);

    //   errorHandler(data, { ...submission, message });
    // };


    // events.stream();

    return () => {
      // const isCancelled = events.readyState <= 1;
      // events.close();
      // // setSource(null);
      // if (isCancelled) {
      //   const e = new Event('cancel');
      //   events.dispatchEvent(e);
      // }
      // setIsSubmitting(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission]);

  return null;
}
