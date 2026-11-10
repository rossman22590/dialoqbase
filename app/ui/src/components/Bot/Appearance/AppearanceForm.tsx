import { Form, FormInstance, Input, Select, notification } from "antd";
import { AppearanceType } from "./types";
import { DbColorPicker } from "../../Common/DbColorPicker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import api from "../../../services/api";
import axios from "axios";
import { SwitchControl } from "../Settings/SettingsControls";
type Props = AppearanceType;

// Antd colour values are either a hex string or a Color object.
export const colorToHex = (value: any): string | undefined =>
  value === undefined || value === null
    ? undefined
    : typeof value === "string"
    ? value
    : `#${value?.toHex?.()}`;

// Quick picks for the visitor bubble, from the mock.
const SWATCHES: [string, string][] = [
  ["Teal", "#0F766E"],
  ["Indigo", "#4F46E5"],
  ["Blue", "#1D4ED8"],
  ["Orange", "#C2410C"],
  ["Pink", "#BE185D"],
  ["Slate", "#334155"],
];

// Registers a whole-object field (as the old wrapper Form.Item did) without
// rendering anything.
const FieldRegistration = (_props: any) => null;

const ColorField = ({
  name,
  label,
  value,
}: {
  name: [string, string];
  label: string;
  value: any;
}) => (
  <Form.Item
    name={name}
    label={<span className="text-xs text-fg-muted">{label}</span>}
    className="mb-0"
    rules={[
      {
        required: true,
        message: "Please pick a color!",
      },
    ]}
  >
    <DbColorPicker format="hex" pickedColor={colorToHex(value)} />
  </Form.Item>
);

export const AppearanceForm = ({
  initialData,
  form,
}: {
  initialData: Props;
  form: FormInstance;
}) => {
  const botBubbleStyle = Form.useWatch("chat_bot_bubble_style", form);
  const humanBubbleStyle = Form.useWatch("chat_human_bubble_style", form);
  const isTTS = Form.useWatch("tts", form);
  const ttsProvider = Form.useWatch("tts_provider", form);
  const params = useParams<{ id: string }>();

  const onFinish = async (values: any) => {
    let data = {
      ...values,
      chat_bot_bubble_style: {
        ...values.chat_bot_bubble_style,
        background_color:
          typeof values.chat_bot_bubble_style.background_color === "string"
            ? values.chat_bot_bubble_style.background_color
            : `#${values.chat_bot_bubble_style.background_color.toHex()}`,
        text_color:
          typeof values.chat_bot_bubble_style.text_color === "string"
            ? values.chat_bot_bubble_style.text_color
            : `#${values.chat_bot_bubble_style.text_color.toHex()}`,
      },
      chat_human_bubble_style: {
        ...values.chat_human_bubble_style,
        background_color:
          typeof values.chat_human_bubble_style.background_color === "string"
            ? values.chat_human_bubble_style.background_color
            : `#${values.chat_human_bubble_style.background_color.toHex()}`,
        text_color:
          typeof values.chat_human_bubble_style.text_color === "string"
            ? values.chat_human_bubble_style.text_color
            : `#${values.chat_human_bubble_style.text_color.toHex()}`,
      },
    };

    const response = await api.post(`/bot/appearance/${params.id}`, data);
    return response.data;
  };

  const client = useQueryClient();

  const { mutate: updateAppearance, isLoading: isUpdatingAppearance } =
    useMutation(onFinish, {
      onSuccess: () => {
        client.invalidateQueries(["getBotAppearance", params.id]);
        notification.success({
          message: "Success",
          description: "Bot appearance updated successfully",
        });
      },
      onError: (e: any) => {
        if (axios.isAxiosError(e)) {
          const message = e.response?.data?.message || "Something went wrong";
          notification.error({
            message: "Error",
            description: message,
          });
          return;
        }

        notification.error({
          message: "Error",
          description: "Something went wrong",
        });
      },
    });

  const humanBg = (colorToHex(humanBubbleStyle?.background_color) || "")
    .toLowerCase();

  return (
    <Form
      requiredMark={false}
      initialValues={{
        ...initialData.data,
      }}
      layout="vertical"
      form={form}
      onFinish={updateAppearance}
      className="flex flex-col gap-[22px] [&_.ant-form-item]:mb-0"
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="m-0 text-2xl font-semibold tracking-tight text-fg">
            Appearance
          </h1>
          <p className="m-0 mt-1.5 text-sm text-fg-muted">
            How the chat looks on your site and in shared links.
          </p>
        </div>
        <button
          type="submit"
          disabled={isUpdatingAppearance}
          className="ui-btn-primary"
        >
          {isUpdatingAppearance ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Form.Item
          rules={[
            {
              required: true,
              message: "Please input your Bot Name!",
            },
          ]}
          label="Bot name"
          name="bot_name"
        >
          <Input size="large" type="text" />
        </Form.Item>

        <Form.Item
          rules={[
            {
              required: true,
              message: "Please input your Greeting Message!",
            },
          ]}
          label="Greeting message"
          name="first_message"
        >
          <Input size="large" />
        </Form.Item>
      </div>

      <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
        <legend className="ui-label mb-2.5">Visitor bubble color</legend>
        <div className="flex flex-wrap gap-2.5">
          {SWATCHES.map(([name, hex]) => {
            const on = humanBg === hex.toLowerCase();
            return (
              <button
                key={hex}
                type="button"
                aria-label={name}
                aria-pressed={on}
                onClick={() =>
                  form.setFieldsValue({
                    chat_human_bubble_style: {
                      background_color: hex,
                      text_color: "#ffffff",
                    },
                  })
                }
                className="h-9 w-9 cursor-pointer rounded-full border-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                style={{
                  background: hex,
                  boxShadow: on
                    ? `0 0 0 2px rgb(var(--c-canvas)), 0 0 0 4px ${hex}`
                    : "none",
                }}
              />
            );
          })}
        </div>
        <p className="ui-help m-0">
          Sets your visitors' bubbles to this color with white text. Fine-tune
          every color below.
        </p>
      </fieldset>

      <Form.Item name="chat_bot_bubble_style" noStyle>
        <FieldRegistration />
      </Form.Item>
      <Form.Item name="chat_human_bubble_style" noStyle>
        <FieldRegistration />
      </Form.Item>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <fieldset className="m-0 flex flex-col gap-2.5 rounded-xl border border-line px-4 py-3">
          <legend className="ui-label px-1">Bot bubble</legend>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <ColorField
              name={["chat_bot_bubble_style", "background_color"]}
              label="Background"
              value={botBubbleStyle?.background_color}
            />
            <ColorField
              name={["chat_bot_bubble_style", "text_color"]}
              label="Text"
              value={botBubbleStyle?.text_color}
            />
          </div>
        </fieldset>
        <fieldset className="m-0 flex flex-col gap-2.5 rounded-xl border border-line px-4 py-3">
          <legend className="ui-label px-1">Visitor bubble</legend>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <ColorField
              name={["chat_human_bubble_style", "background_color"]}
              label="Background"
              value={humanBubbleStyle?.background_color}
            />
            <ColorField
              name={["chat_human_bubble_style", "text_color"]}
              label="Text"
              value={humanBubbleStyle?.text_color}
            />
          </div>
        </fieldset>
      </div>

      <section className="flex flex-col gap-3 rounded-xl border border-line px-4 py-3.5">
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="m-0 text-sm font-medium text-fg">
              Read answers aloud
            </p>
            <p className="m-0 mt-0.5 text-[13px] text-fg-muted">
              Adds a speaker button to each answer.
            </p>
          </div>
          <Form.Item name="tts" valuePropName="checked" noStyle>
            <SwitchControl label="Read answers aloud" />
          </Form.Item>
        </div>

        {isTTS && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Form.Item
              rules={[
                {
                  required: true,
                  message: "Please select a voice provider!",
                },
              ]}
              label="Provider"
              name="tts_provider"
            >
              <Select
                placeholder="Select a TTS provider"
                options={[
                  {
                    label: "Eleven Labs",
                    value: "eleven_labs",
                  },
                  {
                    label: "OpenAI",
                    value: "openai",
                  },
                ]}
              />
            </Form.Item>
            {ttsProvider === "openai" && (
              <Form.Item
                name="tts_model"
                label="Model"
                rules={[
                  {
                    required: true,
                    message: "Please select a TTS model!",
                  },
                ]}
              >
                <Select
                  placeholder="Select a TTS model"
                  options={initialData.tts_data.openai.models}
                />
              </Form.Item>
            )}

            <Form.Item name="tts_voice" label="Voice">
              <Select
                placeholder="Select a TTS voice"
                options={
                  ttsProvider === "eleven_labs"
                    ? initialData.tts_data.eleven_labs.voices
                    : initialData.tts_data.openai.voices
                }
              />
            </Form.Item>
          </div>
        )}
      </section>
    </Form>
  );
};
