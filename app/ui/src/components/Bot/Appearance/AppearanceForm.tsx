import {
  Form,
  FormInstance,
  Input,
  Select,
  Switch,
  notification,
} from "antd";
import { AppearanceType } from "./types";
import { DbColorPicker } from "../../Common/DbColorPicker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import api from "../../../services/api";
import axios from "axios";
import { CardBody, CardFooter } from "../../ui";
type Props = AppearanceType;

const SectionTitle = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="mb-4 border-t border-line pt-6 first:border-t-0 first:pt-0">
    <h3 className="text-sm font-semibold tracking-tight text-fg">{title}</h3>
    <p className="mt-0.5 text-xs leading-relaxed text-fg-subtle">
      {description}
    </p>
  </div>
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

  return (
    <Form
      requiredMark={false}
      initialValues={{
        ...initialData.data,
      }}
      layout="vertical"
      form={form}
      onFinish={updateAppearance}
    >
      <CardBody>
      <SectionTitle
        title="Identity"
        description="What your bot is called and how it says hello."
      />
      <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
      <Form.Item
        rules={[
          {
            required: true,
            message: "Please input your Bot Name!",
          },
        ]}
        label="Bot Name"
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
        label="Greeting Message"
        name="first_message"
      >
        <Input size="large" />
      </Form.Item>
      </div>

      <SectionTitle
        title="Style"
        description="Background and text colours for each chat bubble."
      />

      {/* <Form.Item
        rules={[
          {
            required: true,
            message: "Please pick a color!",
          },
        ]}
        name="background_color"
        label="Background Color"
      >
        <DbColorPicker
          pickedColor={
            typeof colorHex === "string" ? colorHex : `#${colorHex?.toHex()}`
          }
        />
      </Form.Item> */}

      <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
      <Form.Item label="Bot bubble style" name="chat_bot_bubble_style">
        <div className="flex flex-row flex-wrap justify-normal gap-x-6 rounded-xl border border-line bg-surface-2/60 px-4 pt-3 [&_.ant-form-item]:mb-3">
          <Form.Item
            name={["chat_bot_bubble_style", "background_color"]}
            label={<span className="text-xs text-fg-muted">Background</span>}
            rules={[
              {
                required: true,
                message: "Please pick a color!",
              },
            ]}
          >
            <DbColorPicker
              format="hex"
              pickedColor={
                typeof botBubbleStyle?.background_color === "string"
                  ? botBubbleStyle?.background_color
                  : `#${botBubbleStyle?.background_color?.toHex()}`
              }
            />
          </Form.Item>

          <Form.Item
            name={["chat_bot_bubble_style", "text_color"]}
            label={<span className="text-xs text-fg-muted">Text</span>}
            rules={[
              {
                required: true,
                message: "Please pick a color!",
              },
            ]}
          >
            <DbColorPicker
              pickedColor={
                typeof botBubbleStyle?.text_color === "string"
                  ? botBubbleStyle?.text_color
                  : `#${botBubbleStyle?.text_color?.toHex()}`
              }
            />
          </Form.Item>
        </div>
      </Form.Item>

      <Form.Item label="Human bubble style" name="chat_human_bubble_style">
        <div className="flex flex-row flex-wrap justify-normal gap-x-6 rounded-xl border border-line bg-surface-2/60 px-4 pt-3 [&_.ant-form-item]:mb-3">
          <Form.Item
            name={["chat_human_bubble_style", "background_color"]}
            label={<span className="text-xs text-fg-muted">Background</span>}
            rules={[
              {
                required: true,
                message: "Please pick a color!",
              },
            ]}
          >
            <DbColorPicker
              pickedColor={
                typeof humanBubbleStyle?.background_color === "string"
                  ? humanBubbleStyle?.background_color
                  : `#${humanBubbleStyle?.background_color?.toHex()}`
              }
            />
          </Form.Item>

          <Form.Item
            name={["chat_human_bubble_style", "text_color"]}
            label={<span className="text-xs text-fg-muted">Text</span>}
            rules={[
              {
                required: true,
                message: "Please pick a color!",
              },
            ]}
          >
            <DbColorPicker
              pickedColor={
                typeof humanBubbleStyle?.text_color === "string"
                  ? humanBubbleStyle?.text_color
                  : `#${humanBubbleStyle?.text_color?.toHex()}`
              }
            />
          </Form.Item>
        </div>
      </Form.Item>

      </div>

      <SectionTitle
        title="Text to Speech (TTS) Settings"
        description="Let visitors listen to your bot's replies."
      />

      <Form.Item label="Enable TTS" name="tts" valuePropName="checked">
        <Switch />
      </Form.Item>

      {isTTS && (
        <>
          <Form.Item
            rules={[
              {
                required: true,
                message: "Please select a voice provider!",
              },
            ]}
            label="TTS Provider"
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
              label="TTS Model"
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

          <Form.Item name="tts_voice" label="TTS Voice">
            <Select
              placeholder="Select a TTS voice"
              options={
                ttsProvider === "eleven_labs"
                  ? initialData.tts_data.eleven_labs.voices
                  : initialData.tts_data.openai.voices
              }
            />
          </Form.Item>
        </>
      )}

      </CardBody>
      <CardFooter>
        <button
          type="submit"
          disabled={isUpdatingAppearance}
          className="ui-btn-primary"
        >
          {isUpdatingAppearance ? "Saving..." : "Save Changes"}
        </button>
      </CardFooter>
    </Form>
  );
};
