import {
  UseQueryOptions,
  useQuery,
  useMutation,
  useQueryClient,
  UseMutationResult,
  QueryObserverResult,
} from "@tanstack/react-query";
import * as t from "./types";

// Define a mock response for the data service
const dataService = {
  getUser: () => {
    // Return a mock user object
    return {
      id: "64879ff60f8ecaf400e2dfaf",
      provider: "local",
      email: "wei.ouyang@scilifelab.se",
      name: "Wei OUYANG",
      username: "oeway",
      avatar: null,
      role: "ADMIN",
      emailVerified: false,
      plugins: ["browser", "calculator", "stable-diffusion"],
      createdAt: "2023-06-12T22:45:10.410Z",
      updatedAt: "2023-06-16T08:58:13.421Z",
    };
  },
  deleteConversation: (payload) => {
    return true;
  },
  updateConversation: (payload) => {
    return true;
  },
  clearAllConversations: () => {
    return true;
  },
  getAIEndpoints: () => {
    return {
      azureOpenAI: false,
      openAI: {
        availableModels: [
          "gpt-3.5-turbo",
          "gpt-3.5-turbo-0613",
          "gpt-3.5-turbo-0301",
          "gpt-3.5-turbo-16k",
          "gpt-3.5-turbo-16k-0613",
          "text-davinci-003",
          "gpt-4",
          "gpt-4-0613",
          "gpt-4-32k-0613",
        ],
        userProvide: false,
      },
      google: {
        userProvide: true,
        availableModels: ["chat-bison", "text-bison"],
      },
      bingAI: { userProvide: true },
      chatGPTBrowser: {
        userProvide: false,
        availableModels: [
          "text-davinci-002-render-sha",
          "text-davinci-002-render-sha-mobile",
          "gpt-4",
          "gpt-4-plugins",
          "gpt-4-browsing",
          "gpt-4-mobile",
        ],
      },
      gptPlugins: {
        availableModels: ["gpt-4", "gpt-3.5-turbo", "gpt-3.5-turbo-0301"],
        availableTools: [
          {
            name: "Google",
            pluginKey: "google",
            description:
              "Use Google Search to find information about the weather, news, sports, and more.",
            icon: "https://i.imgur.com/SMmVkNB.png",
            authConfig: [
              {
                authField: "GOOGLE_CSE_ID",
                label: "Google CSE ID",
                description:
                  "This is your Google Custom Search Engine ID. For instructions on how to obtain this, see <a href='https://github.com/danny-avila/chatgpt-clone/blob/main/guides/GOOGLE_SEARCH.md'>Our Docs</a>.",
              },
              {
                authField: "GOOGLE_API_KEY",
                label: "Google API Key",
                description:
                  "This is your Google Custom Search API Key. For instructions on how to obtain this, see <a href='https://github.com/danny-avila/chatgpt-clone/blob/main/guides/GOOGLE_SEARCH.md'>Our Docs</a>.",
              },
            ],
          },
          {
            name: "Wolfram",
            pluginKey: "wolfram",
            description:
              "Access computation, math, curated knowledge & real-time data through Wolfram|Alpha and Wolfram Language.",
            icon: "https://www.wolframcdn.com/images/icons/Wolfram.png",
            authConfig: [
              {
                authField: "WOLFRAM_APP_ID",
                label: "Wolfram App ID",
                description:
                  "An AppID must be supplied in all calls to the Wolfram|Alpha API. You can get one by registering at <a href='http://products.wolframalpha.com/api/'>Wolfram|Alpha</a> and going to the <a href='https://developer.wolframalpha.com/portal/myapps/'>Developer Portal</a>.",
              },
            ],
          },
          {
            name: "Browser",
            pluginKey: "browser",
            description: "Scrape and summarize webpage data",
            icon: "/assets/web-browser.png",
            authConfig: [
              {
                authField: "OPENAI_API_KEY",
                label: "OpenAI API Key",
                description: "Browser makes use of OpenAI embeddings",
              },
            ],
          },
          {
            name: "Serpapi",
            pluginKey: "serpapi",
            description:
              "SerpApi is a real-time API to access search engine results.",
            icon: "https://i.imgur.com/5yQHUz4.png",
            authConfig: [
              {
                authField: "SERPAPI_API_KEY",
                label: "Serpapi Private API Key",
                description:
                  "Private Key for Serpapi. Register at <a href='https://serpapi.com/'>Serpapi</a> to obtain a private key.",
              },
            ],
          },
          {
            name: "DALL-E",
            pluginKey: "dall-e",
            description:
              "Create realistic images and art from a description in natural language",
            icon: "https://i.imgur.com/u2TzXzH.png",
            authConfig: [
              {
                authField: "DALLE_API_KEY",
                label: "OpenAI API Key",
                description:
                  "You can use DALL-E with your API Key from OpenAI.",
              },
            ],
          },
          {
            name: "Calculator",
            pluginKey: "calculator",
            description:
              "Perform simple and complex mathematical calculations.",
            icon: "https://i.imgur.com/RHsSG5h.png",
            isAuthRequired: "false",
            authConfig: [],
          },
          {
            name: "Stable Diffusion",
            pluginKey: "stable-diffusion",
            description:
              "Generate photo-realistic images given any text input.",
            icon: "https://i.imgur.com/Yr466dp.png",
            authConfig: [
              {
                authField: "SD_WEBUI_URL",
                label: "Your Stable Diffusion WebUI API URL",
                description:
                  "You need to provide the URL of your Stable Diffusion WebUI API. For instructions on how to obtain this, see <a href='url'>Our Docs</a>.",
              },
            ],
          },
          {
            name: "Zapier",
            pluginKey: "zapier",
            description:
              "Interact with over 5,000+ apps like Google Sheets, Gmail, HubSpot, Salesforce, and thousands more.",
            icon: "https://cdn.zappy.app/8f853364f9b383d65b44e184e04689ed.png",
            authConfig: [
              {
                authField: "ZAPIER_NLA_API_KEY",
                label: "Zapier API Key",
                description:
                  "You can use Zapier with your API Key from Zapier.",
              },
            ],
          },
        ],
      },
    };
  },
  getPresets: () => {
    return [];
  },
  getAvailablePlugins: () => {
    return [
      {
        name: "Google",
        pluginKey: "google",
        description:
          "Use Google Search to find information about the weather, news, sports, and more.",
        icon: "https://i.imgur.com/SMmVkNB.png",
        authConfig: [
          {
            authField: "GOOGLE_CSE_ID",
            label: "Google CSE ID",
            description:
              "This is your Google Custom Search Engine ID. For instructions on how to obtain this, see <a href='https://github.com/danny-avila/chatgpt-clone/blob/main/guides/GOOGLE_SEARCH.md'>Our Docs</a>.",
          },
          {
            authField: "GOOGLE_API_KEY",
            label: "Google API Key",
            description:
              "This is your Google Custom Search API Key. For instructions on how to obtain this, see <a href='https://github.com/danny-avila/chatgpt-clone/blob/main/guides/GOOGLE_SEARCH.md'>Our Docs</a>.",
          },
        ],
      },
      {
        name: "Wolfram",
        pluginKey: "wolfram",
        description:
          "Access computation, math, curated knowledge & real-time data through Wolfram|Alpha and Wolfram Language.",
        icon: "https://www.wolframcdn.com/images/icons/Wolfram.png",
        authConfig: [
          {
            authField: "WOLFRAM_APP_ID",
            label: "Wolfram App ID",
            description:
              "An AppID must be supplied in all calls to the Wolfram|Alpha API. You can get one by registering at <a href='http://products.wolframalpha.com/api/'>Wolfram|Alpha</a> and going to the <a href='https://developer.wolframalpha.com/portal/myapps/'>Developer Portal</a>.",
          },
        ],
      },
      {
        name: "Browser",
        pluginKey: "browser",
        description: "Scrape and summarize webpage data",
        icon: "/assets/web-browser.png",
        authConfig: [
          {
            authField: "OPENAI_API_KEY",
            label: "OpenAI API Key",
            description: "Browser makes use of OpenAI embeddings",
          },
        ],
        authenticated: true,
      },
      {
        name: "Serpapi",
        pluginKey: "serpapi",
        description:
          "SerpApi is a real-time API to access search engine results.",
        icon: "https://i.imgur.com/5yQHUz4.png",
        authConfig: [
          {
            authField: "SERPAPI_API_KEY",
            label: "Serpapi Private API Key",
            description:
              "Private Key for Serpapi. Register at <a href='https://serpapi.com/'>Serpapi</a> to obtain a private key.",
          },
        ],
      },
      {
        name: "DALL-E",
        pluginKey: "dall-e",
        description:
          "Create realistic images and art from a description in natural language",
        icon: "https://i.imgur.com/u2TzXzH.png",
        authConfig: [
          {
            authField: "DALLE_API_KEY",
            label: "OpenAI API Key",
            description: "You can use DALL-E with your API Key from OpenAI.",
          },
        ],
      },
      {
        name: "Calculator",
        pluginKey: "calculator",
        description: "Perform simple and complex mathematical calculations.",
        icon: "https://i.imgur.com/RHsSG5h.png",
        isAuthRequired: "false",
        authConfig: [],
      },
      {
        name: "Stable Diffusion",
        pluginKey: "stable-diffusion",
        description: "Generate photo-realistic images given any text input.",
        icon: "https://i.imgur.com/Yr466dp.png",
        authConfig: [
          {
            authField: "SD_WEBUI_URL",
            label: "Your Stable Diffusion WebUI API URL",
            description:
              "You need to provide the URL of your Stable Diffusion WebUI API. For instructions on how to obtain this, see <a href='url'>Our Docs</a>.",
          },
        ],
        authenticated: true,
      },
      {
        name: "Zapier",
        pluginKey: "zapier",
        description:
          "Interact with over 5,000+ apps like Google Sheets, Gmail, HubSpot, Salesforce, and thousands more.",
        icon: "https://cdn.zappy.app/8f853364f9b383d65b44e184e04689ed.png",
        authConfig: [
          {
            authField: "ZAPIER_NLA_API_KEY",
            label: "Zapier API Key",
            description: "You can use Zapier with your API Key from Zapier.",
          },
        ],
      },
    ];
  },
  getConversationById: (id) => {
    // Return a mock conversation object for a given ID
    return [
      {
        plugin: null,
        _id: "64b0999c576b690637da6d89",
        messageId: "62ed2fa3-b816-4250-84ea-6eefe74b502d",
        __v: 0,
        cancelled: false,
        conversationId: "2d40c7e2-495d-4899-b5e4-7f0d1f77a4b8",
        createdAt: "2023-07-14T00:41:00.573Z",
        error: false,
        isCreatedByUser: false,
        model: null,
        parentMessageId: "4e89f834-dd6d-416b-abbd-c265934cd0d5",
        sender: "ChatGPT",
        text: "Great, let's get started. Let's do it one endpoint at a time. Please provide me with the first endpoint and the mock response you'd like to use.",
        unfinished: false,
        updatedAt: "2023-07-14T00:41:01.933Z",
      },
    ];
  },
  getMessagesByConvoId: (id) => {
    // Return a mock array of messages for a given conversation ID
    return [
      { id: 1, text: "Hello" },
      { id: 2, text: "Hi" },
    ];
  },
  getSearchEnabled: () => {
    return true;
  },
  getConversations: (pageNumber) => {
    return {
      conversations: [
        {
          _id: "64b0999d576b690637da6d92",
          conversationId: "2d40c7e2-495d-4899-b5e4-7f0d1f77a4b8",
          user: "64879ff60f8ecaf400e2dfaf",
          __v: 0,
          agentOptions: null,
          bingConversationId: null,
          chatGptLabel: null,
          clientId: null,
          context: null,
          conversationSignature: null,
          createdAt: "2023-07-14T00:41:01.947Z",
          endpoint: "chatGPTBrowser",
          examples: [],
          frequency_penalty: 0,
          invocationId: 1,
          jailbreak: false,
          jailbreakConversationId: null,
          maxOutputTokens: 1024,
          messages: ["64b0999c576b690637da6d89"],
          model: null,
          modelLabel: null,
          presence_penalty: 0,
          promptPrefix: null,
          systemMessage: null,
          temperature: 1,
          title: "Creating Mock DataService",
          toneStyle: null,
          topK: 40,
          topP: 0.95,
          top_p: 1,
          updatedAt: "2023-07-14T00:41:04.334Z",
        },
      ],
      pages: 1,
      pageNumber: "1",
      pageSize: 1,
    };
  },
};

export enum QueryKeys {
  messages = "messsages",
  allConversations = "allConversations",
  conversation = "conversation",
  searchEnabled = "searchEnabled",
  user = "user",
  endpoints = "endpoints",
  presets = "presets",
  searchResults = "searchResults",
  tokenCount = "tokenCount",
  availablePlugins = "availablePlugins",
}

export const useAbortRequestWithMessage = (): UseMutationResult<
  void,
  Error,
  { endpoint: string; abortKey: string; message: string }
> => {
  return useMutation(({ endpoint, abortKey, message }) =>
    dataService.abortRequestWithMessage(endpoint, abortKey, message)
  );
};

// Replace dataService.getUser() with the mock response
export const useGetUserQuery = (
  config?: UseQueryOptions<t.TUser>
): QueryObserverResult<t.TUser> => {
  return useQuery<t.TUser>([QueryKeys.user], () => dataService.getUser(), {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: false,
    ...config,
  });
};

// Replace dataService.getMessagesByConvoId(id) with the mock response
export const useGetMessagesByConvoId = (
  id: string,
  config?: UseQueryOptions<t.TMessage[]>
): QueryObserverResult<t.TMessage[]> => {
  return useQuery<t.TMessage[]>(
    [QueryKeys.messages, id],
    () => dataService.getMessagesByConvoId(id),
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      ...config,
    }
  );
};

export const useGetConversationByIdQuery = (
  id: string,
  config?: UseQueryOptions<t.TConversation>
): QueryObserverResult<t.TConversation> => {
  return useQuery<t.TConversation>(
    [QueryKeys.conversation, id],
    () => dataService.getConversationById(id),
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      ...config,
    }
  );
};

//This isn't ideal because its just a query and we're using mutation, but it was the only way
//to make it work with how the Chat component is structured
export const useGetConversationByIdMutation = (
  id: string
): UseMutationResult<t.TConversation> => {
  const queryClient = useQueryClient();
  return useMutation(() => dataService.getConversationById(id), {
    // onSuccess: (res: t.TConversation) => {
    onSuccess: () => {
      queryClient.invalidateQueries([QueryKeys.conversation, id]);
    },
  });
};

export const useUpdateConversationMutation = (
  id: string
): UseMutationResult<
  t.TUpdateConversationResponse,
  unknown,
  t.TUpdateConversationRequest,
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation(
    (payload: t.TUpdateConversationRequest) =>
      dataService.updateConversation(payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QueryKeys.conversation, id]);
        queryClient.invalidateQueries([QueryKeys.allConversations]);
      },
    }
  );
};

export const useDeleteConversationMutation = (
  id?: string
): UseMutationResult<
  t.TDeleteConversationResponse,
  unknown,
  t.TDeleteConversationRequest,
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation(
    (payload: t.TDeleteConversationRequest) =>
      dataService.deleteConversation(payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QueryKeys.conversation, id]);
        queryClient.invalidateQueries([QueryKeys.allConversations]);
      },
    }
  );
};

export const useClearConversationsMutation = (): UseMutationResult<unknown> => {
  const queryClient = useQueryClient();
  return useMutation(() => dataService.clearAllConversations(), {
    onSuccess: () => {
      queryClient.invalidateQueries([QueryKeys.allConversations]);
    },
  });
};

export const useGetConversationsQuery = (
  pageNumber: string,
  config?: UseQueryOptions<t.TConversation[]>
): QueryObserverResult<t.TConversation[]> => {
  return useQuery<t.TConversation[]>(
    [QueryKeys.allConversations, pageNumber],
    () => dataService.getConversations(pageNumber),
    {
      refetchOnReconnect: false,
      refetchOnMount: false,
      retry: 1,
      ...config,
    }
  );
};

export const useGetSearchEnabledQuery = (
  config?: UseQueryOptions<boolean>
): QueryObserverResult<boolean> => {
  return useQuery<boolean>(
    [QueryKeys.searchEnabled],
    () => dataService.getSearchEnabled(),
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      ...config,
    }
  );
};

export const useGetEndpointsQuery = (): QueryObserverResult<t.TEndpoints> => {
  return useQuery([QueryKeys.endpoints], () => dataService.getAIEndpoints(), {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
};

export const useCreatePresetMutation = (): UseMutationResult<
  t.TPreset[],
  unknown,
  t.TPreset,
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation(
    (payload: t.TPreset) => dataService.createPreset(payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QueryKeys.presets]);
      },
    }
  );
};

export const useUpdatePresetMutation = (): UseMutationResult<
  t.TPreset[],
  unknown,
  t.TPreset,
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation(
    (payload: t.TPreset) => dataService.updatePreset(payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QueryKeys.presets]);
      },
    }
  );
};

export const useGetPresetsQuery = (
  config?: UseQueryOptions<t.TPreset[]>
): QueryObserverResult<t.TPreset[], unknown> => {
  return useQuery<t.TPreset[]>(
    [QueryKeys.presets],
    () => dataService.getPresets(),
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      ...config,
    }
  );
};

export const useDeletePresetMutation = (): UseMutationResult<
  t.TPreset[],
  unknown,
  t.TPreset | object,
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation(
    (payload: t.TPreset | object) => dataService.deletePreset(payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QueryKeys.presets]);
      },
    }
  );
};

export const useSearchQuery = (
  searchQuery: string,
  pageNumber: string,
  config?: UseQueryOptions<t.TSearchResults>
): QueryObserverResult<t.TSearchResults> => {
  return useQuery<t.TSearchResults>(
    [QueryKeys.searchResults, pageNumber, searchQuery],
    () => dataService.searchConversations(searchQuery, pageNumber),
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      ...config,
    }
  );
};

export const useUpdateTokenCountMutation = (): UseMutationResult<
  t.TUpdateTokenCountResponse,
  unknown,
  string,
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation((text: string) => dataService.updateTokenCount(text), {
    onSuccess: () => {
      queryClient.invalidateQueries([QueryKeys.tokenCount]);
    },
  });
};

export const useLoginUserMutation = (): UseMutationResult<
  t.TLoginResponse,
  unknown,
  t.TLoginUser,
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation((payload: t.TLoginUser) => dataService.login(payload), {
    onSuccess: () => {
      queryClient.invalidateQueries([QueryKeys.user]);
    },
  });
};

export const useRegisterUserMutation = (): UseMutationResult<
  unknown,
  unknown,
  t.TRegisterUser,
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation(
    (payload: t.TRegisterUser) => dataService.register(payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QueryKeys.user]);
      },
    }
  );
};

export const useLogoutUserMutation = (): UseMutationResult<unknown> => {
  const queryClient = useQueryClient();
  return useMutation(() => dataService.logout(), {
    onSuccess: () => {
      queryClient.invalidateQueries([QueryKeys.user]);
    },
  });
};

export const useRefreshTokenMutation = (): UseMutationResult<
  t.TRefreshTokenResponse,
  unknown,
  unknown,
  unknown
> => {
  return useMutation(() => dataService.refreshToken(), {});
};
export const useRequestPasswordResetMutation =
  (): UseMutationResult<unknown> => {
    return useMutation((payload: t.TRequestPasswordReset) =>
      dataService.requestPasswordReset(payload)
    );
  };

export const useResetPasswordMutation = (): UseMutationResult<unknown> => {
  return useMutation((payload: t.TResetPassword) =>
    dataService.resetPassword(payload)
  );
};

export const useAvailablePluginsQuery = (): QueryObserverResult<
  t.TPlugin[]
> => {
  return useQuery<t.TPlugin[]>(
    [QueryKeys.availablePlugins],
    () => dataService.getAvailablePlugins(),
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    }
  );
};

export const useUpdateUserPluginsMutation = (): UseMutationResult<
  t.TUser,
  unknown,
  t.TUpdateUserPlugins,
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation(
    (payload: t.TUpdateUserPlugins) => dataService.updateUserPlugins(payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QueryKeys.user]);
      },
    }
  );
};
